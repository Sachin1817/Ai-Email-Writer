import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, Download } from "lucide-react";
import emailService from "../services/emailService";
import { exportToTXT } from "../utils/exportHelper";
import toast from "react-hot-toast";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const res = await emailService.getEmails();
      const favList = res.emails ? res.emails.filter(e => e.isFavorite) : [];
      setFavorites(favList);
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (id) => {
    try {
      await emailService.toggleFavorite(id);
      setFavorites(prev => prev.filter(e => e._id !== id));
      toast.success("Removed from favorites");
    } catch {
      setFavorites(prev => prev.filter(e => e._id !== id));
      toast.success("Removed mock from favorites");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-heading">Favorite Emails</h2>
        <p className="text-[11px] text-slate-400">Keep track of your best AI-generated templates and copy.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-premium overflow-hidden">
        {favorites.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Star className="h-10 w-10 text-slate-200 stroke-[1.5px]" />
            <h4 className="text-xs font-bold text-slate-500">No Favorites Yet</h4>
            <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">
              Star emails in the Builder or History view to keep them in this quick access list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/10">
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-4">Recipient</th>
                  <th className="py-4 px-4">Tone</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {favorites.map((email) => (
                  <tr key={email._id} className="group hover:bg-slate-50/40">
                    <td className="py-4 px-6">
                      <div className="max-w-[280px] sm:max-w-md">
                        <span className="block text-xs font-semibold text-slate-700 truncate">
                          {email.subject || "(No Subject)"}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                          {email.content}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {email.recipient || "No recipient"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-indigo-50 text-indigo-600">
                        {email.tone}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate("/generate", { state: { emailId: email._id } })}
                          className="p-1.5 text-slate-400 hover:text-email-brand hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Open in Builder"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnfavorite(email._id)}
                          className="p-1.5 text-amber-500 hover:text-slate-400 rounded-lg transition-colors"
                          title="Unfavorite"
                        >
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </button>
                        <button
                          onClick={() => exportToTXT(email.subject, email.content)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download TXT"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
