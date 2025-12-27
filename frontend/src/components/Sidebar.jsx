
import {
  Home, Users, BookOpen, Layers,
  GraduationCap, FileText, DollarSign, Calendar
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || user?.app_metadata?.role || "STUDENT";

  const menus = {
    ADMIN: [
      { name: "Dashboard", path: "/admin", icon: Home },
      { name: "Academic Years", path: "/admin/academic-years", icon: Calendar },
      { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
      { name: "Faculty", path: "/admin/faculty", icon: Users },
      { name: "Classes", path: "/admin/classes", icon: Layers },
      { name: "Students & Fees", path: "/admin/students", icon: GraduationCap },
      { name: "Reports", path: "/admin/reports", icon: FileText },
    ],
    FACULTY: [
      { name: "Dashboard", path: "/faculty/dashboard", icon: Home },
      { name: "Marks Entry", path: "/faculty/marks", icon: FileText },
    ],
    STUDENT: [
      { name: "Dashboard", path: "/student/dashboard", icon: Home },
      { name: "My Fees", path: "/student/fees", icon: DollarSign },
    ]
  };

  const currentLinks = menus[role] || menus.STUDENT;

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <Layers size={28} />
        <span>School ERP</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {currentLinks.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} style={{ marginRight: "12px" }} />
            {name}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center" }}>
          Role: {role}
        </p>
      </div>
    </aside>
  );
}
