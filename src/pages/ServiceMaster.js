import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ServiceMaster.css";
import { BASE_URL } from "../config/api";

// ✅ CORRECT API URL
const SERVICE_URL = `${BASE_URL}/api/services`;

function ServiceMaster() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🔄 LOAD DATA
  const loadData = async () => {
    try {
      const res = await axios.get(SERVICE_URL);

      console.log("API:", res.data);

      // ✅ SAFE HANDLE
      if (Array.isArray(res.data)) {
        setList(res.data);
      } else if (Array.isArray(res.data.recordset)) {
        setList(res.data.recordset);
      } else {
        setList([]);
      }

    } catch (err) {
      console.error("Load Error:", err);
      setList([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 💾 SAVE / UPDATE
  const handleSave = async () => {
    if (!name) return alert("Enter name");

    try {
      if (editId) {
        await axios.put(`${SERVICE_URL}/${editId}`, {
          SER_NAME: name,
          Activeflag: active,
          ModifiedBy: "11111111-1111-1111-1111-111111111111"
        });
      } else {
        await axios.post(SERVICE_URL, {
          SER_NAME: name,
          Activeflag: active,
          CreatedBy: "11111111-1111-1111-1111-111111111111"
        });
      }

      closeModal();
      loadData();

    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  // ✏️ EDIT
  const handleEdit = (item) => {
    setName(item.SER_NAME);
    setActive(item.Activeflag === true || item.Activeflag === 1);
    setEditId(item.SER_ID);
    setShowModal(true);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVICE_URL}/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ OPEN
  const openModal = () => {
    setName("");
    setActive(true);
    setEditId(null);
    setShowModal(true);
  };

  // ❌ CLOSE
  const closeModal = () => {
    setName("");
    setActive(true);
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="service-container">
      <h2>Service Master</h2>

      <button className="add-btn" onClick={openModal}>
        + Add Service
      </button>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(list) &&
            list.map((item) => (
              <tr key={item.SER_ID}>
                <td>{item.SER_ID}</td>
                <td>{item.SER_NAME}</td>
                <td>
                  {item.Activeflag ? (
                    <span className="active">Active</span>
                  ) : (
                    <span className="inactive">Inactive</span>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.SER_ID)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editId ? "Update Service" : "Add Service"}</h3>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Service"
            />

            <div className="toggle-row">
              <label>Status:</label>
              <input
                type="checkbox"
                checked={active}
                onChange={() => setActive(!active)}
              />
              <span>{active ? "Active" : "Inactive"}</span>
            </div>

            <div className="modal-buttons">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceMaster;