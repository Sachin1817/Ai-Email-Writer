import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PenTool, 
  Sparkles, 
  Clock, 
  RefreshCcw, 
  Globe, 
  Wand2, 
  FileText, 
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Star
} from "lucide-react";
import emailService from "../services/emailService";

// Helper Circular Progress component
const CircularProgress = ({ percentage, label, color }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="3.5"
            fill="transparent"
          />
          {/* Active progress circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800">{percentage}%</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCount: 0,
    optimizedCount: 0,
    draftsCount: 0,
    favoritesCount: 0,
    recentEmails: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await emailService.getStatistics();
        if (res) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load statistics, utilizing preset mockup values:", err);
        setStats({
          totalCount: 0,
          optimizedCount: 0,
          draftsCount: 0,
          favoritesCount: 0,
          recentEmails: []
        });
      }
    };
    fetchDashboardData();
  }, []);

  const getToneBadgeStyle = (tone) => {
    switch (tone?.toUpperCase()) {
      case "PROFESSIONAL":
        return "bg-[#e0e7ff] text-[#4338ca]";
      case "EMPATHETIC":
        return "bg-[#f3e8ff] text-[#7e22ce]";
      case "INFORMATIVE":
      case "CASUAL":
        return "bg-[#ffedd5] text-[#c2410c]";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleQuickAction = (action) => {
    navigate("/generate", { state: { action } });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-3xl bg-[#f4f6fa] p-8 border border-[#e9eff6] relative overflow-hidden">
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-email-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI WRITING ASSISTANT</span>
          </div>
          
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 font-heading">
            AI Email Writer
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xl">
            Generate, rewrite, improve, translate, and manage professional emails with enterprise-grade AI.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/generate")}
              className="flex items-center gap-2 rounded-xl bg-email-brand px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover transition-colors"
            >
              <PenTool className="h-4.5 w-4.5" />
              <span>Generate Email</span>
            </button>
            <button
              onClick={() => navigate("/templates")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Clock className="h-4.5 w-4.5" />
              <span>Browse Templates</span>
            </button>
          </div>
        </div>

        {/* Right decoration widget */}
        <div className="hidden lg:flex items-center justify-center relative">
          <div className="absolute right-0 h-44 w-64 rounded-2xl bg-white border border-slate-100 shadow-premium p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-email-brand">
                <Wand2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold text-slate-600">Optimizing Tone...</span>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-3/4 rounded-full bg-email-brand animate-pulse"></div>
              </div>
              <div className="h-2 w-5/6 rounded-full bg-slate-100 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1/2 rounded-full bg-email-brand animate-pulse"></div>
              </div>
            </div>
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Emails Generated */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-email-brand">
              <FileText className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800">{stats.totalCount.toLocaleString()}</span>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Emails Generated</p>
          </div>
          {/* Simulated sparkline */}
          <div className="mt-4 h-8 w-full">
            <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible">
              <path d="M0,25 Q15,10 30,20 T60,5 T90,20" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* AI Optimized */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +8%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800">{stats.optimizedCount.toLocaleString()}</span>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">AI Optimized</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible">
              <path d="M0,20 Q25,10 50,22 T100,8" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Saved Drafts */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-extrabold text-slate-400">Stable</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800">{stats.draftsCount}</span>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Saved Drafts</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible">
              <line x1="0" y1="15" x2="100" y2="15" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        {/* Favorite Templates */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Star className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center text-[10px] font-extrabold text-rose-600">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +5
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800">{stats.favoritesCount}</span>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Favorite Templates</p>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible">
              <path d="M0,25 L20,20 L40,28 L60,10 L80,18 L100,5" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick AI Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-heading">Quick AI Actions</h3>
            <p className="text-[11px] text-slate-400">Perform complex writing tasks with a single click.</p>
          </div>
          <button 
            onClick={() => navigate("/templates")} 
            className="flex items-center gap-1 text-xs font-bold text-email-brand hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <button
            onClick={() => handleQuickAction("generate")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-email-brand transition-transform group-hover:scale-105">
              <PenTool className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Generate</span>
          </button>

          <button
            onClick={() => handleQuickAction("rewrite")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-105">
              <RefreshCcw className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Rewrite</span>
          </button>

          <button
            onClick={() => handleQuickAction("improve")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105">
              <Wand2 className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Improve</span>
          </button>

          <button
            onClick={() => handleQuickAction("translate")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform group-hover:scale-105">
              <Globe className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Translate</span>
          </button>

          <button
            onClick={() => handleQuickAction("summarize")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
              <FileText className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Summarize</span>
          </button>

          <button
            onClick={() => navigate("/templates")}
            className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:border-indigo-100 hover:bg-indigo-50/20 transition-all text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-105">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <span className="mt-3 text-xs font-semibold text-slate-700">Templates</span>
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Emails list */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-premium p-6 overflow-hidden">
          <h3 className="text-base font-bold text-slate-800 font-heading mb-4">Recent Emails</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Tone</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {stats.recentEmails.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs text-slate-400">
                      No recently generated emails. Click 'Generate masterpiece' to start!
                    </td>
                  </tr>
                ) : (
                  stats.recentEmails.map((email) => (
                    <tr key={email._id} className="group hover:bg-slate-50/40">
                      <td className="py-4 pr-4">
                        <div className="max-w-[200px] sm:max-w-xs">
                          <span className="block text-xs font-semibold text-slate-700 truncate">
                            {email.subject || "(No Subject)"}
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                            {email.recipient || "No recipient"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-[11px] text-slate-400 font-medium">
                        {new Date(email.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${getToneBadgeStyle(email.tone)}`}>
                          {email.tone}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            email.status === "success" ? "bg-emerald-500" : "bg-slate-400 animate-pulse"
                          }`}></span>
                          <span className={email.status === "success" ? "text-slate-600" : "text-slate-400 capitalize"}>
                            {email.status === "success" ? "Success" : "Draft"}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => navigate("/generate", { state: { emailId: email._id } })}
                          className="rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Writing Insights */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-premium p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 font-heading">AI Writing Insights</h3>
          </div>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <span className="text-xs font-semibold text-slate-500">Aggregate Quality</span>
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
              EXCELLENT
            </span>
          </div>

          {/* Radial Metrics */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-2 py-2 flex-1">
            <CircularProgress percentage={90} label="PROFESSIONAL" color="#4f46e5" />
            <CircularProgress percentage={95} label="GRAMMAR" color="#4f46e5" />
            <CircularProgress percentage={80} label="TONE MATCH" color="#d97706" />
            <CircularProgress percentage={88} label="READABILITY" color="#f43f5e" />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[11px] font-medium leading-relaxed text-slate-500 italic">
              "Your professional tone has improved by 14% this week. Consider reducing passive voice in outbound sales emails."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
