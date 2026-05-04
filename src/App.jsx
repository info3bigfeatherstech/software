import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideBarDashboard from "./Components/SideBarDashboard/SideBarDashboard";
// import { seedDatabase, isDatabaseEmpty } from './Components/db/seedData';
// import { getDatabaseSize } from './Components/db/indexedDB';
import './index.css'

// Optional: If you have login/auth
// import Login from "./SideBarDashboard/Login";
// import ProtectedRoute from "./SideBarDashboard/ProtectedRoute";

function App() {
  // useEffect(() => {
  //   // Initialize IndexedDB on app start
  //   const initDB = async () => {
  //     const isEmpty = await isDatabaseEmpty();
  //     if (isEmpty) {
  //       console.log('🆕 First time - seeding database...');
  //       await seedDatabase();
  //     }
      
  //     // Log database size
  //     const size = await getDatabaseSize();
  //     if (size) {
  //       console.log(`💾 IndexedDB Usage: ${size.usageMB} MB / ${size.quotaMB} MB`);
  //     }
  //   };
    
  //   initDB();
  // }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard - handles all internal routing via URL params */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/*" element={<SideBarDashboard />} />
        {/* Optional: Login route (if you add auth later) */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;