import React, { useState } from "react";
import { 
  Moon, 
  Sun, 
  Globe, 
  Cpu, 
  Signature, 
  Bell, 
  Trash2,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");
  const [model, setModel] = useState("llama3-70b-8192");
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(
    localStorage.getItem("profile_location") || "Remote / Online"
  );
  const [signature, setSignature] = useState(
    localStorage.getItem("settings_signature") || "Best regards,\n\nJames Dalton\nPrincipal Software Architect\nEmailAI Suite Inc."
  );

  const handleSaveSettings = () => {
    localStorage.setItem("settings_signature", signature);
    localStorage.setItem("profile_location", location);
    toast.success("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.");
    if (confirmation) {
      toast.error("Sandbox account deletion simulated. In production, this deletes Firebase records.");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-heading">Settings</h2>
        <p className="text-[11px] text-slate-400">Configure your personal preferences, Default templates, and LLM providers.</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
        {/* Preference Settings Grid */}
        <div className="space-y-6">
          {/* Theme selection toggle */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                {theme === "light" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Display Theme</h4>
                <p className="text-[10px] text-slate-400">Toggle light or dark modes in workspace views.</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Sun className="h-3 w-3" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  theme === "dark"
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Moon className="h-3 w-3" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Language dropdown */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <Globe className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Default Language</h4>
                <p className="text-[10px] text-slate-400">Primary translation and grammar rules setting.</p>
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:bg-white"
            >
              <option value="English">English (US)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          {/* AI Model Selection */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <Cpu className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">AI Model Provider</h4>
                <p className="text-[10px] text-slate-400">Select model size for generating drafts.</p>
              </div>
            </div>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:bg-white"
            >
              <option value="llama3-70b-8192">Llama 3 70B (High Quality)</option>
              <option value="llama3-8b-8192">Llama 3 8B (Fast Response)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Complex Context)</option>
            </select>
          </div>

          {/* Notifications toggles */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <Bell className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Email Alerts</h4>
                <p className="text-[10px] text-slate-400">Get updates on new templates and generation analytics.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-email-brand"></div>
            </label>
          </div>

          {/* Location profile setting */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Profile Location</h4>
                <p className="text-[10px] text-slate-400">Set the location displayed in your workspace profile.</p>
              </div>
            </div>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-48 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {/* Signature Editor text box */}
          <div className="space-y-2 border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <Signature className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Default Signature</h4>
                <p className="text-[10px] text-slate-400">Automatically appended to all generated emails.</p>
              </div>
            </div>

            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-medium text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 resize-none mt-2"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="rounded-xl bg-email-brand px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover transition-colors cursor-pointer"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-white px-5 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
