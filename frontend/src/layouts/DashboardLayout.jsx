import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";
import { AcademicYearProvider } from "../context/AcademicYearContext";

export default function DashboardLayout() {
  return (
    <AcademicYearProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Topbar />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AcademicYearProvider>
  );
}
