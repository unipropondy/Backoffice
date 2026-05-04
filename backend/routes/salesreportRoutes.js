const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db");

// ✅ Get company details
const getCompanyDetails = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 1 
        Name,
        Address1_Line1,
        Address1_Line2,
        Address1_City,
        Address1_State,
        Address1_PostalCode,
        Address1_Telephone1
      FROM UCS.dbo.Organization
    `);

    return result.recordset[0] || {};
  } catch (err) {
    console.error("Company Error:", err);
    return {};
  }
};

// ✅ Query Builder
const getReportQuery = (params) => {
  const { orderSales, fromDate, toDate } = params;

  const dateFilter = `
    AND ri.OrderDateTime >= '${fromDate}'
    AND ri.OrderDateTime <= '${toDate} 23:59:59'
  `;

  if (orderSales === "Hourly") {
    return {
      query: `
        SELECT 
          CONCAT(
            FORMAT(DATEPART(HOUR, ri.OrderDateTime), '00'), ':00 - ',
            FORMAT(DATEPART(HOUR, ri.OrderDateTime) + 1, '00'), ':00'
          ) AS Hour,
          SUM(rd.TotalDetailLineAmount) AS Amount
        FROM RestaurantInvoice ri
        JOIN RestaurantOrderDetail rd ON ri.OrderId = rd.OrderId
        WHERE 1=1 ${dateFilter}
        GROUP BY DATEPART(HOUR, ri.OrderDateTime)
        ORDER BY DATEPART(HOUR, ri.OrderDateTime)
      `
    };
  }

  return {
    query: `
      SELECT 
        CONVERT(VARCHAR, ri.OrderDateTime, 103) AS Date,
        SUM(rd.TotalDetailLineAmount) AS Amount
      FROM RestaurantInvoice ri
      JOIN RestaurantOrderDetail rd ON ri.OrderId = rd.OrderId
      WHERE 1=1 ${dateFilter}
      GROUP BY CONVERT(VARCHAR, ri.OrderDateTime, 103)
    `
  };
};

// ✅ MAIN API
router.get("/salesreport", async (req, res) => {
  try {
    const pool = await poolPromise;

    const config = getReportQuery(req.query);

    const result = await pool.request().query(config.query);

    res.json({
      sales: result.recordset,
      columns: result.recordset[0] ? Object.keys(result.recordset[0]) : []
    });

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Company Info
router.get("/company-info", async (req, res) => {
  try {
    const data = await getCompanyDetails();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;