
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { AcademicYearProvider } from "../context/AcademicYearContext";

export default function DashboardLayout() {
  return (
    <AcademicYearProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="flex-col w-full" style={{ overflow: "hidden", display: "flex" }}>
          <Topbar />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </AcademicYearProvider>
  );
}
