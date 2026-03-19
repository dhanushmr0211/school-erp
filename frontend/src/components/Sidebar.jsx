import { useEffect } from "react";
import {
  Home, Users, BookOpen, Layers,
  GraduationCap, FileText, DollarSign, Calendar, Menu, X, MessageSquare
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
      { name: "Dashboard", path: "/admin", icon: Home },
      { name: "Academic Years", path: "/admin/academic-years", icon: Calendar },
      { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
      { name: "Faculty", path: "/admin/faculty", icon: Users },
      { name: "Classes", path: "/admin/classes", icon: Layers },
      { name: "Promote Class", path: "/admin/promote-class", icon: Layers },
      { name: "Students & Fees", path: "/admin/students", icon: GraduationCap },
      { name: "Reports", path: "/admin/reports", icon: FileText },
      { name: "Queries", path: "/admin/queries", icon: MessageSquare },
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
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 44, height: 44 }} />
            <span>Anikethana</span>
          </div>
          {isOpen && (
            <button
              className="md:hidden"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '0.4rem',
                background: 'var(--royal-light)',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--royal-blue)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          )}
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

        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--border-soft)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center" }}>
            {role} Portal
          </p>
        </div>
      </aside>
    </>
  );
}
