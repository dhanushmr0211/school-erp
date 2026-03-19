import { useEffect } from "react";
import {
  Home, Users, BookOpen, Layers,
  GraduationCap, FileText, DollarSign, Calendar, Menu, X, MessageSquare,
  TrendingUp, LayoutDashboard, HelpCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || user?.app_metadata?.role || "STUDENT";
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const menus = {
    ADMIN: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Academic Years", path: "/admin/academic-years", icon: Calendar },
      { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
      { name: "Faculty", path: "/admin/faculty", icon: Users },
      { name: "Classes", path: "/admin/classes", icon: Layers },
      { name: "Promote Class", path: "/admin/promote-class", icon: TrendingUp },
      { name: "Students & Fees", path: "/admin/students", icon: GraduationCap },
      { name: "Reports", path: "/admin/reports", icon: FileText },
      { name: "Queries", path: "/admin/queries", icon: HelpCircle },
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
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Inner container with solid white background and flex structure */}
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="flex items-center gap-sm">
              <img src="/logo.png" alt="Logo" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <div className="flex flex-col">
                <span className="brand-name">Anikethana</span>
                <span className="brand-subtitle">School ERP</span>
              </div>
            </div>
            {isOpen && (
              <button className="md:hidden close-sidebar" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="sidebar-nav">
            {currentLinks.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={20} className="nav-icon" />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>

          <footer className="sidebar-footer">
            <div className="portal-badge">
              <span className="dot"></span>
              {role} Portal
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
}
