import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { AcademicYearProvider } from "../context/AcademicYearContext";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AcademicYearProvider>
      <div className="dashboard-layout">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex-col w-full" style={{ overflow: "hidden", display: "flex" }}>
          <Topbar onMenuClick={() => setIsOpen(true)} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </AcademicYearProvider>
  );
}
