import React, { useEffect, useState } from "react";
import axios from "axios";
import "./server.css";
import { BASE_URL } from "../config/api";
const API_URL = `${BASE_URL}/api/server`;

function WaiterMaster() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    SER_ID: "",
    SER_NAME: "",
    Activeflag: false
  });

  // ✅ Fetch Data
  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Open Modal
  const openModal = (item = null) => {
    if (item) {
      setForm(item);
    } else {
      setForm({
        SER_ID: "",
        SER_NAME: "",
        Activeflag: false
      });
    }
    setShowModal(true);
  };

  // ✅ Close Modal
  const closeModal = () => {
    setShowModal(false);
  };

  // ✅ Handle Input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // ✅ Save / Update
  const handleSave = async () => {
    try {
      if (!form.SER_NAME) {
        alert("Enter Waiter Name");
        return;
      }

     if (form.SER_ID) {
        await axios.put(`${API_URL}/${form.SER_ID}`, form); // ✅ FIXED
        } else {
        await axios.post(API_URL, form); // ✅ FIXED
        }

      fetchData();
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="container">
      <h2>👨‍🍳 Waiter Master</h2>

      <button className="add-btn" onClick={() => openModal()}>
        ➕ Add Waiter
      </button>

      {/* ✅ TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Waiter Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.SER_ID}>
              <td>{item.SER_ID}</td>
              <td>{item.SER_NAME}</td>
              <td>{item.Activeflag ? "Active" : "Inactive"}</td>

              <td>
                <button className="edit-btn" onClick={() => openModal(item)}>
                  ✏ Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ MODAL */}
      {showModal && (
        <div className="ser_modal">
          <div className="ser_modal_content">
            <h3>{form.SER_ID ? "Edit Waiter" : "Add Waiter"}</h3>

            <input
              type="text"
              name="SER_NAME"
              placeholder="Enter Waiter Name"
              value={form.SER_NAME}
              onChange={handleChange}
            />

            <br /><br />

            <label>
              <input
                type="checkbox"
                name="Activeflag"
                checked={form.Activeflag}
                onChange={handleChange}
              />
              Active
            </label>

            <br /><br />

            <button className="save-btn" onClick={handleSave}>
              💾 Save
            </button>
            <button className="cancel-btn" onClick={closeModal}>
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaiterMaster;