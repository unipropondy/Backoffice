import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import DishGroup from "./pages/DishGroup";
import Dish from "./pages/Dish";
import ComboGroupMaster from "./pages/ComboGroupMaster";
import Modifier from "./pages/Modifier";
import Inventory from "./pages/Inventory";
import Settlement from "./pages/Settlement";
import SalesReport from "./pages/SalesReport";
import DayEndReport from "./pages/DayEndReport";
import CustomerList from "./pages/CustomerList";
import UserGroup from "./pages/usergroup";
import UserMaster from "./pages/usermaster";
import Permission from "./pages/Permission";
import RewardPoints from "./pages/RewardPoints";
import Sidebar from "./components/Sidebar";
import VendorMaster from "./pages/VendorMaster";
import Paymode from "./pages/Paymode";
import PickList from "./pages/PickList";
import Terminal from "./pages/Terminal";
import Discount from "./pages/Discount";
import EmailSettings from "./pages/EmailSettings";
import FireCourseForm from "./pages/FireCourseForm";
import PriceList from "./pages/PriceList";
import PrinterModal from "./pages/PrinterModal";
import Barcode from "./pages/Barcode";
import CancelRemarkModal from "./pages/CancelRemarkModal";
import HappyHours from "./pages/HappyHours";
import POSPermission from "./pages/POSPermission";
import StockPage from "./pages/StockPage";
import StockEntryPage from "./pages/StockEntryPage";
import Member from "./pages/Member";
import StockEntryPurInv from "./pages/StockEntryPurInv";
import StockEntryPurRet from "./pages/StockEntryPurRet";
import ServerMaster from "./pages/ServerMaster";
import TableMaster from "./pages/tablemaster";
import Organization from "./pages/Organization";
import DishOrderItemShare from "./pages/DishOrderItemShare";
import QRCode from "./pages/QRCode";
import PromoCodeMaster from "./pages/PromoCodeMaster";
import SalesDashboard from "./pages/SalesDashboard";



// import { LoaderProvider } from "./context/LoaderContext";

// import GlobalLoader from "./components/GlobalLoader";

function useGlobalTableEnhancements(location) {
  useEffect(() => {
    const applySort = (tbody, colIndex, isAsc) => {
      if (!tbody) return;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      if (rows.length === 0) return;

      rows.sort((a, b) => {
        const aCol = a.children[colIndex]?.textContent?.trim() || '';
        const bCol = b.children[colIndex]?.textContent?.trim() || '';

        const aNum = parseFloat(aCol.replace(/[^0-9.-]+/g, ''));
        const bNum = parseFloat(bCol.replace(/[^0-9.-]+/g, ''));

        let cmp = 0;
        if (!isNaN(aNum) && !isNaN(bNum) && aCol.match(/^[0-9.,$\- ]+$/)) {
          cmp = aNum - bNum;
        } else {
          cmp = aCol.localeCompare(bCol, undefined, { numeric: true, sensitivity: 'base' });
        }

        return isAsc ? cmp : -cmp;
      });

      rows.forEach((row) => tbody.appendChild(row));
    };

    const enhance = () => {
      document.querySelectorAll('table').forEach((table) => {
        const headers = table.querySelectorAll('thead th');
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        headers.forEach((th, index) => {
          if (th.dataset.gSortReady === 'true') {
            const activeSortCol = table.dataset.activeSortCol;
            if (String(activeSortCol) === String(index)) {
              const icon = th.querySelector('.g-sort-icon');
              if (icon) {
                icon.innerHTML = table.dataset.activeSortDir === 'asc' ? '↑' : '↓';
                icon.classList.add('active');
                icon.style.opacity = '1';
              }
            }
            return;
          }

          const icon = document.createElement('span');
          icon.className = 'g-sort-icon';
          icon.innerHTML = '↕';
          icon.title = 'Sort column';
          icon.style.cssText = 'cursor:pointer;margin-left:5px;user-select:none;font-size:11px;opacity:0.7;display:inline-block;';

          icon.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const isAsc = th.dataset.sortDir !== 'asc';

            table.querySelectorAll('thead th').forEach((header) => {
              header.dataset.sortDir = '';
              const sortIcon = header.querySelector('.g-sort-icon');
              if (sortIcon) {
                sortIcon.innerHTML = '↕';
                sortIcon.classList.remove('active');
                sortIcon.style.opacity = '0.7';
              }
            });

            th.dataset.sortDir = isAsc ? 'asc' : 'desc';
            icon.innerHTML = isAsc ? '↑' : '↓';
            icon.classList.add('active');
            icon.style.opacity = '1';

            table.dataset.activeSortCol = index;
            table.dataset.activeSortDir = isAsc ? 'asc' : 'desc';

            applySort(table.querySelector('tbody'), index, isAsc);
          });

          th.appendChild(icon);
          th.dataset.gSortReady = 'true';
        });
      });
    };

    enhance();
  }, [location.pathname]);
}

function Layout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  
  useGlobalTableEnhancements(location);

  // ✅ Login page la sidebar hide
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage && <Sidebar open={open} setOpen={setOpen} />}

      <div className={`main-content ${isLoginPage ? 'login-layout' : ''} ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/About" element={<About />} />
          <Route path="/DishGroup" element={<DishGroup />} />
          <Route path="/Dish" element={<Dish />} />
          <Route path="/ComboGroupMaster" element={<ComboGroupMaster />} />
          <Route path="/Modifier" element={<Modifier />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Settlement" element={<Settlement />} />
          <Route path="/SalesReport" element={<SalesReport />} />
          <Route path="/DayEndReport" element={<DayEndReport />} />
          <Route path="/CustomerList" element={<CustomerList />} />
          <Route path="/usergroup" element={<UserGroup />} />
          <Route path="/usermaster" element={<UserMaster />} />
          <Route path="/Permission" element={<Permission />} />
          <Route path="/RewardPoints" element={<RewardPoints />} />
          <Route path="/Vendormaster" element={<VendorMaster />} />
          <Route path="/Member" element={<Member />} />
           <Route path="/Member/:id" element={<Member />} />
          <Route path="/Paymode" element={<Paymode />} />
          <Route path="/PickList" element={<PickList />} />
          <Route path="/Terminal" element={<Terminal />} />
          <Route path="/Discount" element={<Discount />} />
          <Route path="/EmailSettings" element={<EmailSettings />} />
          <Route path="/FireCourseForm" element={<FireCourseForm />} />
          <Route path="/PriceList" element={<PriceList />} />
          <Route path="/PrinterModal" element={<PrinterModal show={true} />} />
          <Route path="/Barcode" element={<Barcode show={true} />} />
          <Route path="/CancelRemarkModal" element={<CancelRemarkModal show={true} />} />
          <Route path="/HappyHours" element={<HappyHours show={true} />} />
          <Route path="/POSPermission" element={<POSPermission show={true} />} />
          <Route path="/StockPage" element={<StockPage show={true} />} />
              {/* 🔥 PURCHASE ORDER */}
        <Route path="/StockEntryPage" element={<StockEntryPage />} />
        <Route path="/StockEntryPage/:tranNo" element={<StockEntryPage />} />
            {/* 🔥 PURCHASE INVOICE */}
        <Route path="/StockEntryPurInv" element={<StockEntryPurInv />} />
        <Route path="/StockEntryPurInv/:tranNo" element={<StockEntryPurInv />} />

        {/* 🔥 PURCHASE RETURN */}
        <Route path="/StockEntryPurRet" element={<StockEntryPurRet />} />
        <Route path="/StockEntryPurRet/:tranNo" element={<StockEntryPurRet />} />
        <Route path="/ServiceMaster" element={<ServerMaster />} />
       <Route path="/tablemaster" element={<TableMaster />} />
       <Route path="/Organization" element={<Organization />} />
       <Route path="/QRCode" element={<QRCode />} />
       <Route path="/DishOrderItemShare" element={<DishOrderItemShare />} />
        <Route path="/PromoCodeMaster" element={<PromoCodeMaster />} />
        <Route path="/SalesDashboard" element={<SalesDashboard />} />
       </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      {/* <LoaderProvider>   {/* 🔥 ADD THIS */}
        <BrowserRouter>

          {/* <GlobalLoader />   🔥 ADD THIS */}

          <Layout />

        </BrowserRouter>
      {/* </LoaderProvider> */}
    </ThemeProvider>
  );
}



export default App;


