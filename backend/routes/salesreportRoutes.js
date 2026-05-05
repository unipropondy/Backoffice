const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// ✅ Get company details from database
const getCompanyDetails = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 
        Name,
        Address1_Line1,
        Address1_Line2,
        Address1_Line3,
        Address1_City,
        Address1_State,
        Address1_PostalCode,
        Address1_Telephone1,
        Address1_Telephone2
      FROM UCS.dbo.Organization
    `);

    if (result.recordset[0]) {
      return result.recordset[0];
    }
    return {};
  } catch (err) {
    console.error("Error fetching company:", err);
    return {};
  }
};

const getReportQuery = (params) => {
  const { orderSales, dayEnd, bySales, byItem, fromDate, toDate, category, dishGroup } = params;

  const finalFrom = fromDate;
  const finalTo = toDate;

  const dateFilter = (field) => {
    if (finalFrom && finalTo) {
      return `AND ${field} >= '${finalFrom}' AND ${field} <= '${finalTo} 23:59:59'`;
    }
    return "";
  };

  // ✅ 1. Sales Summary
  if (bySales === "Summary") {
    return {
      query: `
        SELECT 
          CONVERT(VARCHAR, InvoiceDate, 103) AS Date,
          ROUND(SUM(ItemSales), 2) AS Sales,
          ROUND(SUM(FOC), 2) AS FOC,
          ROUND(SUM(Discount), 2) AS Disc,
          ROUND(SUM(SVC), 2) AS SVC,
          ROUND(SUM(Tax), 2) AS [Tax 7%],
          ROUND(SUM(Tips), 2) AS Tips,
          ROUND(SUM(Rnd), 2) AS Rnd,
          ROUND(SUM(ENT), 2) AS ENT,
          ROUND(SUM(Cash), 2) AS Cash,
          ROUND(SUM(Master), 2) AS Master,
          ROUND(SUM(Visa), 2) AS Visa
        FROM vw_Paymodesales
        WHERE InvoiceDate >= '${finalFrom}' 
          AND InvoiceDate <= '${finalTo} 23:59:59'
        GROUP BY CONVERT(VARCHAR, InvoiceDate, 103)
        ORDER BY MIN(InvoiceDate)
      `
    };
  }

  // ✅ 2. By Item - Month
  if (byItem === "Month") {
    let monthQuery = `
      SELECT 
        vw.TotalDetailLineAmount, 
        vw.OrderDateTime, 
        vw.DishName,
        dgm.DishGroupName,
        cm.CategoryName
      FROM UCS.dbo.Vw_MonthwiseSales vw
      LEFT JOIN UCS.dbo.DishMaster dm ON vw.DishName = dm.Name
      LEFT JOIN UCS.dbo.DishGroupMaster dgm ON dm.DishGroupId = dgm.DishGroupId
      LEFT JOIN UCS.dbo.CategoryMaster cm ON dgm.CategoryId = cm.CategoryId
      WHERE vw.OrderDateTime >= '${finalFrom}' 
        AND vw.OrderDateTime <= '${finalTo} 23:59:59'
    `;

    if (category && category !== "") {
      monthQuery += ` AND cm.CategoryName = '${category}'`;
    }

    if (dishGroup && dishGroup !== "") {
      monthQuery += ` AND dgm.DishGroupName = '${dishGroup}'`;
    }

    console.log("Month Query:", monthQuery);
    return { query: monthQuery };
  }

  // ✅ 3. By Item - Qty
  if (byItem === "Qty") {
    let qtyQuery = `
      SELECT 
        DATEPART(YEAR, vw.OrderDateTime) AS Year,
        DATENAME(MONTH, vw.OrderDateTime) AS Month,
        vw.DishName AS Item,
        dgm.DishGroupName,
        CAST(SUM(vw.TotalDetailLineAmount) AS DECIMAL(10,2)) AS Amount
      FROM UCS.dbo.Vw_MonthwiseSales vw
      LEFT JOIN UCS.dbo.DishMaster dm ON vw.DishName = dm.Name
      LEFT JOIN UCS.dbo.DishGroupMaster dgm ON dm.DishGroupId = dgm.DishGroupId
      LEFT JOIN UCS.dbo.CategoryMaster cm ON dgm.CategoryId = cm.CategoryId
      WHERE vw.OrderDateTime >= '${finalFrom}' 
        AND vw.OrderDateTime <= '${finalTo} 23:59:59'
    `;

    if (category && category !== "") {
      qtyQuery += ` AND cm.CategoryName = '${category}'`;
    }

    if (dishGroup && dishGroup !== "") {
      qtyQuery += ` AND dgm.DishGroupName = '${dishGroup}'`;
    }

    qtyQuery += `
      GROUP BY 
        DATEPART(YEAR, vw.OrderDateTime),
        DATENAME(MONTH, vw.OrderDateTime),
        vw.DishName,
        dgm.DishGroupName
      ORDER BY 
        DATEPART(YEAR, vw.OrderDateTime),
        MIN(vw.OrderDateTime),
        Amount DESC
    `;

    return { query: qtyQuery };
  }

  // ✅ 4. Order Sales - Hourly
  if (orderSales === "Hourly") {
    return {
      query: `
        SELECT 
          CONCAT(
            FORMAT(DATEPART(HOUR, ri.OrderDateTime), '00'), ':00 - ',
            FORMAT(DATEPART(HOUR, ri.OrderDateTime) + 1, '00'), ':00'
          ) AS Hour,
          CAST(SUM(rd.TotalDetailLineAmount) AS DECIMAL(10,2)) AS Amount
        FROM UCS.dbo.RestaurantInvoice ri
        INNER JOIN UCS.dbo.RestaurantOrderDetail rd ON ri.OrderId = rd.OrderId
        WHERE 1=1
          ${dateFilter('ri.OrderDateTime')}
        GROUP BY DATEPART(HOUR, ri.OrderDateTime)
        ORDER BY DATEPART(HOUR, ri.OrderDateTime)
      `
    };
  }

  // ✅ 5. Order Sales - Daywise
  if (orderSales === "Daywise") {
    return {
      query: `
        SELECT 
          CONVERT(VARCHAR, ri.OrderDateTime, 103) AS Date,
          COUNT(DISTINCT ri.OrderId) AS [No of Bills],
          CAST(SUM(rd.Quantity) AS DECIMAL(10,2)) AS Qty,
          CAST(SUM(rd.TotalDetailLineAmount) AS DECIMAL(10,2)) AS Amount
        FROM UCS.dbo.RestaurantInvoice ri
        JOIN UCS.dbo.RestaurantOrderDetail rd ON ri.OrderId = rd.OrderId
        WHERE 1=1
          ${dateFilter('ri.OrderDateTime')}
        GROUP BY CONVERT(VARCHAR, ri.OrderDateTime, 103)
        ORDER BY MIN(ri.OrderDateTime)
      `
    };
  }

  // ✅ 6. Order Sales - Itemwise
  if (orderSales === "Itemwise") {
    const escapedCategory = category ? category.replace(/'/g, "''") : "";
    const escapedDishGroup = dishGroup ? dishGroup.replace(/'/g, "''") : "";

    return {
      query: `
        SELECT 
          dm.Name AS Item,
          SUM(rd.Quantity) AS Qty,
          SUM(rd.TotalDetailLineAmount) AS Amount
        FROM UCS.dbo.RestaurantOrderDetail rd
        JOIN UCS.dbo.DishMaster dm ON rd.DishId = dm.DishId
        JOIN UCS.dbo.RestaurantInvoice ri ON rd.OrderId = ri.OrderId
        LEFT JOIN UCS.dbo.DishGroupMaster dgm ON dm.DishGroupId = dgm.DishGroupId
        LEFT JOIN UCS.dbo.CategoryMaster cm ON dgm.CategoryId = cm.CategoryId
        WHERE 1=1
          ${dateFilter('ri.OrderDateTime')}
          ${category ? `AND cm.CategoryName = '${escapedCategory}'` : ''}
          ${dishGroup ? `AND dgm.DishGroupName = '${escapedDishGroup}'` : ''}
        GROUP BY dm.Name
        ORDER BY Amount DESC
      `
    };
  }

  // ✅ 7. Order Sales - Group
  if (orderSales === "Group") {
    return {
      query: `
        SELECT 
          ISNULL(dgm.DishGroupName, 'Uncategorized') AS [Group],
          SUM(rd.Quantity) AS Qty,
          SUM(rd.TotalDetailLineAmount) AS Amount
        FROM UCS.dbo.RestaurantOrderDetail rd
        JOIN UCS.dbo.DishMaster dm ON rd.DishId = dm.DishId
        JOIN UCS.dbo.RestaurantInvoice ri ON rd.OrderId = ri.OrderId
        LEFT JOIN UCS.dbo.DishGroupMaster dgm ON dm.DishGroupId = dgm.DishGroupId
        WHERE 1=1
          ${dateFilter('ri.OrderDateTime')}
        GROUP BY dgm.DishGroupName
        ORDER BY Amount DESC
      `
    };
  }

  // ✅ 8. Day End - Paymode
  if (dayEnd === "Paymode") {
    return {
      query: `
        SELECT 
          CONVERT(VARCHAR, InvoiceDate, 103) AS Date,
          ROUND(SUM(ItemSales), 2) AS Sales,
          ROUND(SUM(FOC), 2) AS FOC,
          ROUND(SUM(Discount), 2) AS Disc,
          ROUND(SUM(SVC), 2) AS SVC,
          ROUND(SUM(Tax), 2) AS [Tax 7%],
          ROUND(SUM(Tips), 2) AS Tips,
          ROUND(SUM(Rnd), 2) AS Rnd,
          ROUND(SUM(ENT), 2) AS ENT,
          ROUND(SUM(Cash), 2) AS Cash,
          ROUND(SUM(Master), 2) AS Master,
          ROUND(SUM(Visa), 2) AS Visa
        FROM vw_Paymodesales
        WHERE InvoiceDate >= '${finalFrom}' 
          AND InvoiceDate <= '${finalTo} 23:59:59'
        GROUP BY CONVERT(VARCHAR, InvoiceDate, 103)
        ORDER BY MIN(InvoiceDate)
      `
    };
  }

  // ✅ 9. Day End - Sales Journal (SettlementHeader)
  if (dayEnd === "Journal") {
    return {
      query: `
        SELECT 
          CONVERT(VARCHAR, sh.LastDayEndDate, 103) AS Date,
          CAST(sh.SubTotal AS DECIMAL(10,2)) AS SubTotal,
          CAST(ISNULL(sh.DiscountAmount, 0) AS DECIMAL(10,2)) AS Discount,
          CAST(ISNULL(sh.ServiceCharge, 0) AS DECIMAL(10,2)) AS [Service Charge],
          CAST(ISNULL(sh.TotalTax, 0) AS DECIMAL(10,2)) AS GST,
          CAST(ISNULL(sh.Tips, 0) AS DECIMAL(10,2)) AS Tips,
          sh.TotalPax,
          org.GstType,
          CAST(sh.RoundedBy AS DECIMAL(10,2)) AS RoundedBy
        FROM UCS.dbo.SettlementHeader sh
        INNER JOIN UCS.dbo.vw_Organization org ON sh.BusinessUnitId = org.BusinessUnitId
        WHERE sh.LastDayEndDate >= '${finalFrom}' 
          AND sh.LastDayEndDate <= '${finalTo} 23:59:59'
        ORDER BY sh.LastDayEndDate
      `
    };
  }

  // ✅ 10. Day End - Sales Journal Summary (Crystal Report Style)
  if (dayEnd === "JournalSummary") {
    return {
      query: `
        SELECT 
          CONVERT(VARCHAR, sh.LastDayEndDate, 103) AS Date,
          CAST(SUM(sh.SubTotal) AS DECIMAL(10,2)) AS [Sub Total],
          CAST(SUM(ISNULL(sh.DiscountAmount, 0)) AS DECIMAL(10,2)) AS Discount,
          CAST(SUM(ISNULL(sh.ServiceCharge, 0)) AS DECIMAL(10,2)) AS [Service Charge],
          CAST(SUM(sh.SubTotal) - SUM(ISNULL(sh.DiscountAmount, 0)) + SUM(ISNULL(sh.ServiceCharge, 0)) AS DECIMAL(10,2)) AS [Gross Total],
          CAST(SUM(ISNULL(sh.TotalTax, 0)) AS DECIMAL(10,2)) AS [Total Tax],
          CAST(SUM(ISNULL(sh.RoundedBy, 0)) AS DECIMAL(10,2)) AS [Round],
          CAST(SUM(sh.SubTotal) - SUM(ISNULL(sh.DiscountAmount, 0)) + SUM(ISNULL(sh.ServiceCharge, 0)) + SUM(ISNULL(sh.TotalTax, 0)) + SUM(ISNULL(sh.RoundedBy, 0)) AS DECIMAL(10,2)) AS [Net Total]
        FROM UCS.dbo.SettlementHeader sh
        WHERE sh.LastDayEndDate >= '${finalFrom}' 
          AND sh.LastDayEndDate <= '${finalTo} 23:59:59'
        GROUP BY CONVERT(VARCHAR, sh.LastDayEndDate, 103)
        ORDER BY MIN(sh.LastDayEndDate)
      `
    };
  }

  // ✅ Default - Daywise report
  return {
    query: `
      SELECT 
        CONVERT(VARCHAR, ri.OrderDateTime, 103) AS Date,
        COUNT(DISTINCT ri.OrderId) AS [No of Bills],
        CAST(SUM(rd.Quantity) AS DECIMAL(10,2)) AS Qty,
        CAST(SUM(rd.TotalDetailLineAmount) AS DECIMAL(10,2)) AS Amount
      FROM UCS.dbo.RestaurantInvoice ri
      JOIN UCS.dbo.RestaurantOrderDetail rd ON ri.OrderId = rd.OrderId
      WHERE 1=1
        ${dateFilter('ri.OrderDateTime')}
      GROUP BY CONVERT(VARCHAR, ri.OrderDateTime, 103)
      ORDER BY MIN(ri.OrderDateTime)
    `
  };
};

// ✅ API for table data
router.get("/salesreport", async (req, res) => {
  try {
    console.log("==========================================");
    console.log("ORDER SALES:", req.query.orderSales);
    console.log("DAY END:", req.query.dayEnd);
    console.log("FROM DATE:", req.query.fromDate);
    console.log("TO DATE:", req.query.toDate);
    console.log("==========================================");

    let { fromDate, toDate, dayEnd, orderSales, bySales, byItem, category, dishGroup } = req.query;

    if (fromDate && toDate && fromDate > toDate) {
      console.log("⚠️ Swapping dates: fromDate > toDate");
      [fromDate, toDate] = [toDate, fromDate];
    }

    const pool = await sql.connect(dbConfig);
    const config = getReportQuery({
      orderSales: req.query.orderSales,
      dayEnd: req.query.dayEnd,
      bySales: req.query.bySales,
      byItem: req.query.byItem,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      category: req.query.category,
      dishGroup: req.query.dishGroup
    });

    console.log("SQL Query:", config.query);

    const result = await pool.request().query(config.query);
    console.log("Rows returned:", result.recordset.length);

    let grandTotal = null;
    if (req.query.orderSales === "Hourly") {
      grandTotal = result.recordset.reduce((sum, row) => sum + (row.Amount || 0), 0);
    }
    if (req.query.dayEnd === "Journal") {
      grandTotal = result.recordset.reduce((sum, row) => sum + (row.SubTotal || 0), 0);
    }
    if (req.query.dayEnd === "JournalSummary") {
      grandTotal = result.recordset.reduce((sum, row) => sum + (row['Net Total'] || 0), 0);
    }

    return res.json({
      sales: result.recordset,
      columns: result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
      grandTotal: grandTotal
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ API for company info
router.get("/company-info", async (req, res) => {
  try {
    const company = await getCompanyDetails();
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ API for Categories
router.get("/categories", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        CategoryId,
        CategoryName
      FROM UCS.dbo.CategoryMaster 
      WHERE CategoryName IS NOT NULL AND CategoryName != ''
        AND isActive = 1
      ORDER BY SortCode, CategoryName
    `);
    console.log("Categories API - Returning:", result.recordset.length, "categories");
    res.json(result.recordset);
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json([]);
  }
});

// ✅ API for Dish Groups
router.get("/dishgroups", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const pool = await sql.connect(dbConfig);

    console.log("=== DISHGROUP API ===");
    console.log("Received CategoryId:", categoryId);

    let query = `
      SELECT DISTINCT 
        DishGroupId,
        DishGroupName
      FROM UCS.dbo.vw_DishWithGroup
      WHERE DishGroupName IS NOT NULL 
        AND DishGroupName != ''
    `;

    if (categoryId && categoryId !== "" && categoryId !== "undefined" && categoryId !== "null") {
      query += ` AND CategoryId = '${categoryId}'`;
    }

    query += ` ORDER BY DishGroupName`;

    console.log("SQL Query:", query);

    const result = await pool.request().query(query);
    console.log("DishGroups found:", result.recordset.length);
    console.log("DishGroups:", result.recordset.map(r => r.DishGroupName));

    res.json(result.recordset.map(r => r.DishGroupName));

  } catch (err) {
    console.error("DishGroups error:", err);
    res.status(500).json([]);
  }
});

// ✅ API: Category LOV with all details
router.get("/category-lov", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        CategoryId,
        CategoryCode,
        CategoryName,
        ShortName,
        BackColor,
        ForeColor,
        isKitchenPrint,
        isDiscountAllowed,
        isServiceCharge,
        isActive
      FROM UCS.dbo.CategoryMaster
      WHERE isActive = 1
      ORDER BY SortCode, CategoryName
    `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error("Category LOV error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ API: DishGroup LOV with all details
router.get("/dishgroup-lov", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const pool = await sql.connect(dbConfig);

    let query = `
      SELECT 
        dgm.DishGroupId,
        dgm.DishGroupCode,
        dgm.DishGroupName,
        dgm.ShortName,
        dgm.SortCode,
        dgm.KitchenSortCode,
        dgm.BackColor,
        dgm.ForeColor,
        dgm.isActive,
        cm.CategoryId,
        cm.CategoryName
      FROM UCS.dbo.DishGroupMaster dgm
      LEFT JOIN UCS.dbo.CategoryMaster cm ON dgm.CategoryId = cm.CategoryId
      WHERE dgm.isActive = 1
    `;

    if (categoryId && categoryId !== "") {
      query += ` AND dgm.CategoryId = '${categoryId}'`;
    }

    query += ` ORDER BY dgm.KitchenSortCode, dgm.DishGroupName`;

    const result = await pool.request().query(query);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    console.error("DishGroup LOV error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ HTML Blob Report (No Puppeteer - Print using browser)
router.get("/sales-pdf", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const config = getReportQuery(req.query);
    const company = await getCompanyDetails();

    const result = await pool.request().query(config.query);
    const rawData = result.recordset || [];

    if (rawData.length === 0) {
      return res.status(404).send("No data found for the selected criteria");
    }

    const fromDate = req.query.fromDate || "";
    const toDate = req.query.toDate || "";
    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let reportTitle = "SALES REPORT";
    let displayColumns = [];
    let mappedData = [];

    if (req.query.orderSales === "Hourly") {
      reportTitle = "HOURLY SALES REPORT";
      displayColumns = ['Hour', 'Amount'];
      mappedData = rawData.map(row => ({ Hour: row.Hour, Amount: row.Amount }));
    }
    else if (req.query.dayEnd === "Paymode") {
      reportTitle = "PAYMODE COLLECTION REPORT";
      displayColumns = ['Date', 'Sales', 'FOC', 'Disc', 'SVC', 'Tax 7%', 'Tips', 'Rnd', 'ENT', 'Cash', 'Master', 'Visa'];
      mappedData = rawData.map(row => ({
        Date: row.Date || row.InvoiceDate || '',
        Sales: Number(row.Sales || row.ItemSales || 0),
        FOC: Number(row.FOC || 0),
        Disc: Number(row.Disc || row.Discount || 0),
        SVC: Number(row.SVC || 0),
        'Tax 7%': Number(row.Tax || row['Tax 7%'] || 0),
        Tips: Number(row.Tips || 0),
        Rnd: Number(row.Rnd || 0),
        ENT: Number(row.ENT || 0),
        Cash: Number(row.Cash || 0),
        Master: Number(row.Master || 0),
        Visa: Number(row.Visa || 0)
      }));
    }
    else if (req.query.dayEnd === "Journal") {
      reportTitle = "SALES JOURNAL REPORT";
      displayColumns = ['Date', 'SubTotal', 'Discount', 'Service Charge', 'GST', 'Tips', 'TotalPax', 'GstType', 'RoundedBy'];
      mappedData = rawData;
    }
    else if (req.query.dayEnd === "JournalSummary") {
      reportTitle = "SALES JOURNAL SUMMARY";
      displayColumns = ['Date', 'Sub Total', 'Discount', 'Service Charge', 'Gross Total', 'Total Tax', 'Round', 'Net Total'];
      mappedData = rawData;
    }
    else {
      displayColumns = Object.keys(rawData[0]);
      mappedData = rawData;
    }

    const addressParts = [];
    if (company.Address1_Line1) addressParts.push(company.Address1_Line1);
    if (company.Address1_Line2) addressParts.push(company.Address1_Line2);
    if (company.Address1_City) addressParts.push(company.Address1_City);
    if (company.Address1_State) addressParts.push(company.Address1_State);
    let fullAddress = addressParts.join(", ");
    if (company.Address1_PostalCode) {
      fullAddress = fullAddress ? `${fullAddress} - ${company.Address1_PostalCode}` : company.Address1_PostalCode;
    }

    const path = require('path');
    const fs = require('fs');
    let logoBase64 = "";
    try {
      const logoPath = path.join(__dirname, "../../public/unipro_logo.png");
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
      }
    } catch (err) { }

    // ✅ HTML with print button (Browser will handle PDF generation)
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle}</title>
      <style media="print">
        @page { 
         size: A4 portrait;
          margin: 1cm;
        }
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }
        .print-button { display: none; }
      </style>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 12px 16px; 
          font-size: 10px; 
          color: #333; 
          background: white; 
        }
        @media print {
          body { padding: 0; margin: 0; }
          .print-button { display: none; }
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #1a3c5a; }
        .logo-section { flex: 0 0 auto; }
        .logo-section img { height: 45px; width: auto; }
        .company-details { flex: 1; text-align: center; }
        .company-name { font-size: 14px; font-weight: 800; color: #1a3c5a; text-transform: uppercase; }
        .company-address { font-size: 8px; color: #666; margin-top: 2px; }
        .company-phone { font-size: 8px; color: #666; }
        .report-name { text-align: center; font-size: 13px; font-weight: 800; color: #1a3c5a; margin: 10px 0 5px; text-transform: uppercase; }
        .report-info { text-align: center; font-size: 8px; color: #555; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 9px; }
        .data-table th { background-color: #1a3c5a; color: white; padding: 6px 8px; text-align: center; border: 1px solid #2a4c6a; }
        .data-table td { border: 1px solid #e0e0e0; padding: 5px 8px; }
        .data-table tr:nth-child(even) { background-color: #f9f9f9; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .grand-total-row td { background-color: #eef2f8; font-weight: 700; border-top: 2px solid #1a3c5a; }
        .footer { text-align: center; font-size: 7px; color: #aaa; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee; }
        .printed-on { text-align: right; font-size: 7px; color: #888; margin-top: 5px; }
        .print-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #1a3c5a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .print-button:hover { background: #0e2a40; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : '<div style="width: 45px;"></div>'}</div>
        <div class="company-details">
          <div class="company-name">${company.Name || "AL-HAZIMA RESTAURANT PTE LTD"}</div>
          <div class="company-address">${fullAddress || "No 4, Cheong Chin Nam Road, SINGAPORE - 599729"}</div>
          <div class="company-phone">Phone: ${company.Address1_Telephone1 || "65130000"}</div>
        </div>
        <div class="empty-space" style="width:45px;"></div>
      </div>
      <div class="report-name">${reportTitle}</div>
      <div class="report-info">Period: ${fromDate} to ${toDate} | Printed: ${currentDate} ${currentTime}</div>
      <table class="data-table">
        <thead><tr>${displayColumns.map(col => `<th>${col}</th>`).join("")}</thead>
        <tbody>
          ${mappedData.map(row => `<tr>${displayColumns.map(col => {
      let val = row[col];
      const isNumber = typeof val === 'number';
      const alignment = col === 'Date' || col === 'Hour' ? 'text-left' : 'text-right';
      return `<td class="${alignment}">${isNumber ? val.toFixed(2) : (val || '0')}</td>`;
    }).join("")}</tr>`).join("")}
          <tr class="grand-total-row">
            <td class="text-left"><strong>Total:</strong></td>
            ${displayColumns.slice(1).map(col => {
      const total = mappedData.reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
      return `<td class="text-right"><strong>${total.toFixed(2)}</strong></td>`;
    }).join("")}
          </tr>
        </tbody>
      </table>
      <div class="footer">*** System Generated Report ***</div>
      <div class="printed-on">Printed On: ${currentDate} ${currentTime}</div>
      
      <button class="print-button" onclick="window.print();">
        🖨️ Save as PDF / Print
      </button>
      
      <script>
        // Auto-open print dialog after 1 second (optional - uncomment to use)
        // setTimeout(() => window.print(), 1000);
      </script>
    </body>
    </html>`;

    // ✅ Send HTML instead of PDF - Browser will handle printing
    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error("HTML Report ERROR:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;