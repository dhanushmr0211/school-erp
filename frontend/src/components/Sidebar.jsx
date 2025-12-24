import { Home, Users, BookOpen, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", path: "/admin", icon: Home },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Faculty", path: "/admin/faculty", icon: BookOpen },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        Anikethana ERP
      </div>

      <nav className="p-4 space-y-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg ${
                isActive ? "bg-slate-700" : "hover:bg-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
