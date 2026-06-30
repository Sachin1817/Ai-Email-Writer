import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  PenTool, 
  History, 
  Star, 
  FileCode, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Zap
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Generate", path: "/generate", icon: PenTool },
    { name: "History", path: "/history", icon: History },
    { name: "Favorites", path: "/favorites", icon: Star },
    { name: "Templates", path: "/templates", icon: FileCode },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-100 bg-white px-4 py-6 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-email-brand text-white shadow-md shadow-indigo-200">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none m-0 font-heading">
              EmailAI
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              AI WRITING SUITE
            </span>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => toggleSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-email-brand text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>



        {/* Footer Nav */}
        <div className="border-t border-slate-100 pt-4 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => toggleSidebar(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-email-brand text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => toggleSidebar(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-email-brand text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            <User className="h-5 w-5 shrink-0" />
            <span>Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
