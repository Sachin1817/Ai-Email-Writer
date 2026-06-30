import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Bell, Menu, Plus } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Trigger & Search */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar matching design */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search emails, templates, or AI actions..."
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800">
          <Bell className="h-5.5 w-5.5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Generate Shortcut Button */}
        <button
          onClick={() => navigate("/generate")}
          className="flex items-center gap-1.5 rounded-xl bg-email-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover transition-colors"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          <span>Generate</span>
        </button>

        {/* User Profile Avatar */}
        <Link to="/profile" className="flex items-center">
          <img
            src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
            alt={user?.displayName || "User Avatar"}
            className="h-9 w-9 rounded-full object-cover border-2 border-slate-100 hover:border-email-brand transition-colors cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
