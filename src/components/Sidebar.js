import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";   
import "./Sidebar.css";
import { 
  FaBars, FaTimes, FaSignOutAlt,
  FaHome, FaUtensils, FaList, FaLayerGroup,
  FaHamburger, FaSlidersH, FaBox,
  FaMoneyBill, FaChartBar, FaUsers, FaCogs,
  FaDatabase, FaFileAlt, FaExchangeAlt, FaTag, FaLock, FaWrench,
  FaUserShield, FaShieldAlt, FaGlassMartiniAlt, FaFire, FaDollarSign, FaPrint, FaBarcode, FaBan, FaPercent
} from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { BsTerminal } from "react-icons/bs";
import { MdListAlt, MdEmail } from "react-icons/md";
import ChangePassword from "./ChangePassword";
import { FaKey } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import TimeEntry from "./TimeEntry";



function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
   const [ShowTransaction, setShowTransaction] = useState(false);
   const [ShowPromotions, setShowPromotions] = useState(false);
   const [ShowSecurity, setShowSecurity] = useState(false);
   const [ShowReport, setShowReport] = useState(false);
   const [ShowMaster, setShowMaster] = useState(false);

   const [showChangePwd, setShowChangePwd] = useState(false);
   const [showTimeEntry, setShowTimeEntry] = useState(false);

  const handleLogout = () => {
    navigate("/"); // ✅ back to login page
  };

  return (
    <>
      <div className="sid-topbar">
        {/* LEFT: open/close icon */}
        <button className="sid-icon-btn" onClick={() => setOpen(!open)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
       <div className="sid-company-name">
        Unipro Softwares SG Pte Ltd
      </div>

      <div className="sid-topbar-right">

          {/* 👇 NEW TIME ENTRY ICON */}
         <button 
          className="sid-icon-btn"
          onClick={() => setShowTimeEntry(true)}
        >
          <FaClock />
        </button>
          
       <button 
          className="sid-icon-btn"
          onClick={() => {
            // alert("clicked");  
            setShowChangePwd(true);
          }}
        >
          <FaKey />
        </button>

        {/* Logout */}
        <button className="sid-logout-icon-btn" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </div>
      </div>

      <div className={`sid-sidebar ${open ? "open" : "close"}`}>
       <Link className="sid-menu" to="/Home" onClick={() => setOpen(false)}>
          <FaHome className="sid-icon" /> Home
        </Link>


        <div className="sid-menu" onClick={() => setShowMaster(!ShowMaster)}>
         <FaDatabase className="sid-icon" /> Master
      </div>

      {ShowMaster && (
      <div className="sid-submenu-container">
        <Link className="sid-menu" to="/Contact" onClick={() => setOpen(false)}>
              <FaUtensils className="sid-icon" /> Kitchen
            </Link>

            <Link className="sid-menu" to="/About" onClick={() => setOpen(false)}>
              <FaList className="sid-icon" /> Category
            </Link>

            <Link className="sid-menu" to="/DishGroup" onClick={() => setOpen(false)}>
              <FaLayerGroup className="sid-icon" /> Dish Group
            </Link>

            <Link className="sid-menu" to="/Dish" onClick={() => setOpen(false)}>
              <FaHamburger className="sid-icon" /> Dish
            </Link>
      </div>
      )}

       

    <Link className="sid-menu" to="/Modifier" onClick={() => setOpen(false)}>
      <FaSlidersH className="sid-icon" /> Modifier
    </Link>

      <Link className="sid-menu" to="/Member" onClick={() => setOpen(false)}>
      <FaUsers className="sid-icon" /> Member
    </Link>

     <div className="sid-menu" onClick={() => setShowReport(!ShowReport)}>
         <FaFileAlt className="sid-icon" /> Report
      </div>

    {ShowReport && (
    <div className="sid-submenu-container">
      <Link className="sid-menu" to="/Settlement" onClick={() => setOpen(false)}>
            <FaMoneyBill className="sid-icon" /> Settlement
          </Link>

          <Link className="sid-menu" to="/SalesReport" onClick={() => setOpen(false)}>
            <FaChartBar className="sid-icon" /> Sales Report
          </Link>

          <Link className="sid-menu" to="/SltReport" onClick={() => setOpen(false)}>
            <FaChartBar className="sid-icon" /> Slt.. Report
          </Link>
    </div>
    )}

   <div className="sid-menu" onClick={() => setShowTransaction(!ShowTransaction)}>
         <FaExchangeAlt className="sid-icon" /> Transaction
      </div>

      {ShowTransaction && (
      <div className="sid-submenu-container">
        <Link className="sid-menu" to="/VendorMaster">
          <FaBox className="sid-icon" /> VendorMaster
        </Link>
        <Link className="sid-menu" to="/Inventory" onClick={() => setOpen(false)}>
              <FaBox className="sid-icon" /> Inventory
       </Link>
       <Link className="sid-menu" to="/StockPage" onClick={() => setOpen(false)}>
              <FaBox className="sid-icon" /> Stock Transaction
       </Link>
       
      </div>
      )}

     <div className="sid-menu" onClick={() => setShowPromotions(!ShowPromotions)}>
         <FaTag className="sid-icon" /> Promotions
      </div>

   {ShowPromotions && (
   <div className="sid-submenu-container">
     <Link className="sid-menu" to="/HappyHours">
        <FaGlassMartiniAlt  className="sid-icon" /> HappyHours
      </Link>
     <Link className="sid-menu" to="/Discount">
      <FaPercent  className="sid-icon" /> Discount
    </Link>
    <Link className="sid-menu" to="/RewardPoints">
      <FaChartBar className="sid-icon" /> Rewardpoints
    </Link>
   </div>
  )}


    <div className="sid-menu" onClick={() => setShowSecurity(!ShowSecurity)}>
         <FaLock className="sid-icon" /> Security
      </div>

        {ShowSecurity && (
        <div className="sid-submenu-container">
          <Link className="sid-menu" to="/usergroup">
            <FaUsers className="sid-icon" /> User Group
          </Link>
          <Link className="sid-menu" to="/usermaster">
            <FaUsers className="sid-icon" /> User Master
          </Link>
          <Link className="sid-menu" to="/Permission">
            <FaUserShield className="sid-icon" /> Permission
          </Link>
          <Link className="sid-menu" to="/POSPermission">
            <FaShieldAlt className="sid-icon" /> POSPermission
          </Link>
        </div>
        )}
  

        <div className="sid-menu" onClick={() => setShowSetup(!showSetup)}>
              <FaWrench className="sid-icon" /> Setup
        </div>

        {showSetup && (
        <div className="sid-submenu-container">
           <Link className="sid-menu" to="/Terminal">
            <BsTerminal  className="sid-icon" /> Terminal
          </Link>
          <Link className="sid-menu" to="/Paymode">
           <FaMoneyBillWave className="sid-icon" /> Paymode
          </Link>
            <Link className="sid-menu" to="/PickList">
            <MdListAlt  className="sid-icon" /> PickList
          </Link>
           <Link className="sid-menu" to="/EmailSettings">
            <MdEmail  className="sid-icon" /> EmailSettings
          </Link>
          <Link className="sid-menu" to="/FireCourseForm">
            <FaFire  className="sid-icon" /> FireCourseForm
          </Link>
          <Link className="sid-menu" to="/PriceList">
            <FaDollarSign  className="sid-icon" /> PriceList
          </Link>
          <Link className="sid-menu" to="/PrinterModal">
            <FaPrint  className="sid-icon" /> PrinterModal
          </Link>
          <Link className="sid-menu" to="/Barcode">
            <FaBarcode  className="sid-icon" /> Barcode
          </Link>
          <Link className="sid-menu" to="/CancelRemarkModal">
            <FaBan  className="sid-icon" /> CancelRemarkModal
          </Link>
          
        </div>
        )}
  
  </div>
  {showChangePwd && (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999   // 🔥 very important
    }}>
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "400px",
        position: "relative"
      }}>
        <button
          onClick={() => setShowChangePwd(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "red",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            cursor: "pointer"
          }}
        >
          X
        </button>

        <ChangePassword />
      </div>
    </div>
  )}

  {showTimeEntry && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "10px",
          width: "480px",

          /* 🔥 IMPORTANT FIX */
          maxHeight: "90vh",     // limit height
          overflowY: "auto",     // scroll if needed

          position: "relative"
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setShowTimeEntry(false)}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "red",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            cursor: "pointer"
          }}
        >
          X
        </button>

        {/* CONTENT */}
        <TimeEntry />
      </div>
    </div>
  )}
    </>
  );
}

export default Sidebar;
