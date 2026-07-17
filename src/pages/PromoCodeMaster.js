import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PromoCodeMaster.css";
import { BASE_URL } from "../config/api";

const emptyForm = {
  PromoId: "",
  PromoCode: "",
  PromoName: "",
  DiscountType: "AMOUNT",
  DiscountValue: "",
  MaxUsage: "",
  UsedCount: 0,
  IsActive: true,
};

export default function PromoCodeMaster() {
  const [showModal, setShowModal] = useState(false);
//   const [search, setSearch] = useState("");
    const [promoCodes, setPromoCodes] = useState([]);
//   const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchPromoCodes = async () => {
  try {
     const res = await axios.get(`${BASE_URL}/api/promocode`);

    if (res.data.success) {
      setPromoCodes(res.data.data);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchPromoCodes();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

 const handleSave = async () => {

 if (!formData.PromoCode.trim()) {
    alert("Promo Code is required");
    return;
}

  try {

   if (formData.PromoId)  {

      await axios.put(
        `${BASE_URL}/api/promocode/${formData.PromoId}`,
        formData
      );

      alert("Updated Successfully");

    } else {

      await axios.post(
        `${BASE_URL}/api/promocode`,
        formData
      );

      alert("Saved Successfully");

    }

    fetchPromoCodes();

    setFormData(emptyForm);
    setShowModal(false);

  } catch (err) {

    console.error(err);

  }

};

  const handleEdit = (item) => {
  setFormData(item);
  setShowModal(true);
};

  const handleDelete = async (id) => {

  if (!window.confirm("Delete this member?"))
    return;

  try {

    await axios.delete(
      `${BASE_URL}/api/promocode/${id}`
    );

    fetchPromoCodes();

  } catch (err) {

    console.error(err);

  }

};

//   const filtered = members.filter((m) =>
//     [m.Name, m.Phone, m.Email]
//       .join(" ")
//       .toLowerCase()
//       .includes(search.toLowerCase())
//   );

  return (
    <div className="member-page">
      <div className="member-header">
        <h2>Promo Code Master</h2>
        <button
            className="member-new-btn"
            onClick={() => {
                setFormData(emptyForm);
                setShowModal(true);
            }}
            >
            + New
            </button>
      </div>

      {/* <div className="search-section">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div> */}

      <div className="member-table-container">
        <div className="member-table-scroll">
        <table className="member-table">
          <thead>
            <tr>
              <th>Promo Code</th>
              <th>Promo Name</th>
              <th>Discount Type</th>
              <th>Discount Value</th>
              <th>Max Usage</th>
              <th>Used Count</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          {/* <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="10">No Members Found</td></tr>
            ) : filtered.map((m,i)=>( */}
            <tbody>
            {promoCodes.length === 0 ? (
                <tr>
                <td colSpan="10">No Promo Codes Found</td>
                </tr>
            ) : (
                promoCodes.map((m, i) => (
                <tr key={i}>
                    <td>{m.PromoCode}</td>
                    <td>{m.PromoName}</td>
                    <td>{m.DiscountType}</td>
                    <td>{m.DiscountValue}</td>
                    <td>{m.MaxUsage}</td>
                    <td>{m.UsedCount}</td>
                    <td>{m.IsActive ? "Active" : "Inactive"}</td>
                    
                 <td className="member-action">
                    <button
                        className="member-edit-link"
                        onClick={() => handleEdit(m)}
                    >
                        Edit
                    </button>

                    <button
                        className="member-delete-btn"
                        onClick={() => handleDelete(m.PromoId)}
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
  <div className="member-modal-overlay">
    <div className="member-modal">
      <h3>{formData.PromoId ? "Edit Promo Code" : "New Promo Code"}</h3>

      <div className="member-form">

        <div className="member-field">
          <label>Promo Code</label>
          <input
            type="text"
            name="PromoCode"
            value={formData.PromoCode}
            onChange={handleChange}
          />
        </div>

        <div className="member-field">
          <label>Promo Name</label>
          <input
            type="text"
            name="PromoName"
            value={formData.PromoName}
            onChange={handleChange}
          />
        </div>

        <div className="member-field">
          <label>Discount Type</label>
          <select
            name="DiscountType"
            value={formData.DiscountType}
            onChange={handleChange}
          >
            <option value="AMOUNT">Amount</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
        </div>

        <div className="member-field">
          <label>Discount Value</label>
          <input
            type="number"
            name="DiscountValue"
            value={formData.DiscountValue}
            onChange={handleChange}
          />
        </div>

        <div className="member-field">
          <label>Max Usage</label>
          <input
            type="number"
            name="MaxUsage"
            value={formData.MaxUsage}
            onChange={handleChange}
          />
        </div>

        <div className="member-field">
          <label>Used Count</label>
          <input
            type="number"
            name="UsedCount"
            value={formData.UsedCount}
            readOnly
          />
        </div>

        <div className="member-field member-active-field">
          <label className="member-status-check">
            <input
              type="checkbox"
              name="IsActive"
              checked={formData.IsActive}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>
        </div>

        <div className="member-modal-footer">
          <button
            className="member-save-btn"
            onClick={handleSave}
          >
            Save
          </button>

          <button
            className="member-cancel-btn"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>

      </div>
        </div>
      </div>
    )}
     
    </div>
  );
}
