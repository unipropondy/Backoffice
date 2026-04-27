import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import "./CustomerList.css";

function CustomerList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);   // 🔥 loading state
  const [error, setError] = useState("");         // 🔥 error state

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/customer`);

      console.log("API DATA 👉", res.data);

      setData(res.data);
      setLoading(false);

    } catch (err) {
      console.log("ERROR ❌", err.response?.data || err.message);

      setError("Failed to load data");
      setLoading(false);
    }
  };

  return (
    <div className="list-container">

      {/* Header */}
      <div className="list-header">
        <h2>Customer List</h2>

        <button onClick={() => navigate("/Member")}>
          New
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <table className="list-table">

          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>City</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {data && data.length > 0 ? (
              data.map((row) => (
                <tr
                  key={row.CustomerId}
                  onClick={() => navigate(`/Member/${row.CustomerId}`)}
                >
                  <td>{row.CustomerCode}</td>
                  <td>{row.Name}</td>
                  <td>{row.ContactPerson}</td>
                  <td>{row.EmailId1}</td>
                  <td>{row.Address1_City}</td>
                  <td>{row.Address1_Telephone1}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      )}

    </div>
  );
}

export default CustomerList;