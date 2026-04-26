import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import "./CustomerList.css";

function CustomerList() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/customer`);
    
    console.log("API DATA 👉", res.data);   // 🔥 ADD THIS
    
    setData(res.data);

  } catch (err) {
    console.log("ERROR ❌", err);  // 🔥 MODIFY THIS
  }
};

  return (
    <div className="list-container">

      <div className="list-header">
        <h2>Customer List</h2>

        <button onClick={() => navigate("/Member")}>
          New
        </button>
      </div>

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
          {data.map((row) => (
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
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default CustomerList;