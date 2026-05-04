import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CancelRemarkModal.css";
import { BASE_URL } from "../config/api";

const API = `${BASE_URL}`;

export default function CancelRemarkModal() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    SER_NAME: "",
    Activeflag: true
  });

  // 🔥 GET
  const fetchData = async () => {
    const res = await axios.get(`${API}/api/cancelRemarks`);
    setData(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // 🔥 SAVE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${API}/api/cancelRemarks/${editId}`, form);
      } else {
        await axios.post(`${API}/api/cancelRemarks`, form);
      }

      fetchData();
      setShowModal(false);
      setEditId(null);

    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 DELETE
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/cancelRemarks/${editId}`);
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="service-container">

      {/* HEADER */}
      <div className="service-header">
        <h2>Cancel Remark Modal</h2>

        <button
          className="new-btn"
          onClick={() => {
            setForm({
              SER_NAME: "",
              Activeflag: true
            });
            setEditId(null);
            setShowModal(true);
          }}
        >
          New
        </button>
      </div>

      {/* TABLE */}
      <table className="service-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr
              key={i}
              onClick={() => {
                setForm({
                  SER_NAME: item.SER_NAME,
                  Activeflag: item.Activeflag === true || item.Activeflag === 1
                });
                setEditId(item.SER_ID);
                setShowModal(true);
              }}
            >
              <td>{item.SER_ID}</td>
              <td>{item.SER_NAME}</td>
              <td>
                {item.Activeflag ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Service Master</h2>

            <form onSubmit={handleSave} className="form-grid">

              <div className="form-group">
                <label>Service Name</label>
                <input
                  name="SER_NAME"
                  value={form.SER_NAME}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <input
                  type="checkbox"
                  name="Activeflag"
                  checked={form.Activeflag}
                  onChange={handleChange}
                />
                <span>
                  {form.Activeflag ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="actions">
                <button type="submit" className="btn save">
                  Save
                </button>

                {editId && (
                  <button
                    type="button"
                    className="btn delete"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                )}

                <button
                  type="button"
                  className="btn exit"
                  onClick={() => setShowModal(false)}
                >
                  Exit
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

