import React, { useState, useEffect } from "react";
import "./Terminal.css";
 
export default function Terminal() {
 
  const [currentScreen, setCurrentScreen] = useState("list");
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [terminals, setTerminals] = useState([]);
 
  useEffect(() => {
    fetch("http://localhost:5000/api/terminal")
      .then(res => res.json())
      .then(data => setTerminals(data))
      .catch(err => console.error("Error fetching terminals:", err));
  }, []);
 
  const [formData, setFormData] = useState({
    TerminalId: null,
    TerminalCode: "",
    TerminalName: "",
    LocationCode: "",
    ComputerName: "",
    TillAmount: 0,
    IdleTime: 0,
    PrinterRequired: false,
    CashDrawerInterface: false,
    isCustDisplayAttached: false,
    TerminalType: "",
    PrintType: "",
    ImagePath: "",
    isShowCompTotal: false,
    OtherLangType: false,
    isSecondDisplayAttached: false,
    isCameraAttached: false,
    isSettlementprint: false,
    isDayendPrint: false,
    NetsAuto: false,
    AutoCash: false,
    isVoiceEnabled: false,
  });
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
 
  const handleSave = () => {
    if (selectedTerminal) {
      setTerminals(prev =>
        prev.map(t =>
          t.TerminalCode === selectedTerminal.TerminalCode
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      setTerminals(prev => [...prev, { ...formData }]);
    }
 
    setCurrentScreen("list");
    setSelectedTerminal(null);
  };
 
  const handleDelete = () => {
    if (!selectedTerminal) return;
 
    setTerminals(prev =>
      prev.filter(t => t.TerminalCode !== selectedTerminal.TerminalCode)
    );
 
    setCurrentScreen("list");
    setSelectedTerminal(null);
  };
 
  const handleNew = () => {
    setSelectedTerminal(null);
    setFormData({
      ...formData,
      TerminalCode: "",
      TerminalName: ""
    });
    setCurrentScreen("form");
  };
 
  const selectTerminal = (terminal) => {
    setFormData({ ...terminal });
    setSelectedTerminal(terminal);
    setCurrentScreen("form");
  };
 
  return (
    <div className="terminal-page">
 
      {/* LIST */}
      {currentScreen === "list" && (
        <div className="terminal-container">
 
          <div className="terminal-header-bar">
            <h2 className="terminal-page-title">Terminal Settings</h2>
 
            <button
              className="terminal-new-btn"
              onClick={handleNew}
            >
              New
            </button>
          </div>
 
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Terminal Code</th>
                <th>Terminal Name</th>
                <th>Computer Name</th>
                <th>Till Amount</th>
                <th>Idle Time</th>
              </tr>
            </thead>
 
            <tbody>
              {terminals.length === 0 ? (
                <tr>
                  <td colSpan="5">No Data</td>
                </tr>
              ) : (
                terminals.map((t, i) => (
                  <tr key={i} onClick={() => selectTerminal(t)}>
                    <td>{t.TerminalCode}</td>
                    <td>{t.TerminalName}</td>
                    <td>{t.ComputerName}</td>
                    <td>{t.TillAmount}</td>
                    <td>{t.IdleTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
 
        </div>
      )}
 
      {/* FORM */}
      {currentScreen === "form" && (
        <div className="terminal-form-overlay">
 
          <div className="terminal-form-modal">
 
            <h2 className="terminal-form-title">Terminal Setup</h2>
 
            <div className="terminal-form-split">
 
              {/* LEFT */}
              <div className="terminal-input-side">
                <label>Terminal Code</label>
                <input name="TerminalCode" value={formData.TerminalCode} onChange={handleInputChange} />
 
                <label>Terminal Name</label>
                <input name="TerminalName" value={formData.TerminalName} onChange={handleInputChange} />
 
                <label>Location Code</label>
                <input name="LocationCode" value={formData.LocationCode || ""} onChange={handleInputChange} />
 
                <label>Computer Name</label>
                <input name="ComputerName" value={formData.ComputerName || ""} onChange={handleInputChange} />
 
                <label>Till Amount</label>
                <input type="number" name="TillAmount" value={formData.TillAmount} onChange={handleInputChange} />
 
                <label>Terminal Type</label>
                <input name="TerminalType" value={formData.TerminalType || ""} onChange={handleInputChange} />
 
                <label>Printer Type</label>
                <input name="PrintType" value={formData.PrintType || ""} onChange={handleInputChange} />
 
                <label>Image Path</label>
                <input name="ImagePath" value={formData.ImagePath || ""} onChange={handleInputChange} />
 
                <label>Idle Time</label>
                <input type="number" name="IdleTime" value={formData.IdleTime} onChange={handleInputChange} />
              </div>
 
              {/* RIGHT */}
              <div className="terminal-checkbox-side">
                <label><input type="checkbox" name="isShowCompTotal" checked={formData.isShowCompTotal} onChange={handleCheckboxChange}/> Show Total</label>
                <label><input type="checkbox" name="OtherLangType" checked={formData.OtherLangType} onChange={handleCheckboxChange}/> Other Language</label>
                <label><input type="checkbox" name="CashDrawerInterface" checked={formData.CashDrawerInterface} onChange={handleCheckboxChange}/> Cash Drawer</label>
                <label><input type="checkbox" name="isCustDisplayAttached" checked={formData.isCustDisplayAttached} onChange={handleCheckboxChange}/> Display</label>
                <label><input type="checkbox" name="isCameraAttached" checked={formData.isCameraAttached} onChange={handleCheckboxChange}/> Camera</label>
                <label><input type="checkbox" name="isSecondDisplayAttached" checked={formData.isSecondDisplayAttached} onChange={handleCheckboxChange}/> Second Display</label>
                <label><input type="checkbox" name="PrinterRequired" checked={formData.PrinterRequired} onChange={handleCheckboxChange}/> Printer</label>
                <label><input type="checkbox" name="isSettlementprint" checked={formData.isSettlementprint} onChange={handleCheckboxChange}/> Settlement</label>
                <label><input type="checkbox" name="isDayendPrint" checked={formData.isDayendPrint} onChange={handleCheckboxChange}/> Day End</label>
                <label><input type="checkbox" name="isVoiceEnabled" checked={formData.isVoiceEnabled} onChange={handleCheckboxChange}/> Voice</label>
                <label><input type="checkbox" name="NetsAuto" checked={formData.NetsAuto} onChange={handleCheckboxChange}/> Nets</label>
                <label><input type="checkbox" name="AutoCash" checked={formData.AutoCash} onChange={handleCheckboxChange}/> Auto Cash</label>
              </div>
 
            </div>
 
            <div className="terminal-button-box">
              <button className="terminal-save-btn" onClick={handleSave}>Save</button>
              <button className="terminal-delete-btn" onClick={handleDelete}>Delete</button>
              <button className="terminal-cancel-btn" onClick={() => setCurrentScreen("list")}>Cancel</button>
            </div>
 
          </div>
 
        </div>
      )}
 
    </div>
  );
}
 