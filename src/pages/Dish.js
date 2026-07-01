import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Dish.css";

import { BASE_URL } from "../config/api";


 function Dish() {
 
  const emptyDish = {
    DishId: "",
    DishCode: "",
    Name: "",
    ShortName: "",
    Description: "",
    DishGroupId: "",
    CurrentCost: "",
    SordCode: "",
    UnitCost: "",
    QuantityOnHand: "",
    NameInOtherLanguage: "",
    BrandId: "",
    MobileTab: "",
    AvailableTimeFrom: "",
    AvailableTimeTo: "",
    isMultiPrice: false,
    isOpenitem: false,
    IsSplitDish: false,
    IsgroupDish: false,
    IsShowinKiosk: false,
    IsActive: false,
    iskitchenPrint: false,
    isDiscountAllowed: false,
    IsTaxAllowed: false,
    IsStockDish: false,
    isFOC: false,
    isServiceCharge: false,
    isFavourite: false,
    KitchenType: "General",
    SubkitchenType: "",
  };
 
  const fetchDish = async () => {
  try{
  setLoading(true);  // 🔥 START LOADER
  const res = await axios.get(`${BASE_URL}/dish`);
 
  setEntries(res.data);
  
  }catch(err){
  
  console.error("DishGroup load error:",err);
  
  }finally {
    setLoading(false);  // 🔥 STOP LOADER
  }
  };

  // ✅ PAGE LOAD
 useEffect(()=>{
  fetchDish();

  axios.get(`${BASE_URL}/modifier`)
    .then(res => setdishModifiers(res.data));

  axios.get(`${BASE_URL}/kitchen`)
    .then(res => setdishKitchens(res.data));

     axios.get(`${BASE_URL}/dishgroup`)
  .then(res => {
    console.log("DISH GROUP DATA 👉", res.data); // ✅ CHECK HERE
    setDishGroups(res.data);
  })
  .catch(err => console.error("DishGroup error:", err));

  // axios.get(`${BASE_URL}/dishorderitemshare`)
  // .then(res => {
  //   console.log("ORDER ITEM SHARE 👉", res.data);
  //   setOrderItemShare(res.data);
  // })
  // .catch(err => {
  //   console.log("ORDER ITEM SHARE ERROR", err);
  // });

 },[]);

 

  const [entries,setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("customize");
  const [dish, setDish] = useState(emptyDish);
  const [dishes, setDishes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [categoryImage, setDishImage] = useState(null);
  const [buttonColor, setButtonColor] = useState("#2e7d32");
  const [textColor, setTextColor] = useState("#fff");
  const [displayName, setDisplayName] = useState(true);
  const [existingImage, setExistingImage] = useState(null);
  const [dishGroups, setDishGroups] = useState([]);
  const [showDishGroupModal, setShowDishGroupModal] = useState(false);
const [selectedDishGroups, setSelectedDishGroups] = useState([]);

  const [dishmodifier, setdishModifiers] = useState([]);
  const [dishkitchens, setdishKitchens] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selecteddishModifiers, setSelecteddishModifiers] = useState([]);
  const [selecteddishKitchens, setSelecteddishKitchens] = useState([]);

  const [orderItemShare, setOrderItemShare] = useState([]);
 const [selectedOrderItemShare, setSelectedOrderItemShare] = useState([]);

  useEffect(() => {
  if (showModal && !dish.DishId) {
    setSelecteddishKitchens([]);
    setSelecteddishModifiers([]);
  }
}, [showModal]);
 
  const colorPickerRef = useRef(null);
  const textColorPickerRef = useRef(null);

  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
 
    setDish({
      ...dish,
      [name]: type === "checkbox" ? checked : value
    });
  };
 
  const handleImageUpload = (e) => {
  const file = e.target.files[0];
 
    if (file) {
      const url = URL.createObjectURL(file);
      setDishImage(file);   
    }
  };
 
  const clearImage = () => {
    setDishImage(null);
    
  };
 
  /* ❌ Apply All disabled */
  const applyAll = () => {};
 
  const handleSave = async () => {

  if (!dish.DishCode) {
   alert("Dish Code must be entered. ");
  return;
}

  if (!dish.Name) {
   alert("Name must be entered. ");
  return;
}

//   if (!dish.CurrentCost) {
//    alert("Price must be entered. ");
//   return;
// }

  if (!dish.DishGroupId || dish.DishGroupId === "") {
  alert("Dish Group must be entered. ❗");
  return;
}

  try {
     setLoading(true);
      console.log("SAVE CLICKED");

      console.log("KITCHEN SEND 👉", selecteddishKitchens);

    // 🔥 create FormData
    const formData = new FormData();

    // 🔥 append all fields
    Object.keys(dish).forEach((key) => {
  if (typeof dish[key] === "boolean") {
    formData.append(key, dish[key] ? 1 : 0);
  } else if (dish[key] !== null && dish[key] !== "") {
    formData.append(key, dish[key]);
  }
});

    // 🔥 number fix
    formData.set("CurrentCost", Number(dish.CurrentCost) || 0);
    formData.set("UnitCost", Number(dish.UnitCost) || 0);
    formData.set("QuantityOnHand", Number(dish.QuantityOnHand) || 0);
    formData.set("SordCode", Number(dish.SordCode) || 0);
    formData.append("KitchenType", "General");       
    formData.append("SubkitchenType", "");
    
    formData.set("IsActive", dish.IsActive ? 1 : 0);
    formData.set("iskitchenPrint", dish.iskitchenPrint ? 1 : 0);
    formData.set("isDiscountAllowed", dish.isDiscountAllowed ? 1 : 0);
    formData.set("IsTaxAllowed", dish.IsTaxAllowed ? 1 : 0);
    formData.set("IsStockDish", dish.IsStockDish ? 1 : 0);
    formData.set("isFOC", dish.isFOC ? 1 : 0);
    formData.set("isServiceCharge", dish.isServiceCharge ? 1 : 0);
    formData.set("isFavourite", dish.isFavourite ? 1 : 0);
    
     const selectedKitchens = selecteddishKitchens.map(code => {
  const k = dishkitchens.find(x => Number(x.KitchenTypeCode) === code);

  return {
    KitchenTypeCode: code,
    KitchenTypeName: k?.KitchenTypeName || ""
  };
});

formData.set(
  "KitchenTypes",
  JSON.stringify(selectedKitchens)
);

      formData.append(
      "Modifiers",
      JSON.stringify(selecteddishModifiers || [])
    );

    formData.append(
  "DishGroups",
  JSON.stringify(selectedDishGroups || [])
);

formData.append(
  "OrderItemShares",
  JSON.stringify(selectedOrderItemShare || [])
);

    // 🔥 image file
    if (categoryImage) {
      formData.append("image", categoryImage);
    }

    console.log("FORM DATA READY ✅");

    for (let pair of formData.entries()) {
  console.log(pair[0] + " = " + pair[1]);
}
   if (editIndex !== null && dish.DishId) {
  await axios.put(
    `${BASE_URL}/dish/${dish.DishId}`,
    formData,   // ✅ IMPORTANT
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  alert("Updated ✅");

} else {
  await axios.post(
    `${BASE_URL}/dish`,
    formData,   // ✅ IMPORTANT
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  alert("Inserted ✅");
}

    fetchDish();            // 🔥 reload table
    setShowModal(false);
    setDish(emptyDish);
    setEditIndex(null);
    setDishImage(null);
setExistingImage(null);

  } catch (err) {
    console.log("SAVE ERROR ❌", err.response?.data || err.message);
  }finally {
    setLoading(false);  // 🔥 ADD THIS
  }
};
 
  const handleCancel = () => {
    setShowModal(false);
    setEditIndex(null);

      setSelecteddishKitchens([]);   // 🔥 ADD THIS
  setSelecteddishModifiers([]);  // 🔥 ADD THIS
  };

  const handleToggle = async (row, field, value) => {
  const oldValue = row[field];

  // ✅ UI update
  setEntries((prev) =>
    prev.map((item) =>
      item.DishId === row.DishId
        ? { ...item, [field]: value }
        : item
    )
  );

  try {
    await axios.post(`${BASE_URL}/dish`, {
      ...row,
      [field]: value ? 1 : 0,
    });

    fetchDish(); // 🔥 refresh

  } catch (err) {
    console.error("ERROR ❌", err);

    // rollback
    setEntries((prev) =>
      prev.map((item) =>
        item.DishId === row.DishId
          ? { ...item, [field]: oldValue }
          : item
      )
    );
  }
};

const handleDelete = async (id, e) => {
  if (e) e.stopPropagation();
  if (!window.confirm("Delete this dish?")) return;

  try {
    setLoading(true);
    await axios.delete(`${BASE_URL}/dish/${id}`);
    fetchDish();
  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  } finally {
    setLoading(false);
  }
};
 
  const openNewDish = async () => {
  try {
    // const res = await axios.get(`${BASE_URL}/dish/nextcode`);

    try {
      const shareRes = await axios.get(`${BASE_URL}/dishorderitemshare`);
      console.log("SHARE DATA => ", shareRes.data);
      setOrderItemShare(shareRes.data);
    } catch (err) {
      console.log("ORDER ITEM SHARE ERROR", err);
      setOrderItemShare([]);
    }

    setDish({
      ...emptyDish,
       DishCode: ""    // 🔥 AUTO CODE SHOW
    });

    setSelecteddishKitchens([]);
    setSelecteddishModifiers([]);
    setSelectedDishGroups([]);
    setSelectedOrderItemShare([]);
     setDishImage(null);        // 🔥 ADD THIS
    setExistingImage(null); 
    setEditIndex(null);
    setShowModal(true);

  } catch (err) {
    console.log("CODE LOAD ERROR ❌", err);
  }
};

  
      const getGroupName = (id) => {
      const group = dishGroups.find(g => g.DishGroupId === id);
       return group ? group.DishGroupName : id; 
    };
 
const handleEdit = async (data) => {
  console.log("EDIT DATA =", data);
  setDish(data);
  setExistingImage(data.ImageData);

  // Each call wrapped individually so one 500 won't block the modal
  try {
    const shareRes = await axios.get(`${BASE_URL}/dishorderitemshare`);
    console.log("EDIT SHARE DATA => ", shareRes.data);
    setOrderItemShare(shareRes.data);
  } catch (err) {
    console.log("ORDER ITEM SHARE ERROR", err);
    setOrderItemShare([]);
  }

  let kIds = [];
  try {
    const kRes = await axios.get(`${BASE_URL}/dishkitchen/${data.DishId}`);
    kIds = kRes.data.map(x => Number(x.KitchenTypeCode));
  } catch (err) {
    console.log("DISH KITCHEN ERROR", err);
  }

  let mIds = [];
  try {
    const mRes = await axios.get(`${BASE_URL}/dishmodifier/${data.DishId}`);
    mIds = mRes.data.map(x => String(x.ModifierId));
  } catch (err) {
    console.log("DISH MODIFIER ERROR", err);
  }

  let dgIds = [];
  try {
    const dgRes = await axios.get(`${BASE_URL}/dishgroupmapping/${data.DishId}`);
    dgIds = dgRes.data.map(x => String(x.DishGroupId));
  } catch (err) {
    console.log("DISH GROUP MAPPING ERROR", err);
  }

  try {
    const osRes = await axios.get(`${BASE_URL}/orderitemshare/${data.DishId}`);
    const osNames = osRes.data.map(x => x.CustomerName);
    setSelectedOrderItemShare(osNames);
  } catch (err) {
    console.log("ORDER ITEM SHARE MAPPING ERROR", err);
    setSelectedOrderItemShare([]);
  }

  setSelecteddishKitchens(kIds);
  setSelecteddishModifiers(mIds);
  setSelectedDishGroups(dgIds);

  setShowModal(true);
};

const filteredData = entries.filter((row) => {
  return Object.keys(filters).every((key) => {
    if (!filters[key]) return true;

    let value = row[key];

    // ✅ GROUP NAME FIX
if (key === "DishGroupId") {
  value = getGroupName(row.DishGroupId);
}

    // ✅ NULL FIX
    if (value === null || value === undefined) {
      value = "";
    }

    // ✅ BOOLEAN → YES/NO FIX (ALL FIELDS)
    if (typeof value === "boolean") {
      value = value ? "yes" : "no";
    }

    return String(value)
      .toLowerCase()
      .includes(filters[key].toLowerCase());
  });
});

const totalRows = filteredData.length;

      const totalPages =
        rowsPerPage === "ALL"
          ? 1
          : Math.ceil(totalRows / rowsPerPage);

      const startIndex =
        rowsPerPage === "ALL"
          ? 0
          : (currentPage - 1) * rowsPerPage;

      const endIndex =
        rowsPerPage === "ALL"
          ? totalRows
          : startIndex + rowsPerPage;

      const paginatedData =
        rowsPerPage === "ALL"
          ? filteredData
          : filteredData.slice(startIndex, endIndex);

          const showingFrom = totalRows === 0 ? 0 : startIndex + 1;

  const showingTo =
  rowsPerPage === "ALL"
    ? totalRows
    : Math.min(startIndex + rowsPerPage, totalRows);
 
  return (
    <div className="dish-page1">

    <div className="dish-header">
  <h1>Dish Master</h1>

  <div className="dish-header-right">
    
    <button className="dish-new-btn1" onClick={openNewDish}>
      New
    </button>

    <select
      value={rowsPerPage}
      onChange={(e) => {
        const value = e.target.value === "ALL" ? "ALL" : Number(e.target.value);
        setRowsPerPage(value);
        setCurrentPage(1);
      }}
      className="rows-dropdown"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={30}>30</option>
      <option value={50}>50</option>
      <option value="ALL">All</option>
    </select>

  </div>
</div>
      
 
      <div className="dish-report-section1">
        <div className="table-scroll">
        <table className="dish-report-table1">
 
          <thead>
            <tr>
            <th onClick={() => setActiveFilter("DishCode")}>
              Dish Code
              
               {activeFilter === "DishCode" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  type="text"
                  value={filters.DishCode || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, DishCode: e.target.value })
                  }
                />
              )}
            </th>
             <th onClick={() => setActiveFilter("Name")}>
              Name
              
               {activeFilter === "Name" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  type="text"
                  value={filters.Name || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, Name: e.target.value })
                  }
                />
              )}
            </th>
               <th onClick={() => setActiveFilter("ShortName")}>
              Short Name
              
               {activeFilter === "ShortName" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  type="text"
                  value={filters.ShortName || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, ShortName: e.target.value })
                  }
                />
              )}
            </th>
            {/* Description */}
            <th onClick={() => setActiveFilter("Description")}>
              Description
              {activeFilter === "Description" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.Description || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, Description: e.target.value })
                  }
                />
              )}
            </th>

            {/* Group */}
            <th onClick={() => setActiveFilter("DishGroupId")}>
              Group
              {activeFilter === "DishGroupId" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.DishGroupId || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, DishGroupId: e.target.value })
                  }
                />
              )}
            </th>

            {/* Price */}
            <th onClick={() => setActiveFilter("CurrentCost")}>
              Price
              {activeFilter === "CurrentCost" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.CurrentCost || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, CurrentCost: e.target.value })
                  }
                />
              )}
            </th>

            {/* Sort Code */}
            <th onClick={() => setActiveFilter("SordCode")}>
              Sort Code
              {activeFilter === "SordCode" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.SordCode || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, SordCode: e.target.value })
                  }
                />
              )}
            </th>

            {/* Unit Cost */}
            <th onClick={() => setActiveFilter("UnitCost")}>
              Unit Cost
              {activeFilter === "UnitCost" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.UnitCost || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, UnitCost: e.target.value })
                  }
                />
              )}
            </th>

            {/* Qty */}
            <th onClick={() => setActiveFilter("QuantityOnHand")}>
              Qty
              {activeFilter === "QuantityOnHand" && (
                <input
                  onClick={(e) => e.stopPropagation()}
                  value={filters.QuantityOnHand || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, QuantityOnHand: e.target.value })
                  }
                />
              )}
            </th>

            {/* Active */}
            <th onClick={() => setActiveFilter("IsActive")}>
              Active
              {activeFilter === "IsActive" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.IsActive || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, IsActive: e.target.value })
                  }
                />
              )}
            </th>

            {/* Kitchen */}
            <th onClick={() => setActiveFilter("iskitchenPrint")}>
              Kitchen
              {activeFilter === "iskitchenPrint" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.iskitchenPrint || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, iskitchenPrint: e.target.value })
                  }
                />
              )}
            </th>

            {/* Discount */}
            <th onClick={() => setActiveFilter("isDiscountAllowed")}>
              Discount
              {activeFilter === "isDiscountAllowed" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.isDiscountAllowed || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, isDiscountAllowed: e.target.value })
                  }
                />
              )}
            </th>

            {/* Tax */}
            {/* <th onClick={() => setActiveFilter("IsTaxAllowed")}>
              Tax
              {activeFilter === "IsTaxAllowed" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.IsTaxAllowed || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, IsTaxAllowed: e.target.value })
                  }
                />
              )}
            </th> */}

            {/* Stock */}
            {/* <th onClick={() => setActiveFilter("IsStockDish")}>
              Stock
              {activeFilter === "IsStockDish" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.IsStockDish || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, IsStockDish: e.target.value })
                  }
                />
              )}
            </th> */}

            {/* FOC */}
            {/* <th onClick={() => setActiveFilter("isFOC")}>
              FOC
              {activeFilter === "isFOC" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.isFOC || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, isFOC: e.target.value })
                  }
                />
              )}
            </th> */}

            {/* Service */}
            {/* <th onClick={() => setActiveFilter("isServiceCharge")}>
              Service
              {activeFilter === "isServiceCharge" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.isServiceCharge || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, isServiceCharge: e.target.value })
                  }
                />
              )}
            </th> */}

            {/* Favourite */}
            {/* <th onClick={() => setActiveFilter("isFavourite")}>
              Favourite
              {activeFilter === "isFavourite" && (
                <input
                  placeholder="yes / no"
                  onClick={(e) => e.stopPropagation()}
                  value={filters.isFavourite || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, isFavourite: e.target.value })
                  }
                />
              )}
            </th> */}
            <th>Actions</th>
          </tr>
          </thead>
 
          <tbody>

            {loading ? (
              <tr>
                <td colSpan="13">
                  <div className="spinner"></div>
                </td>
              </tr>

            ) : entries.length === 0 ? (

              <tr>
                <td colSpan="13">No Data Found</td>
              </tr>

            ) : (

              paginatedData.map((d, i) => (
                <tr
                  key={i}
                  onClick={() => handleEdit(d)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{d.DishCode}</td>
                  <td>{d.Name}</td>
                  <td>{d.ShortName}</td>
                  <td>{d.Description}</td>
                 <td>{getGroupName(d.DishGroupId)}</td>
                  <td>{d.CurrentCost}</td>
                  <td>{d.SordCode}</td>
                  <td>{d.UnitCost}</td>
                  <td>{d.QuantityOnHand}</td>
                 <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!d.IsActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggle(d, "IsActive", e.target.checked);
                      }}
                    />
                  </td>

                 <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={!!d.iskitchenPrint}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(d, "iskitchenPrint", e.target.checked);
                    }}
                  />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={!!d.isDiscountAllowed}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(d, "isDiscountAllowed", e.target.checked);
                    }}
                  />
                </td>
                  {/* <td>{d.IsTaxAllowed ? "Yes" : "No"}</td> */}
                  {/* <td>{d.IsStockDish ? "Yes" : "No"}</td> */}
                  {/* <td>{d.isFOC ? "Yes" : "No"}</td> */}
                  {/* <td>{d.isServiceCharge ? "Yes" : "No"}</td> */}
                  {/* <td>{d.isFavourite ? "Yes" : "No"}</td> */}
                <td onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => handleDelete(d.DishId, e)} 
                    style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
                </tr>
              ))
            )}
          </tbody>
 
        </table>
         </div>
      </div>
 
      {showModal && (
        <div className="dish-modal-overlay">
 
          <div className="dish-modal-box1">

            <div className="dish-modal-header1">

  <h2>Dish</h2>

  <div className="dish-header-buttons">
 <button 
  className="dish-save-btn1" 
  onClick={handleSave} 
  disabled={loading}
>
  {loading ? "Saving..." : "Save"}
</button>

    <button className="dish-cancel-btn2" onClick={handleCancel}>
      Cancel
    </button>
  </div>

</div>
 
            <div className="dish-layout1">
 
              {/* LEFT SIDE */}
              <div className="dish-left1">

               <div className="dish-form-grid">

              <div className="dish-form-row1">
                <label>
                Dish Code <span className="required">*</span>
                </label>
                <input name="DishCode" value={dish.DishCode} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                <label>
                Name <span className="required">*</span>
                </label>
                <input name="Name" value={dish.Name} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                <label>Short Name</label>
                <input name="ShortName" value={dish.ShortName} onChange={handleChange} />
              </div>

              {/* 🔥 FULL WIDTH */}
              <div className="dish-form-row1">
                <label>Description</label>
                <textarea name="Description" value={dish.Description} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                {/* <label>Dish Group</label> */}
                <label>
                Dish Group <span className="required">*</span>
                </label>
                <select name="DishGroupId" value={dish.DishGroupId} onChange={handleChange}>
                  <option value="">Select Dish Group</option>
                  {dishGroups.map((g) => (
                    <option key={g.DishGroupId} value={g.DishGroupId}>
                      {g.DishGroupName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dish-form-row1">
                {/* <label>Price</label> */}
                <label>
               Price <span className="required">*</span>
                </label>
                <input name="CurrentCost" value={dish.CurrentCost} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                <label>Sort Code</label>
                <input name="SordCode" value={dish.SordCode} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                <label>Unit Cost</label>
                <input name="UnitCost" value={dish.UnitCost} onChange={handleChange} />
              </div>

              <div className="dish-form-row1">
                <label>Quantity</label>
                <input name="QuantityOnHand" value={dish.QuantityOnHand} onChange={handleChange} />
              </div>

              {/* <div className="dish-form-row1">
                <label>Other Language</label>
                <input name="NameInOtherLanguage" value={dish.NameInOtherLanguage} onChange={handleChange} />
              </div> */}

              <div className="dish-form-row">
                
              </div>

            </div>  
 
                {/* CHECKBOX GRID */}
                <div className="dish-check-grid1">
                  <label><input type="checkbox" name="IsActive" checked={dish.IsActive} onChange={handleChange} /> Active</label>
                  <label><input type="checkbox" name="iskitchenPrint" checked={dish.iskitchenPrint} onChange={handleChange} /> kitchen</label>
                  <label><input type="checkbox" name="isDiscountAllowed" checked={dish.isDiscountAllowed} onChange={handleChange} /> Discount Allowed</label>
                  <label><input type="checkbox" name="IsTaxAllowed" checked={dish.IsTaxAllowed} onChange={handleChange} /> Tax</label>
                  <label><input type="checkbox" name="IsStockDish" checked={dish.IsStockDish} onChange={handleChange} /> Stock Dish</label>
                  <label><input type="checkbox" name="isFOC" checked={dish.isFOC} onChange={handleChange} /> FOC</label>
                  <label><input type="checkbox" name="isServiceCharge" checked={dish.isServiceCharge} onChange={handleChange} /> Service Charge</label>
                  <label><input type="checkbox" name="isFavourite" checked={dish.isFavourite} onChange={handleChange} /> Favourite</label>
                  <label><input type="checkbox" name="isMultiPrice" checked={dish.isMultiPrice} onChange={handleChange} /> MultiPrice</label>
                  <label><input type="checkbox" name="isOpenitem" checked={dish.isOpenitem} onChange={handleChange} /> Open Price</label>
                  <label><input type="checkbox" name="IsSplitDish" checked={dish.IsSplitDish} onChange={handleChange} /> Artist</label>
                  <label><input type="checkbox" name="IsgroupDish" checked={dish.IsgroupDish} onChange={handleChange} /> Group Dish</label>
                </div>
 
              </div>
 
   {/* 🔽 TABS BELOW FORM */}
        <div className="dish-tabs-full">
          <button
            className={activeTab === "customize" ? "active-tab" : ""}
            onClick={() => setActiveTab("customize")}
          >
            Dish
          </button>

          <button
            className={activeTab === "modifier" ? "active-tab" : ""}
            onClick={() => setActiveTab("modifier")}
          >
            Modifier
          </button>

          <button
            className={activeTab === "kitchen" ? "active-tab" : ""}
            onClick={() => setActiveTab("kitchen")}
          >
            Kitchen
          </button>

          <button
          className={activeTab === "dishgroup" ? "active-tab" : ""}
          onClick={() => setActiveTab("dishgroup")}
        >
          Dish Group
        </button>
       {/* <button
  className={activeTab === "orderitemshare" ? "active-tab" : ""}
  onClick={() => setActiveTab("orderitemshare")}
>
  Order Item Share
</button>*/}
        </div>

        {/* 🔽 TAB CONTENT */}

        {activeTab === "customize" && (
          <div className="dish-customize-layout">

          <div className="dish-image-row">

          {/* IMAGE */}
          <div className="dish-image-box1">
            {categoryImage ? (
              <img src={URL.createObjectURL(categoryImage)} alt="dish" />
            ) : existingImage ? (
              <img src={existingImage} alt="dish" />
            ) : null}
          </div>

          {/* BUTTONS SIDE */}
         <div className="dish-img-btns1">

  {/* 📷 Scan */}
  <label className="btn-icon">
    📷 
    <input type="file" hidden onChange={handleImageUpload} />
  </label>

  {/* 🗑 Clear */}
  <button className="btn-icon light" onClick={clearImage}>
    🗑 
  </button>

</div>

        </div>

  </div>
)}

       {activeTab === "modifier" && (
  <div className="dish-modifier-main">

    {/* 🔹 TOP SEARCH */}
    <input
      type="text"
      placeholder="Search Modifier..."
      className="dish-modifier-search"
    />

    {/* 🔹 LIST BELOW */}
    <div className="dish-modifier-container">
      {dishmodifier.map((mod) => (
        <label key={mod.ModifierId} className="dish-modifier-item">
          <input
            type="checkbox"
            checked={selecteddishModifiers.includes(String(mod.ModifierId))}
            onChange={(e) => {
              if (!dish.DishId) {
                alert("Please save dish first ❗");
                return;
              }

              const value = String(mod.ModifierId);

              if (e.target.checked) {
                setSelecteddishModifiers((prev) =>
                  prev.includes(value) ? prev : [...prev, value]
                );
              } else {
                setSelecteddishModifiers((prev) =>
                  prev.filter((id) => id !== value)
                );
              }
            }}
          />
          {mod.ModifierName}
        </label>
      ))}
    </div>

  </div>
)}

        {activeTab === "kitchen" && (
          <div className="dish-kitchen-container">
            {dishkitchens.map((k) => (
              <label key={k.KitchenTypeCode}>
                <input
                  type="checkbox"
                  checked={selecteddishKitchens.includes(Number(k.KitchenTypeCode))}
                  onChange={(e) => {
                    if (!dish.DishId) {
                      alert("Please save dish first ❗");
                      return;
                    }

                    const value = Number(k.KitchenTypeCode);

                    if (e.target.checked) {
                      setSelecteddishKitchens((prev) =>
                        prev.includes(value) ? prev : [...prev, value]
                      );
                    } else {
                      setSelecteddishKitchens((prev) =>
                        prev.filter((id) => id !== value)
                      );
                    }
                  }}
                />
                {k.KitchenTypeName}
              </label>
            ))}
          </div>
        )}

        {activeTab === "dishgroup" && (
  <div className="dish-kitchen-container">
    {dishGroups.map((g) => (
      <label key={g.DishGroupId}>
        <input
          type="checkbox"
          checked={selectedDishGroups.includes(g.DishGroupId)}
          onChange={(e) => {
            const value = g.DishGroupId;

            if (e.target.checked) {
              setSelectedDishGroups((prev) =>
                prev.includes(value)
                  ? prev
                  : [...prev, value]
              );
            } else {
              setSelectedDishGroups((prev) =>
                prev.filter((id) => id !== value)
              );
            }
          }}
        />
        {g.DishGroupName}
      </label>
    ))}
  </div>
)}

{/* {activeTab === "orderitemshare" && (
  <div className="dish-kitchen-container">

    {orderItemShare.map((item) => (

      <label key={item.Id}>
        <input
          type="checkbox"
          checked={selectedOrderItemShare.includes(item.CustomerName)}
          onChange={(e) => {

            const value = item.CustomerName;

            if (e.target.checked) {

              setSelectedOrderItemShare(prev =>
                [...prev, value]
              );

            } else {

              setSelectedOrderItemShare(prev =>
                prev.filter(x => x !== value)
              );

            }
          }}
        />

        {item.CustomerName}

      </label>

    ))}

  </div>
)} */}

</div>
        </div>
 
        </div>
      )}

      <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>

  <button
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
    disabled={currentPage === 1}
  >
    Prev
  </button>

  <span>
    page {showingFrom}–{showingTo} of {totalRows}
  </span>

  <button
    onClick={() =>
      setCurrentPage((p) => Math.min(p + 1, totalPages))
    }
    disabled={currentPage === totalPages}
  >
    Next
  </button>

</div>
 
    </div>
  );
}
 
export default Dish;
 