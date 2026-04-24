import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settlement.css";
import axios from "axios";
import { BASE_URL } from "../config/api";

export default function Settlement() {

  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString() + " " + now.toLocaleTimeString();
      setDateTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  fetchData();
}, []);
const fetchData = async () => {
  try {
    const terminal = "SR";
    const userId = "123";

    // ✅ TOTAL API
    const res = await axios.get(
      `${BASE_URL}/api/settlement/totals/${terminal}`
    );

    setSettlement({
      SubTotal: res.data.SubTotal,
      DiscountAmount: res.data.DiscountAmount,
      ServiceCharge: res.data.ServiceCharge,
      TotalTax: res.data.TotalTax,
      RoundedBy: res.data.RoundedBy,
      Tips: res.data.Tips,
      TotalPax: res.data.TotalPax || 0,
    });

    // ✅ PAYMENT API
    const payRes = await axios.get(
      `${BASE_URL}/api/settlement/payment/${terminal}/${userId}`
    );

    setSalesSummary(
      payRes.data.map(p => ({
        Paymode: p.PaymodeName,
        ManualAmount: p.SysAmount
      }))
    );

    // ✅ TRANSACTION API
    const tranRes = await axios.get(
      `${BASE_URL}/api/settlement/transactions/${terminal}/${userId}`
    );

    setTransactions(
      tranRes.data.map(t => ({
        Paymode: t.TransactionMode,
        CashIn: t.TransactionType === "Cash In" ? t.Amount : 0,
        CashOut: t.TransactionType === "Cash Out" ? t.Amount : 0,
      }))
    );

  } catch (err) {
    console.error("API Error ❌", err);
  }
};

  // ✅ UPDATED: Smart close (back + fallback to home)
  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home", { replace: true });
    }
  };

  // ✅ UPDATED: ESC key navigation (same logic)
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/home", { replace: true });
        }
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  const [settlement, setSettlement] = useState({
    SysAmount: 0,
    ManualAmount: 0,
    TotalTax: 0,
    ServiceCharge: 0,
    DiscountAmount: 0,
    SubTotal: 0,
    RoundedBy: 0,
    Tips: 0,
    TotalPax: 0,
    VoidAmount: 0,
  });

  const [transactions, setTransactions] = useState([
    { Paymode: "CASH", CashIn: 0, CashOut: 0 },
    { Paymode: "NETS", CashIn: 0, CashOut: 0 },
    { Paymode: "PAYNOW", CashIn: 0, CashOut: 0 },
  ]);

  const [salesSummary, setSalesSummary] = useState([
    { Paymode: "CASH", ManualAmount: 0 },
    { Paymode: "NETS", ManualAmount: 0 },
    { Paymode: "PAYNOW", ManualAmount: 0 },
  ]);

  const handleSettlementChange = (e) => {
    const { name, value } = e.target;
    setSettlement({ ...settlement, [name]: value });
  };

  const handleTransactionChange = (index, field, value) => {
    const data = [...transactions];
    data[index][field] = value;
    setTransactions(data);
  };

  const handleSalesChange = (index, value) => {
    const data = [...salesSummary];
    data[index].ManualAmount = value;
    setSalesSummary(data);
  };

   const saveSettlement = async () => {
  try {
    const payload = {
      terminal: "SR",
      userId: "123",
      settlement,
      transactions,
      salesSummary,
    };

    await axios.post(
  `${BASE_URL}/api/settlement`,
  payload
);

    alert("Saved Successfully ✅");

  } catch (err) {
    console.error("Save Error ❌", err);
  }
};

  const netSales = () => {
    return (
      parseFloat(settlement.SubTotal || 0) +
      parseFloat(settlement.ServiceCharge || 0) +
      parseFloat(settlement.TotalTax || 0) +
      parseFloat(settlement.RoundedBy || 0) +
      parseFloat(settlement.Tips || 0) -
      parseFloat(settlement.DiscountAmount || 0)
    ).toFixed(2);
  };

  return (
    <div className="settle-cashier-container">
      <h2>Cashier Settlement</h2>

      <div className="settle-top-row">
        <label>Terminal</label>
        <select>
          <option value="SR">SR</option>
        </select>

        <input value={dateTime} readOnly />
      </div>

      <div className="settle-main-grid">
        {/* LEFT PANEL */}
        <div className="settle-left-panel">
          <table className="settle-summary-table">
            <tbody>
              {[
                { label: "Sales Total", field: "SubTotal" },
                { label: "Total Discount", field: "DiscountAmount" },
                { label: "Service Charge", field: "ServiceCharge" },
                { label: "GST", field: "TotalTax" },
                { label: "Round Off", field: "RoundedBy" },
                { label: "Tips", field: "Tips" },
                { label: "Number Of Guests", field: "TotalPax" },
                { label: "Void", field: "VoidAmount" },
              ].map((item, i) => (
                <tr key={i}>
                  <td>{item.label}</td>
                  <td>
                    <input
                      name={item.field}
                      value={settlement[item.field]}
                      onChange={handleSettlementChange}
                    />
                  </td>
                </tr>
              ))}

              <tr className="settle-bold">
                <td>Net Sales</td>
                <td>
                  <input name="NetSales" value={netSales()} readOnly />
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Transactions</h3>

          <table className="settle-table">
            <thead>
              <tr>
                <th>Paymode</th>
                <th>Cash In</th>
                <th>Cash Out</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tran, i) => (
                <tr key={i}>
                  <td>{tran.Paymode}</td>

                  <td>
                    <input
                      value={tran.CashIn}
                      onChange={(e) =>
                        handleTransactionChange(i, "CashIn", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      value={tran.CashOut}
                      onChange={(e) =>
                        handleTransactionChange(i, "CashOut", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="settle-bottom-zero">0.00</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="settle-right-panel">
          <h3>Sales Summary</h3>

          <table className="settle-table">
            <thead>
              <tr>
                <th>Paymode</th>
                <th>Manual Amount</th>
              </tr>
            </thead>

            <tbody>
              {salesSummary.map((item, i) => (
                <tr key={i}>
                  <td>{item.Paymode}</td>
                  <td>
                    <input
                      value={item.ManualAmount}
                      onChange={(e) =>
                        handleSalesChange(i, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="settle-sales-box">
            <h3>Sales</h3>

            <table className="settle-table">
              <thead>
                <tr>
                  <th>Paymode</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {salesSummary.map((item, i) => (
                  <tr key={i}>
                    <td>{item.Paymode}</td>
                    <td>{item.ManualAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="settle-total-box">
            Total
            <input
              value={salesSummary
                .reduce((acc, cur) => acc + parseFloat(cur.ManualAmount || 0), 0)
                .toFixed(2)}
              readOnly
            />
          </div>

          {/* ✅ UPDATED CLOSE BUTTON */}
          <button className="settle-close-btn" onClick={handleClose}>
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}