import React, { useState, useEffect } from "react";
import "./CafeSalesReport.css";
import { BASE_URL } from "../config/api";
 
const API_BASE = process.env.REACT_APP_API_URL || `${BASE_URL}`;
 
const CafeSalesReport = ({
  salesData = [],
  columns: initialColumns = ["Hour", "Amount"],
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onSearch
}) => {
  const [columns, setColumns] = useState(initialColumns);
  const [orderSales, setOrderSales] = useState("");
  const [dayEnd, setDayEnd] = useState("");
  const [bySales, setBySales] = useState("");
  const [byItem, setByItem] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [postDate, setPostDate] = useState(false);
  const [category, setCategory] = useState("");
  const [dishGroup, setDishGroup] = useState("");
  const [outputType, setOutputType] = useState("Screen");
  const [viewMode, setViewMode] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [localData, setLocalData] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [companyInfo, setCompanyInfo] = useState(null);
 
  const [categoryList, setCategoryList] = useState([]);
  const [dishGroupList, setDishGroupList] = useState([]);
  const [showCategoryLOV, setShowCategoryLOV] = useState(false);
  const [showDishGroupLOV, setShowDishGroupLOV] = useState(false);
 
  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reports/company-info`);
      const data = await response.json();
      setCompanyInfo(data);
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };
 
  React.useEffect(() => {
    fetchCompanyInfo();
  }, []);
 
  const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/reports/categories`);
    const data = await response.json();
    console.log("Categories API Response:", data);
   
    if (Array.isArray(data)) {
      setCategoryList(data);
    } else if (data.data && Array.isArray(data.data)) {
      setCategoryList(data.data);
    } else {
      setCategoryList([]);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    setCategoryList([]);
  }
};
 
const fetchDishGroups = async (categoryId = null) => {
  // Add this to see who is calling
  console.trace("fetchDishGroups called with:", categoryId);
 
  try {
    let url = `${API_BASE}/api/reports/dishgroups`;
    if (categoryId && categoryId !== "" && categoryId !== "undefined") {
      url += `?categoryId=${categoryId}`;
      console.log("Fetching FILTERED dish groups for category:", categoryId);
    } else {
      console.log("Fetching ALL dish groups");
    }
    console.log("URL:", url);
   
    const response = await fetch(url);
    const data = await response.json();
   
    if (Array.isArray(data)) {
      setDishGroupList(data);
      console.log("DishGroupList updated, count:", data.length);
    }
  } catch (error) {
    console.error("Error fetching dish groups:", error);
  }
};
useEffect(() => {
  console.log("=== dishGroupList CHANGED ===");
  console.log("New dishGroupList:", dishGroupList);
  console.log("Length:", dishGroupList.length);
}, [dishGroupList]);

//   const handleDownload = async () => {
//   try {
//     const selectedReport = orderSales || dayEnd;
   
   
//     if (selectedReport === "Paymode") {
     
//       let url = `${API_BASE}/api/reports/paymode-pdf?fromDate=${fromDate}&toDate=${toDate}`;
     
//       const response = await fetch(url);
//       if (!response.ok) throw new Error("PDF download failed");
     
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
     
   
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `Paymode_Sales_${fromDate}_to_${toDate}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
     
//     } else if (selectedReport === "Terminal") {
    
//       let url = `${API_BASE}/api/reports/terminal-pdf?fromDate=${fromDate}&toDate=${toDate}`;
//       const response = await fetch(url);
//       if (!response.ok) throw new Error("PDF download failed");
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `Terminal_Sales_${fromDate}_to_${toDate}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
     
//     } else {
      
//       let url = `${API_BASE}/api/reports/sales-pdf?fromDate=${fromDate}&toDate=${toDate}&orderSales=${selectedReport}&bySales=${bySales}`;
 
//       if (selectedReport === "Itemwise") {
//         if (category) url += `&category=${encodeURIComponent(category)}`;
//         if (dishGroup) url += `&dishGroup=${encodeURIComponent(dishGroup)}`;
//       }
 
//       const response = await fetch(url);
//       if (!response.ok) throw new Error("PDF download failed");
 
//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = `Sales_Report_${fromDate}_to_${toDate}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
//     }
 
//   } catch (err) {
//     console.error(err);
//     alert("Error downloading PDF");
//   }
// };

const handleDownload = () => {
  try {
    const selectedReport = orderSales || dayEnd;

    let url = `${API_BASE}/api/reports/sales-pdf?fromDate=${fromDate}&toDate=${toDate}`;

    // ✅ Order Sales
    if (orderSales) {
      url += `&orderSales=${orderSales}`;
    }

    // ✅ Day End
    if (dayEnd) {
      url += `&dayEnd=${dayEnd}`;
    }

    // ✅ By Sales
    if (bySales) {
      url += `&bySales=${bySales}`;
    }

    // ✅ By Item
    if (byItem) {
      url += `&byItem=${byItem}`;
    }

    // ✅ Category & DishGroup
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (dishGroup) {
      url += `&dishGroup=${encodeURIComponent(dishGroup)}`;
    }

    console.log("Opening URL:", url);

    // ✅ Open HTML report in new tab
    window.open(url, "_blank");

  } catch (err) {
    console.error(err);
    alert("Error opening report");
  }
};
 
const handleFind = async () => {
  if (!fromDate || !toDate) {
    alert("Please select both From Date and To Date");
    return;
  }
 
  setIsSearched(true);
 
  let url = `${API_BASE}/api/reports/salesreport?fromDate=${fromDate}&toDate=${toDate}`;
 
  // ✅ ADD bySales FIRST (Sales Summary)
  if (bySales === "Summary") {
    url += `&bySales=Summary`;
  }
    else if (byItem === "Month") {
    url += `&byItem=Month`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (dishGroup) url += `&dishGroup=${encodeURIComponent(dishGroup)}`;
  }
 else if (byItem === "Qty") {
  url += `&byItem=Qty`;
  if (category) url += `&category=${encodeURIComponent(category)}`;  // ✅ Should be there
  if (dishGroup) url += `&dishGroup=${encodeURIComponent(dishGroup)}`;  // ✅ Should be there
}
 
  // ✅ ADD Day End
  else if (dayEnd === "Paymode") {
    url += `&dayEnd=Paymode`;
  }
  else if (dayEnd === "Terminal") {
    url += `&dayEnd=Terminal`;
  }
  else if (dayEnd === "Transaction") {
    url += `&dayEnd=Transaction`;
  }
  else if (dayEnd === "GST") {
    url += `&dayEnd=GST`;
  }
  // ✅ ADD Order Sales
  else if (orderSales === "Hourly") {
    url += `&orderSales=Hourly`;
  }
  else if (orderSales === "Daywise") {
    url += `&orderSales=Daywise`;
  }
  else if (orderSales === "Itemwise") {
    url += `&orderSales=Itemwise`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (dishGroup) url += `&dishGroup=${encodeURIComponent(dishGroup)}`;
  }
  else if (orderSales === "Group") {
    url += `&orderSales=Group`;
  }
 
  console.log("Final URL:", url);
 
  try {
    const res = await fetch(url);
    const data = await res.json();
   
    console.log("API Response:", data);
   
    let rawData = Array.isArray(data.sales) ? data.sales : [];
    let forcedColumns = [];
    let forcedData = [];
   
    // ✅ Check for Sales Summary / Paymode data (has Sales, Cash columns)
    if (data.columns && (data.columns.includes('Sales') || data.columns.includes('Cash'))) {
      forcedColumns = ['Date', 'Sales', 'FOC', 'Disc', 'SVC', 'Tax 7%', 'Tips', 'Rnd', 'ENT', 'Cash', 'Master', 'Visa'];
      forcedData = rawData.map(row => ({
        Date: row.Date || (row.InvoiceDate ? new Date(row.InvoiceDate).toLocaleDateString('en-GB') : ''),
        Sales: row.Sales || row.ItemSales || 0,
        FOC: row.FOC || 0,
        Disc: row.Disc || row.Discount || 0,
        SVC: row.SVC || 0,
        'Tax 7%': row['Tax 7%'] || row.Tax || 0,
        Tips: row.Tips || 0,
        Rnd: row.Rnd || 0,
        ENT: row.ENT || 0,
        Cash: row.Cash || 0,
        Master: row.Master || 0,
        Visa: row.Visa || 0
      }));
    }
    // ✅ Check for Hourly report
    else if (data.columns && data.columns.includes('Hour') && data.columns.includes('Amount')) {
      forcedColumns = ['Hour', 'Amount'];
      forcedData = rawData;
    }
    // ✅ Check for Daywise report
    else if (data.columns && data.columns.includes('No of Bills')) {
      forcedColumns = ['Date', 'No of Bills', 'Qty', 'Amount'];
      forcedData = rawData;
    }
    // Default case
    else {
      forcedColumns = data.columns || [];
      forcedData = rawData;
    }
   
    console.log("Final Columns:", forcedColumns);
    console.log("Final Data:", forcedData);
   
    setLocalData(forcedData);
    setColumns(forcedColumns);
    setGrandTotal(data.grandTotal || 0);
   
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error fetching report data");
  }
};
  const handleClear = () => {
    setOrderSales("");
    setDayEnd("");
    setBySales("");
    setByItem("");
    setShowChart(false);
    setPostDate(false);
    setIsSearched(false);
    setOutputType("Screen");
    setViewMode("");
    setLocalData([]);
    setCategory("");
    setDishGroup("");
    setGrandTotal(0);
  };
 
  const displayData = localData.length > 0 ? localData : salesData;
  const displayColumns = localData.length > 0 ? columns : initialColumns;
  const hasData = displayData.length > 0;
 
return (
  <div className="sales report-container">
    <div className="report-header">
      <h2 className="report-title">Sales Report</h2>
    </div>
 
    <div className="filter-section">
      <div className="filter-row">
        <div className="filter-group">
          <label className="tb-label">Order Sales</label>
          <select value={orderSales} onChange={(e) => setOrderSales(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Itemwise">Sales - Itemwise (R)</option>
            <option value="Hourly">Hourly Report</option>
            <option value="Group">Group Sales (R)</option>
            <option value="Daywise">Sales - Daywise</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="tb-label">Day End</label>
          <select value={dayEnd} onChange={(e) => setDayEnd(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Paymode">Paymode Collection</option>
            <option value="Terminal">Terminal Sales</option>
            <option value="Transaction">Transaction</option>
            <option value="GST">GST Report</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="tb-label">By Sales</label>
          <select value={bySales} onChange={(e) => setBySales(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Journal">Sales Journal</option>
            <option value="Summary">Sales Summary</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="tb-label">By Item</label>
          <select value={byItem} onChange={(e) => {
            setByItem(e.target.value);
            setCategory("");
            setDishGroup("");
          }}>
            <option value="">-- Select --</option>
            <option value="Month">Month Sales</option>
            <option value="Qty">Qty Sales</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="tb-label">From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label className="tb-label">To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label className="tb-label">&nbsp;</label> {/* Placeholder label for alignment */}
          <select className="view-mode-select" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="Summary">Summary</option>
            <option value="Detail">Detail</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="find-btn" onClick={handleFind}>Find</button>
          <button className="clear-btn" onClick={handleClear}>Clear</button>
        </div>
      </div>
 
      {(orderSales === "Itemwise" || byItem === "Month" || byItem === "Qty") && (
        <div className="filter-row secondary-filters">
          <div className="filter-group">
            <label className="tb-label">Category</label>
            <div className="lov-input-group">
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Select Category" />
              <button type="button" className="lov-btn" onClick={() => { fetchCategories(); setShowCategoryLOV(true); }}>...</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="tb-label">Dish Group</label>
            <div className="lov-input-group">
              <input value={dishGroup} onChange={(e) => setDishGroup(e.target.value)} placeholder="Select Dish Group" />
              <button type="button" className="lov-btn" onClick={() => { fetchDishGroups(); setShowDishGroupLOV(true); }}>...</button>
            </div>
          </div>
          {orderSales === "Itemwise" && (
            <div className="filter-group checkbox-group">
              <label><input type="checkbox" checked={showChart} onChange={(e) => setShowChart(e.target.checked)} /> Chart</label>
              <label><input type="checkbox" checked={postDate} onChange={(e) => setPostDate(e.target.checked)} /> POST DATED</label>
            </div>
          )}
        </div>
      )}
    </div>
   
    {isSearched && (
      <div className="report-output-section">
        <div className="download-container">
          <button onClick={handleDownload} className="download-btn" title="Download PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
 
        <div className="professional-report-wrapper">
          {hasData ? (
            <>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="report-table professional-table" style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      {displayColumns.map((col, idx) => (
                        <th key={idx} style={{ textAlign: col === 'Date' ? 'left' : 'right', padding: '10px 12px' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((item, i) => (
                      <tr key={i}>
                        {displayColumns.map((col, idx) => {
                          let value = item[col];
                          if (col === 'Date' && value) {
                            const dateObj = new Date(value);
                            if (!isNaN(dateObj.getTime())) {
                              value = dateObj.toLocaleDateString('en-GB');
                            }
                          }
                          const isNumeric = typeof value === "number" || (!isNaN(value) && value !== '' && value !== null);
                          return (
                            <td key={idx} style={{ textAlign: col === 'Date' ? 'left' : 'right', padding: '8px 12px' }}>
                              {isNumeric ? Number(value).toFixed(2) : value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="grand-total-row">
                      {displayColumns.map((col, idx) => {
                        if (idx === 0) return <td key={idx} style={{ textAlign: 'left', fontWeight: 'bold' }}>Grand Total:</td>;
                        const total = displayData.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
                        return <td key={idx} style={{ textAlign: 'right', fontWeight: 'bold' }}>{total.toFixed(2)}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="prof-report-footer">*** System Generated Report ***</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '20px', color: '#999', fontWeight: '500' }}>
              No Data Found
            </div>
          )}
        </div>
      </div>
    )}
 
    {/* Category LOV Modal */}
    {/* Category LOV Modal */}
{/* Category LOV Modal */}
{/* Category LOV Modal */}
{/* Category LOV Modal */}
{showCategoryLOV && (
  <div className="lov-modal" onClick={() => setShowCategoryLOV(false)}>
    <div className="lov-modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="lov-modal-header">
        <h3>Select Category</h3>
        <button onClick={() => setShowCategoryLOV(false)}>×</button>
      </div>
      <div className="lov-modal-body">
        <div className="lov-item" onClick={async () => {
          console.log("=== CLEAR CATEGORY ===");
          setCategory("");
          setSelectedCategoryId("");
          setShowCategoryLOV(false);
          setDishGroup("");
          await fetchDishGroups();  // Fetch all dish groups
        }}>-- Clear Selection --</div>
       
        {categoryList.map((item, idx) => (
          <div key={idx} className="lov-item" onClick={async () => {
            const catName = item.CategoryName || item;
            const catId = item.CategoryId || '';
            console.log("=== CATEGORY SELECTED ===");
            console.log("Name:", catName);
            console.log("ID:", catId);
           
            setCategory(catName);
            setSelectedCategoryId(catId);
            setShowCategoryLOV(false);
            setDishGroup("");  // Clear dish group
           
            // ✅ Only fetch dish groups for this category
            if (catId) {
              await fetchDishGroups(catId);
            }
          }}>
            {item.CategoryName || item}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    {/* Dish Group LOV Modal */}
  {/* Dish Group LOV Modal */}
{/* Dish Group LOV Modal */}
{/* Dish Group LOV Modal */}
{showDishGroupLOV && (
  <div className="lov-modal" onClick={() => setShowDishGroupLOV(false)}>
    <div className="lov-modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="lov-modal-header">
        <h3>Select Dish Group</h3>
        <button onClick={() => setShowDishGroupLOV(false)}>×</button>
      </div>
      <div className="lov-modal-body">
        <div className="lov-item" onClick={() => {
          setDishGroup("");
          setShowDishGroupLOV(false);
        }}>-- Clear Selection --</div>
       
        {/* Debug - Show message if empty */}
        {dishGroupList.length === 0 && (
          <div className="lov-item" style={{color: 'red', fontStyle: 'italic'}}>
            No dish groups found for this category
          </div>
        )}
       
        {dishGroupList.map((item, idx) => {
          const dishName = typeof item === 'object' ? (item.DishGroupName || item.DishGroup) : item;
          console.log("Rendering dish:", dishName); // Debug
          return (
            <div key={idx} className="lov-item" onClick={() => {
              console.log("Selected dish:", dishName);
              setDishGroup(dishName);
              setShowDishGroupLOV(false);
            }}>
              {dishName}
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}
  </div>
);
};
 
export default CafeSalesReport;

 