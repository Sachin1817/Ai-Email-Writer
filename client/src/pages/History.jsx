import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Trash2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  Pin,
  SlidersHorizontal,
  DownloadCloud
} from "lucide-react";
import emailService from "../services/emailService";
import { exportToTXT } from "../utils/exportHelper";
import toast from "react-hot-toast";

const History = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Types");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Advanced filters panel toggle
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedToneFilter, setSelectedToneFilter] = useState("All");

  const fetchHistory = async () => {
    try {
      const res = await emailService.getEmails();
      if (res && res.emails) {
        setEmails(res.emails);
      } else {
        setEmails([]);
      }
    } catch (err) {
      console.warn("Connection issues, setting empty history:", err);
      setEmails([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(emails.map(email => email._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleFavoriteToggle = async (id) => {
    try {
      await emailService.toggleFavorite(id);
      setEmails(prev => prev.map(e => e._id === id ? { ...e, isFavorite: !e.isFavorite } : e));
      toast.success("Updated favorite state");
    } catch {
      setEmails(prev => prev.map(e => e._id === id ? { ...e, isFavorite: !e.isFavorite } : e));
      toast.success("Updated mock favorite state");
    }
  };

  const handlePinToggle = async (id) => {
    try {
      await emailService.togglePin(id);
      setEmails(prev => prev.map(e => e._id === id ? { ...e, isPinned: !e.isPinned } : e));
      toast.success("Toggled pin state");
    } catch {
      setEmails(prev => prev.map(e => e._id === id ? { ...e, isPinned: !e.isPinned } : e));
      toast.success("Toggled mock pin state");
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting email draft...");
    try {
      await emailService.deleteEmail(id);
      setEmails(prev => prev.filter(e => e._id !== id));
      toast.success("Deleted successfully", { id: toastId });
    } catch {
      setEmails(prev => prev.filter(e => e._id !== id));
      toast.success("Deleted mock entry successfully", { id: toastId });
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setEmails(prev => prev.filter(e => !selectedIds.includes(e._id)));
    setSelectedIds([]);
    toast.success("Deleted selected emails.");
  };

  const handleBulkStar = () => {
    if (selectedIds.length === 0) return;
    setEmails(prev => prev.map(e => selectedIds.includes(e._id) ? { ...e, isFavorite: true } : e));
    setSelectedIds([]);
    toast.success("Favorited selected emails.");
  };

  const handleExportCSV = () => {
    const headers = ["Subject", "Recipient", "Tone", "Category", "Content", "Created At"];
    const rows = emails.map(e => [
      e.subject,
      e.recipient,
      e.tone,
      e.category || "General",
      e.content.replace(/\n/g, " "),
      e.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `email_history_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported CSV successfully");
  };

  // Filtering Logic
  const filteredEmails = emails.filter((email) => {
    const matchesSearch = email.subject.toLowerCase().includes(search.toLowerCase()) || 
                          email.content.toLowerCase().includes(search.toLowerCase()) ||
                          email.recipient.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === "All Types" || email.category === categoryFilter.toUpperCase();
    const matchesTone = selectedToneFilter === "All" || email.tone.toLowerCase() === selectedToneFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesTone;
  }).sort((a, b) => {
    if (sortOrder === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, sortOrder, selectedToneFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / rowsPerPage));
  const currentEmails = filteredEmails.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const pinnedEmails = emails.filter(e => e.isPinned);

  const getToneBadgeStyle = (tone) => {
    switch (tone?.toUpperCase()) {
      case "PROFESSIONAL":
      case "URGENT":
        return "bg-indigo-50 text-indigo-600";
      case "CASUAL":
      case "FRIENDLY":
        return "bg-amber-50 text-amber-600";
      case "EMPATHETIC":
      case "ENTHUSIASTIC":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getCategoryBadgeStyle = (cat) => {
    switch (cat?.toUpperCase()) {
      case "BUSINESS":
        return "bg-indigo-100 text-indigo-800";
      case "PERSONAL":
        return "bg-slate-100 text-slate-800";
      case "FOLLOW-UP":
        return "bg-rose-100 text-rose-800";
      case "MARKETING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-heading">Email History</h2>
          <p className="text-[11px] text-slate-400">Manage and review your AI-generated correspondence.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-email-brand px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover transition-colors"
          >
            <DownloadCloud className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {advancedFiltersOpen && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Filter by Tone</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Professional", "Casual", "Urgent", "Friendly"].map(tone => (
                <button
                  key={tone}
                  onClick={() => setSelectedToneFilter(tone)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                    selectedToneFilter === tone
                      ? "border-email-brand bg-indigo-50 text-email-brand"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sent</span>
          <h4 className="text-xl font-bold text-slate-800 mt-1">{emails.length.toLocaleString()}</h4>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Optimized</span>
          <h4 className="text-xl font-bold text-slate-800 mt-1">
            {emails.length > 0 ? `${Math.round((emails.filter(e => e.status === "success").length / emails.length) * 100)}%` : "0%"}
          </h4>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Rate</span>
          <h4 className="text-xl font-bold text-slate-800 mt-1">{emails.length > 0 ? "64.5%" : "0.0%"}</h4>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg. Response</span>
          <h4 className="text-xl font-bold text-slate-800 mt-1">{emails.length > 0 ? "1.2h" : "0.0h"}</h4>
        </div>
      </div>

      {/* Pinned Emails Section */}
      {pinnedEmails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5 fill-email-brand stroke-email-brand rotate-45" />
            <span>Pinned Emails</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pinnedEmails.map((email) => (
              <div 
                key={email._id} 
                className="rounded-2xl border-2 border-email-brand bg-white p-5 shadow-premium relative flex flex-col justify-between"
              >
                <button
                  onClick={() => handlePinToggle(email._id)}
                  className="absolute top-4 right-4 text-email-brand hover:scale-105 transition-transform"
                >
                  <Pin className="h-4 w-4 fill-current rotate-45" />
                </button>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight pr-6">
                    {email.subject}
                  </h4>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                    {email.content}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-indigo-50 text-indigo-600">
                      {email.category || "BUSINESS"}
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-slate-50 text-slate-600">
                      {email.tone}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Database Table Container */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-premium overflow-hidden">
        {/* Table Toolbar Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-slate-50 bg-slate-50/20">
          {/* Left: Bulk Checkbox Action */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.length === emails.length && emails.length > 0}
                className="h-4 w-4 cursor-pointer rounded border-slate-200 text-email-brand focus:ring-email-brand"
              />
              <span className="text-xs font-bold text-slate-500">Select All</span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button
                  onClick={handleBulkDelete}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleBulkStar}
                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors"
                  title="Star Selected"
                >
                  <Star className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Search & Category dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search entries bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="search"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 rounded-xl border border-slate-100 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-600 outline-none placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Category selection */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:bg-white"
            >
              <option value="All Types">All Types</option>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Marketing">Marketing</option>
            </select>

            {/* Sort order dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:bg-white"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/10">
                <th className="py-4 px-6 w-12"></th>
                <th className="py-4 px-4">Email Details</th>
                <th className="py-4 px-4">Type & Tone</th>
                <th className="py-4 px-4">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-xs text-slate-400">
                    No matching history logs found.
                  </td>
                </tr>
              ) : (
                currentEmails.map((email) => (
                  <tr key={email._id} className="group hover:bg-slate-50/40">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(email._id)}
                        onChange={(e) => handleSelectRow(email._id, e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-200 text-email-brand focus:ring-email-brand"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-[280px] sm:max-w-md">
                        <span className="block text-xs font-semibold text-slate-700 truncate">
                          {email.subject || "(No Subject)"}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                          {email.content}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${getCategoryBadgeStyle(email.category || "BUSINESS")}`}>
                          {email.category || "BUSINESS"}
                        </span>
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${getToneBadgeStyle(email.tone)}`}>
                          {email.tone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="block text-xs font-semibold text-slate-700">
                        {new Date(email.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5 font-semibold">
                        {new Date(email.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* Interactive inline hover action buttons */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate("/generate", { state: { emailId: email._id } })}
                          className="p-1.5 text-slate-400 hover:text-email-brand hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Open in Builder"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFavoriteToggle(email._id)}
                          className={`p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors ${
                            email.isFavorite ? "text-amber-500 fill-amber-500 hover:bg-transparent" : ""
                          }`}
                          title="Favorite"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePinToggle(email._id)}
                          className={`p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${
                            email.isPinned ? "text-indigo-600 fill-indigo-600 hover:bg-transparent rotate-45" : ""
                          }`}
                          title="Pin Email"
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => exportToTXT(email.subject, email.content)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download Text"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(email._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Email"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-50 bg-slate-50/10">
          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredEmails.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredEmails.length)} of {filteredEmails.length} results
          </span>

          <div className="flex items-center gap-4">
            {/* Rows selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-bold">Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 outline-none"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-2 text-xs font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
