import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Mail, 
  Calendar, 
  MapPin, 
  ShieldAlert,
  Zap,
  Sparkles,
  Trophy
} from "lucide-react";
import emailService from "../services/emailService";

const Profile = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);

  const userLocation = localStorage.getItem("profile_location") || "Remote / Online";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await emailService.getEmails();
        if (res && res.emails) {
          setEmails(res.emails);
        }
      } catch (err) {
        console.error("Failed to load profile emails:", err);
      }
    };
    fetchProfileData();
  }, []);

  // Compute live achievements based on actual db counts
  const distinctTones = new Set(emails.map(e => e.tone?.toUpperCase()).filter(Boolean)).size;
  const hoursSaved = (emails.length * 0.15).toFixed(1);

  const achievements = [
    { 
      title: "Inbox Champion", 
      desc: emails.length >= 100 
        ? "Completed! Generated 100+ professional replies" 
        : `Progress: Generated ${emails.length} of 100 professional replies`, 
      icon: Trophy, 
      color: emails.length >= 10 
        ? "bg-amber-50 text-amber-600 border-amber-100" 
        : "bg-slate-50 text-slate-400 border-slate-100 opacity-60" 
    },
    { 
      title: "Tone Master", 
      desc: distinctTones >= 5 
        ? "Completed! Used over 5 distinct writing tones" 
        : `Progress: Used ${distinctTones} of 5 distinct writing tones`, 
      icon: Sparkles, 
      color: distinctTones >= 3 
        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
        : "bg-slate-50 text-slate-400 border-slate-100 opacity-60" 
    },
    { 
      title: "Super Scaler", 
      desc: `Saved ${hoursSaved} hours of outreach writing time`, 
      icon: Zap, 
      color: emails.length > 0 
        ? "bg-purple-50 text-purple-600 border-purple-100" 
        : "bg-slate-50 text-slate-400 border-slate-100 opacity-60" 
    }
  ];

  // Map latest emails to activity feed
  const getActivities = () => {
    if (emails.length === 0) {
      return [
        { action: "Account initialized. Ready to generate first email!", time: "Welcome to EmailAI" }
      ];
    }

    return emails.slice(0, 4).map(email => {
      const isFav = email.isFavorite;
      const actionVerb = isFav ? "Favorited" : "Generated";
      
      // Calculate a human friendly elapsed time string
      const createdDate = new Date(email.createdAt);
      const diffMs = new Date() - createdDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = "Just now";
      if (diffDays > 0) {
        timeStr = diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        timeStr = `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        timeStr = `${diffMins} minutes ago`;
      }

      return {
        action: `${actionVerb} '${email.subject || "Untitled Draft"}'`,
        time: timeStr
      };
    });
  };

  const activities = getActivities();

  return (
    <div className="space-y-8">
      {/* Header Profile Info Banner */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-premium flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-44 w-44 rounded-full bg-indigo-50/40 blur-2xl" />

        <img
          src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
          alt={user?.displayName || "Profile avatar"}
          className="h-24 w-24 rounded-full object-cover border-4 border-slate-50 shadow-md relative z-10 shrink-0"
        />

        <div className="text-center md:text-left space-y-2 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 font-heading">
              {user?.displayName || "James Dalton"}
            </h2>
            <span className="self-center rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase text-email-brand">
              Pro Account
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{user?.email || "james.dalton@example.com"}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{userLocation}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Joined June 2026</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Section */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium space-y-5">
          <h3 className="text-base font-bold text-slate-800 font-heading">Achievements</h3>

          <div className="space-y-4">
            {achievements.map((ach) => (
              <div key={ach.title} className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${ach.color}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                  <ach.icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">{ach.title}</h4>
                  <p className="mt-1.5 text-[11px] font-medium text-slate-500 leading-relaxed">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity section */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-heading mb-4">Recent Activity</h3>

            <div className="space-y-6">
              {activities.map((act, index) => (
                <div key={index} className="flex gap-3 relative">
                  {/* Vertical line connector */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-100 -mb-6" />
                  )}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-email-brand relative z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-email-brand" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-normal">{act.action}</p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2.5 text-[10px] text-slate-400 font-bold">
            <ShieldAlert className="h-4 w-4 text-slate-300" />
            <span>Activity logged for audit security.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
