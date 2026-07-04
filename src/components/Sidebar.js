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
import { FaBuilding } from "react-icons/fa"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../config/api";
// import TimeEntry from "./TimeEntry";

function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
   const [ShowTransaction, setShowTransaction] = useState(false);
   const [ShowPromotions, setShowPromotions] = useState(false);
   const [ShowSecurity, setShowSecurity] = useState(false);
   const [ShowReport, setShowReport] = useState(false);
   const [ShowMaster, setShowMaster] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
 const user = JSON.parse(localStorage.getItem("user"));
const username = user?.FirstName;

   const [showChangePwd, setShowChangePwd] = useState(false);
   const [targetPassword, setTargetPassword] = useState("");
const [showTargetModal, setShowTargetModal] = useState(false);
  //  const [showTimeEntry, setShowTimeEntry] = useState(false);

  const handleLogout = () => {
    navigate("/"); // ✅ back to login page
  };

//   const handleTargetAccess = () => {
//   if (targetPassword === "1234") {
//     setShowTargetModal(false);
//     setTargetPassword("");
//     navigate("/DishOrderItemShare");
//   } else {
//     alert("Invalid Password");
//   }
// };
const handleTargetAccess = async () => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/check-target-password`,
      {
        password: targetPassword
      }
    );

    if (res.data.success) {
      setShowTargetModal(false);
      setTargetPassword("");
      navigate("/DishOrderItemShare");
    } else {
      alert("Invalid Password");
    }
  } catch (err) {
    console.log(err);
    alert("Server Error");
  }
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

     <div className="sid-topbar-center">
  <span>Welcome, {username || "User"} 👋</span>
</div>

      <div className="sid-topbar-right">

          {/* 👇 NEW TIME ENTRY ICON */}
         {/* <button 
          className="sid-icon-btn"
          onClick={() => setShowTimeEntry(true)}
        >
          <FaClock />
        </button> */}
          
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
       <Link className="sid-menu" to="/Home">
          <FaHome className="sid-icon" /> Home
        </Link>


        <div className="sid-menu" onClick={() => setShowMaster(!ShowMaster)}>
         <FaDatabase className="sid-icon" /> Master
      </div>

     {ShowMaster && (
  <div className="sid-submenu-container">
    <Link className="sid-menu" to="/Contact">
      <FaUtensils className="sid-icon" /> Kitchen
    </Link>

    <Link className="sid-menu" to="/About">
      <FaList className="sid-icon" /> Category
    </Link>

    <Link className="sid-menu" to="/DishGroup">
      <FaLayerGroup className="sid-icon" /> Dish Group
    </Link>

    <Link className="sid-menu" to="/Dish">
      <FaHamburger className="sid-icon" /> Dish
    </Link>
     <Link className="sid-menu" to="/ComboGroupMaster">
      <FaHamburger className="sid-icon" /> ComboGroupMaster
    </Link>
  </div>
)}


<Link className="sid-menu" to="/Modifier">
  <FaSlidersH className="sid-icon" /> Modifier
</Link>

<Link className="sid-menu" to="/CustomerList ">
  <FaUsers className="sid-icon" /> Customer
</Link>

     <div className="sid-menu" onClick={() => setShowReport(!ShowReport)}>
         <FaFileAlt className="sid-icon" /> Report
      </div>

    {ShowReport && (
    <div className="sid-submenu-container">
      <Link className="sid-menu" to="/Settlement">
            <FaMoneyBill className="sid-icon" /> Settlement
          </Link>

       
          <Link className="sid-menu" to="/SalesReport">
            <FaChartBar className="sid-icon" /> Sales Report
          </Link>

          
          <Link className="sid-menu" to="/DayEndReport">
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
        
        <Link className="sid-menu" to="/Inventory">
              <FaBox className="sid-icon" /> Inventory
       </Link>
       {/* <Link className="sid-menu" to="/StockPage" onClick={() => setOpen(false)}> */}
        <Link className="sid-menu" to="/StockPage">
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
           <Link className="sid-menu" to="/ServiceMaster">
            <FaBarcode  className="sid-icon" /> Server Master
          </Link>
        </div>
        )}
  

        <div className="sid-menu" onClick={() => setShowSetup(!showSetup)}>
              <FaWrench className="sid-icon" /> Setup
        </div>

        {showSetup && (
        <div className="sid-submenu-container">
          <Link className="sid-menu" to="/QRCode">
            <FaBuilding  className="sid-icon" /> QRCode
          </Link>
          <Link className="sid-menu" to="/Organization">
            <FaBuilding  className="sid-icon" /> Organization
          </Link>
           <Link className="sid-menu" to="/TableMaster">
            <FaBarcode  className="sid-icon" /> Table Master
          </Link>
          {/* <Link className="sid-menu" to="/DishOrderItemShare">
            <BsTerminal  className="sid-icon" /> Target
          </Link> */}
          <div
              className="sid-menu"
              onClick={() => setShowTargetModal(true)}
            >
              <BsTerminal className="sid-icon" /> Target
            </div>
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

  {/* {showTimeEntry && (
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

         
          maxHeight: "90vh",     
          overflowY: "auto",     

          position: "relative"
        }}
      >
        
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

       
        <TimeEntry />
      </div>
    </div>
  )} */}
  {showTargetModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "300px"
      }}
    >
      <h3>Enter Password</h3>

     <div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    value={targetPassword}
    onChange={(e) => setTargetPassword(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleTargetAccess();
      }
    }}
    placeholder="Password"
    style={{
      width: "100%",
      padding: "8px 40px 8px 8px",
      marginBottom: "10px"
    }}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "12px",
      top: "35%",
      transform: "translateY(-50%)",
      cursor: "pointer"
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

      <button onClick={handleTargetAccess}>
        Submit
      </button>

      <button
        onClick={() => setShowTargetModal(false)}
        style={{ marginLeft: "10px" }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </>
  );
}

export default Sidebar;
