// :contentReference[oaicite:1]{index=1}

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HappyHours.css";

import { BASE_URL } from "../config/api";

const HappyHours = () => {

  const [showForm, setShowForm] = useState(false);

  const [promoCode] = useState("PR0001");
  const [description, setDescription] = useState("");
  const [promoBegin, setPromoBegin] = useState("");
  const [promoEnd, setPromoEnd] = useState("");
  const [promoStartTime, setPromoStartTime] = useState("00:00");
  const [promoEndTime, setPromoEndTime] = useState("23:59");

  const [tableData, setTableData] = useState([]);
  const [promotionType, setPromotionType] = useState("");
  const [promotionValue, setPromotionValue] = useState("");

  const [reportData, setReportData] = useState([]);
  const [searchText, setSearchText] = useState("");
  

  // ✅ ADDED ONLY
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const daysList = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const [selectedDays, setSelectedDays] = useState(
    daysList.reduce((acc, day) => ({ ...acc, [day]: true }), {})
  );
 const [dishGroup, setDishGroup] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [dishGroups, setDishGroups] = useState([]);
const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ DISH POPUP STATE
  const [showDishPopup, setShowDishPopup] = useState(false);
  const [fetchedDishes, setFetchedDishes] = useState([]);
  const [selectedPopupDishes, setSelectedPopupDishes] = useState([]); 
  const [dishSearchText, setDishSearchText] = useState("");


  const toggleDay = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
  };
useEffect(() => {
  fetchDishGroups();
  fetchReport();   // 🔥 ADD THIS
}, []);

// 🔥 ADD THIS HERE
useEffect(() => {
  const handleClickOutside = () => {
    setShowPopup(false);
    setShowDishPopup(false);
  };

  if (showPopup || showDishPopup) {
    window.addEventListener("click", handleClickOutside);
  }

  return () => window.removeEventListener("click", handleClickOutside);
}, [showPopup, showDishPopup]);

const fetchDishGroups = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/happyhours/dishgroups`);

    console.log("API DATA:", res.data);   // 🔥 ADD HERE

    setDishGroups(res.data.data);

  } catch (err) {
    console.error("Dish group load failed", err);
  }
};

 const fetchReport = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/happyhours/report`);
    setReportData(res.data.data || []);
  } catch (err) {
    console.log("Report load failed");
  }
};

  const handleSave = async () => {
    try {
      const selectedDaysArr = Object.keys(selectedDays)
        .filter(day => selectedDays[day])
        .join(",");

      if (!selectedGroupId) {
        alert("Select Dish Group ❌");
        return;
      }

      let itemsToSave = [];
      if (selectedRows.length > 0) {
        itemsToSave = selectedRows.map(idx => tableData[idx]);
      } else {
        itemsToSave = tableData; // Auto-save all if none specifically checked
      }

      if (itemsToSave.length === 0) {
        alert("No dishes in the Order View table to save ❌");
        return;
      }

      const payload = itemsToSave.map(dish => ({
        PromotionId: crypto.randomUUID(),
        PromotionCode: promoCode,
        Description: description,
        DishGroupId: selectedGroupId, // 🔥 FIXED: Mapped properly to DishGroupId
        DishId: dish.dishId || "00000000-0000-0000-0000-000000000000",
        FromDate: formatDate(promoBegin),
        ToDate: formatDate(promoEnd),
        FromTime: promoStartTime,
        ToTime: promoEndTime,
        PromotionDay: selectedDaysArr,
        PromotionPerc: promotionType === "%" ? Number(promotionValue) || 0 : 0,
        PromotionPrice: promotionType === "$" ? Number(promotionValue) || 0 : 0,
        CreatedBy: "00000000-0000-0000-0000-000000000000",
        CreatedOn: new Date().toISOString(),
        ModyfiedBy: null,
        ModyfiedOn: null,
        BusinessUnitId: "00000000-0000-0000-0000-000000000000",
        PromoType: promotionType || "%"
      }));

      await axios.post(`${BASE_URL}/api/happyhours`, payload);

      await fetchReport();

      alert("Saved ✅");
      setShowForm(false);

    } catch (err) {
      console.error(err);
      alert("Save Failed ❌");
    }
  };
const handleFetch = async () => {
  try {
    if (!selectedGroupId) {
      alert("Select Dish Group ❌");
      return;
    }

    const cleanId = selectedGroupId; // 🔥 DO NOT cast to Number! It's a UUID.
    console.log("Selected ID:", cleanId);

    const res = await axios.get(
      `${BASE_URL}/api/happyhours`,
      {
        params: { dishGroup: cleanId }
      }
    );

    console.log("FETCH DATA:", res.data.data); // 🔥 DEBUG

    setFetchedDishes(res.data.data || []);
    setShowDishPopup(true);
    setSelectedPopupDishes([]);
    setDishSearchText("");

  } catch (err) {
    console.error(err);
    alert("Fetch Failed ❌");
  }
};
// 🔍 FILTER DISH GROUPS (ADD HERE)
const filteredDishGroups = dishGroups.filter(g =>
  g.name.toLowerCase().includes(searchText.toLowerCase())
);
  // ✅ ADDED ONLY
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((_, i) => i));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedRows.length === 0) {
        alert("Select records to delete ❌");
        return;
      }
      const itemsToDelete = selectedRows.map(idx => tableData[idx]);
      const dishIds = itemsToDelete.map(d => d.dishId || d.dishCode);
      await axios.post(`${BASE_URL}/api/happyhours/delete`, { dishIds });
      
      const newTableData = tableData.filter((_, idx) => !selectedRows.includes(idx));
      setTableData(newTableData);
      setSelectedRows([]);
      setSelectAll(false);
      await fetchReport();
      alert("Deleted ✅");
    } catch (err) {
      console.error(err);
      alert("Delete Failed ❌");
    }
  };

  const handleNew = () => {
    setDescription("");
    setPromoBegin("");
    setPromoEnd("");
    setPromotionValue("");
    setTableData([]);
    setSelectedRows([]);
    setSelectAll(false);
  };

  return (
    <div className="happyhours-main-full">

      <div className="happyhours-container">

        {!showForm && (
          <>
            <div className="happyhours-header">
              <h2>Happy Hours</h2>
              <button className="happyhours-btn-new" onClick={() => setShowForm(true)}>New</button>
            </div>

            <div className="happyhours-table-wrapper">
              <table className="happyhours-table">
                <thead>
                  <tr>
                    <th>Dish Group</th>
                    <th>Dish Code</th>
                    <th>Description</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="happyhours-empty">No Data</td>
                    </tr>
                  ) : (
                 reportData.map((item, i) => (
                  <tr key={item.InventoryID || i}>
                      <td>{item.DishGroup}</td>
                      <td>{item.InventoryID}</td>
                      <td>{item.Description}</td>
                      <td>{item.Price}</td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showForm && (
          <div className="happyhours-form-container">

            <div className="happyhours-header">
              <h2>Happy Hours</h2>

              <div className="happyhours-top-btns">
                <button className="happyhours-btn-new" onClick={handleNew}>New</button>
                <button className="happyhours-btn-save" onClick={handleSave}>Save</button>
                <button className="happyhours-btn-delete" onClick={handleDelete}>Delete</button>
                <button className="happyhours-btn-exit" onClick={() => setShowForm(false)}>Exit</button>
              </div>
            </div>

            <div className="happyhours-top-grid">
              <div>
                <div className="happyhours-form-row">
                  <label>Promotion Code</label>
                  <input value={promoCode} readOnly />
                </div>

                <div className="happyhours-form-row">
                  <label>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="happyhours-form-row">
                  <label>Promo Begin</label>
                  <input type="date" value={promoBegin} onChange={(e) => setPromoBegin(e.target.value)} />
                </div>

                <div className="happyhours-form-row">
                  <label>Promo End</label>
                  <input type="date" value={promoEnd} onChange={(e) => setPromoEnd(e.target.value)} />
                </div>

                <div className="happyhours-form-row">
                  <label>Dish Group</label>
 <div style={{ display: "flex", gap: "5px" }}>
  <input
    placeholder="Select Dish Group"
    value={dishGroup}
    readOnly
  />

 <button
  onClick={(e) => {
    e.stopPropagation();   // 🔥 VERY IMPORTANT
    setShowPopup(true);
  }}
>
  ⋯
</button>
</div>             
</div>
{showPopup && (
  <div
    onClick={(e) => e.stopPropagation()}   // 🔥 ADD HERE
    style={{
      position: "absolute",
      top: "260px",
      left: "300px",
      background: "#fff",
      border: "1px solid #ccc",
      width: "450px",
      zIndex: 999,
      padding: "10px"
    }}
  >

    {/* 🔍 SEARCH BOX */}
    <input
      placeholder="Search Dish Group..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      style={{
        width: "100%",
        marginBottom: "10px",
        padding: "5px"
      }}
    />

    {/* 📋 TABLE */}
    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Code</th>
            <th style={{ padding: "6px", border: "1px solid #ccc" }}>Name</th>
          </tr>
        </thead>

        <tbody>
          {filteredDishGroups.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: "center", padding: "10px" }}>
                No Data
              </td>
            </tr>
          ) : (
            filteredDishGroups.map((g, i) => (
               <tr key={`${g.id}-${i}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setDishGroup(g.name);
                  setSelectedGroupId(g.id);
                  setShowPopup(false);
                  setSearchText("");
                }}
              >
                <td style={{ padding: "6px", border: "1px solid #ccc" }}>
                  {g.code || g.id}
                </td>
                <td style={{ padding: "6px", border: "1px solid #ccc" }}>
                  {g.name}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>

  </div>
)}

{/* 🍕 DISH SELECTION POPUP */}
{showDishPopup && (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: "absolute",
      top: "260px",
      left: "300px",
      background: "#fff",
      border: "1px solid #ccc",
      width: "500px",
      zIndex: 1000,
      padding: "15px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
      <h4 style={{ margin: 0 }}>Select Dishes from {dishGroup}</h4>
      <button style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }} onClick={() => setShowDishPopup(false)}>✖</button>
    </div>

    <input
      placeholder="Search Dishes..."
      value={dishSearchText}
      onChange={(e) => setDishSearchText(e.target.value)}
      style={{ width: "100%", marginBottom: "10px", padding: "8px", boxSizing: "border-box" }}
    />

    <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "10px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f0f0f0", position: "sticky", top: 0 }}>
          <tr>
            <th style={{ padding: "6px", border: "1px solid #ccc", width: "40px", textAlign: "center" }}>
              <input 
                type="checkbox" 
                checked={
                  fetchedDishes.length > 0 && 
                  fetchedDishes.filter(d => d.dishName.toLowerCase().includes(dishSearchText.toLowerCase())).length > 0 &&
                  selectedPopupDishes.length >= fetchedDishes.filter(d => d.dishName.toLowerCase().includes(dishSearchText.toLowerCase())).length
                }
                onChange={(e) => {
                  const filtered = fetchedDishes.filter(d => d.dishName.toLowerCase().includes(dishSearchText.toLowerCase()));
                  if (e.target.checked) {
                    const filteredIndices = filtered.map(item => fetchedDishes.findIndex(fd => fd.dishCode === item.dishCode));
                    // Union with existing selection
                    setSelectedPopupDishes(Array.from(new Set([...selectedPopupDishes, ...filteredIndices])));
                  } else {
                    const filteredIndices = filtered.map(item => fetchedDishes.findIndex(fd => fd.dishCode === item.dishCode));
                    setSelectedPopupDishes(selectedPopupDishes.filter(idx => !filteredIndices.includes(idx)));
                  }
                }} 
              />
            </th>
            <th style={{ padding: "6px", border: "1px solid #ccc", textAlign: "left" }}>Code</th>
            <th style={{ padding: "6px", border: "1px solid #ccc", textAlign: "left" }}>Name</th>
          </tr>
        </thead>
        <tbody>
          {fetchedDishes.filter(d => d.dishName.toLowerCase().includes(dishSearchText.toLowerCase())).map((d, i) => {
             const originalIndex = fetchedDishes.findIndex(fd => fd.dishCode === d.dishCode);
             return (
              <tr key={originalIndex} style={{ cursor: "pointer" }} onClick={() => {
                if (selectedPopupDishes.includes(originalIndex)) {
                  setSelectedPopupDishes(selectedPopupDishes.filter(idx => idx !== originalIndex));
                } else {
                  setSelectedPopupDishes([...selectedPopupDishes, originalIndex]);
                }
              }}>
                <td style={{ padding: "6px", border: "1px solid #ccc", textAlign:"center" }}>
                  <input type="checkbox" checked={selectedPopupDishes.includes(originalIndex)} readOnly />
                </td>
                <td style={{ padding: "6px", border: "1px solid #ccc" }}>{d.dishCode}</td>
                <td style={{ padding: "6px", border: "1px solid #ccc" }}>{d.dishName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
    <button style={{ width: "100%", padding: "10px", background: "#4caf50", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }} onClick={(e) => {
      e.preventDefault();
      const selected = selectedPopupDishes.map(idx => fetchedDishes[idx]);
      const newItems = selected.filter(s => !tableData.some(td => td.dishCode === s.dishCode));
      setTableData([...tableData, ...newItems]);
      setShowDishPopup(false);
    }}>
      Add to Order View
    </button>
  </div>
)}
              </div>

              <div className="happyhours-days-box">
                <p>Promotion Days</p>
                {daysList.map(day => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={selectedDays[day]}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div className="happyhours-time-box">
                <label>Promo Start</label>
                <input type="time" value={promoStartTime} onChange={(e) => setPromoStartTime(e.target.value)} />

                <label>Promo End</label>
                <input type="time" value={promoEndTime} onChange={(e) => setPromoEndTime(e.target.value)} />

                <button onClick={handleFetch}>Fetch</button>
              </div>
            </div>

            {/* BOTTOM TABLE */}
            <div className="happyhours-table-wrapper">

              {/* ✅ ONLY ADDITION */}
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                <label>
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} /> Select All
                </label>
                <span>Total Records: {tableData.length}</span>
              </div>

              <table className="happyhours-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Dish Code</th>
                    <th>Dish Name</th>
                    <th>Price</th>
                    <th>Promo Price</th>
                  </tr>
                </thead>

                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="happyhours-empty">No Data</td>
                    </tr>
                  ) : (
                    tableData.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(i)}
                            onChange={() => handleRowSelect(i)}
                          />
                        </td>
                        <td>{item.dishCode}</td>
                        <td>{item.dishName}</td>
                        <td>{item.price}</td>
                        <td>{item.promoPrice}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PROMOTION SECTION UNCHANGED */}
            <div className="happyhours-bottom-section">
              <div className="happyhours-promo-col">
                <input type="radio" name="promoType" value="%" onChange={(e) => setPromotionType(e.target.value)} />
                <label>Promotion %</label>
                <input type="number" value={promotionValue} onChange={(e) => setPromotionValue(e.target.value)} />
              </div>

              <div className="happyhours-promo-col">
                <input type="radio" name="promoType" value="$" onChange={(e) => setPromotionType(e.target.value)} />
                <label>Promotion $</label>
                <input type="number" value={promotionValue} onChange={(e) => setPromotionValue(e.target.value)} />
              </div>

              <button className="happyhours-apply-btn">Apply</button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default HappyHours;