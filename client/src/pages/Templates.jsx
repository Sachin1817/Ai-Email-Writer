import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Flame, 
  Compass, 
  ChevronLeft, 
  ChevronRight,
  Briefcase,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const TEMPLATES = [
  {
    id: "temp-1",
    title: "Executive Job Application",
    description: "A sophisticated approach designed to highlight leadership skills and industry impact.",
    category: "Professional",
    difficulty: "Medium",
    popularity: "High",
    successRate: "92%",
    gradient: "from-indigo-500/10 via-purple-500/5 to-white",
    icon: Briefcase,
    recipient: "Hiring Executive",
    message: "Write a high-caliber job application letter for a senior director position, focusing on business growth, operational leadership, and team building."
  },
  {
    id: "temp-2",
    title: "Cold Outreach V2",
    description: "Maximum impact with minimal friction. Built for B2B client acquisition campaigns.",
    category: "Sales",
    difficulty: "Easy",
    popularity: "Elite",
    successRate: "88%",
    gradient: "from-blue-500/10 via-indigo-500/5 to-white",
    icon: Flame,
    recipient: "Prospective Customer / Lead",
    message: "Draft an engaging B2B cold outreach email proposing our SaaS solution which cuts infrastructure costs by 30%. End with a soft call-to-action."
  },
  {
    id: "temp-3",
    title: "Partnership Proposal",
    description: "Establish mutual value and long-term alignment with potential strategic partners.",
    category: "Professional",
    difficulty: "Hard",
    popularity: "Med",
    successRate: "95%",
    gradient: "from-purple-500/10 via-indigo-500/5 to-white",
    icon: Award,
    recipient: "Head of Strategic Partnerships",
    message: "Write a comprehensive partnership proposal highlighting synergies between our AI suite and their distribution channels to drive joint Q4 sales."
  },
  {
    id: "temp-4",
    title: "Retention Win-back",
    description: "Recover churned users with empathetic positioning, special offers, and clear feedback loops.",
    category: "Support",
    difficulty: "Medium",
    popularity: "High",
    successRate: "74%",
    gradient: "from-teal-500/10 via-indigo-500/5 to-white",
    icon: Compass,
    recipient: "Churned Customer",
    message: "Compose a churn win-back email offering a 20% discount for three months, asking for feedback on what we can improve to win their business back."
  },
  {
    id: "temp-5",
    title: "Vacation Leave Request",
    description: "Request time off for vacation, detailing dates and handoff plans.",
    category: "Personal",
    difficulty: "Easy",
    popularity: "High",
    successRate: "90%",
    gradient: "from-amber-500/10 via-orange-500/5 to-white",
    icon: Compass,
    recipient: "Line Manager",
    message: "Draft a formal email requesting a two-week annual leave vacation from August 10 to August 24, detailing that my current deliverables will be covered."
  },
  {
    id: "temp-6",
    title: "Product Feedback Loop",
    description: "Invite premium customers to a feedback interview, offering Amazon voucher incentive.",
    category: "Support",
    difficulty: "Medium",
    popularity: "High",
    successRate: "81%",
    gradient: "from-emerald-500/10 via-teal-500/5 to-white",
    icon: FileText,
    recipient: "VIP Product User",
    message: "Draft an invitation for a product feedback session, offering a $50 gift card for their time."
  },
  {
    id: "temp-7",
    title: "Follow-up after Pitch",
    description: "Follow up with prospects after a demo pitch. Recap key value props.",
    category: "Sales",
    difficulty: "Easy",
    popularity: "Elite",
    successRate: "86%",
    gradient: "from-sky-500/10 via-indigo-500/5 to-white",
    icon: TrendingUp,
    recipient: "Technical Decision Maker",
    message: "Write a follow-up email after a product demo pitch, recapping how our infrastructure dashboard can reduce their latency by 20%."
  },
  {
    id: "temp-8",
    title: "Salary Review Proposal",
    description: "Initiate salary and compensation adjustment review with benchmarks.",
    category: "Professional",
    difficulty: "Hard",
    popularity: "Med",
    successRate: "93%",
    gradient: "from-rose-500/10 via-purple-500/5 to-white",
    icon: Briefcase,
    recipient: "Head of Engineering",
    message: "Draft a professional email requesting a meeting to review my salary and benefits package based on industry benchmark data."
  },
  {
    id: "temp-9",
    title: "LinkedIn Outreach Intro",
    description: "A highly concise introduction request for decision makers.",
    category: "Sales",
    difficulty: "Easy",
    popularity: "Elite",
    successRate: "89%",
    gradient: "from-indigo-500/10 via-blue-500/5 to-white",
    icon: Flame,
    recipient: "Venture Capital Partner",
    message: "Write a short cold networking request introducing our dev tools, seeking a 10-minute coffee chat."
  },
  {
    id: "temp-10",
    title: "Sabbatical Leave Request",
    description: "Formulate leave request for career breaks or education reasons.",
    category: "Personal",
    difficulty: "Medium",
    popularity: "Med",
    successRate: "85%",
    gradient: "from-violet-500/10 via-indigo-500/5 to-white",
    icon: Briefcase,
    recipient: "HR Director",
    message: "Draft a formal email requesting a 6-month sabbatical leave starting October 1, to pursue a professional cybersecurity degree."
  },
  {
    id: "temp-11",
    title: "Apology for Service Bug",
    description: "Detailed post-mortem apology for SaaS platform service bugs.",
    category: "Support",
    difficulty: "Medium",
    popularity: "High",
    successRate: "91%",
    gradient: "from-rose-500/10 via-indigo-500/5 to-white",
    icon: Compass,
    recipient: "Enterprise Accounts",
    message: "Draft a sincere apology letter regarding the database latency issue on June 29, explaining our hotfix remediation steps."
  },
  {
    id: "temp-12",
    title: "Recommendation Request",
    description: "Request former supervisors for LinkedIn recommendation or reference.",
    category: "Personal",
    difficulty: "Easy",
    popularity: "High",
    successRate: "87%",
    gradient: "from-teal-500/10 via-amber-500/5 to-white",
    icon: Award,
    recipient: "Former Engineering Manager",
    message: "Draft a friendly email asking a former boss if they would write a brief LinkedIn recommendation regarding my software contributions."
  }
];

const CATEGORIES = [
  { name: "All Templates", count: 124 },
  { name: "Professional", count: 42 },
  { name: "Sales", count: 28 },
  { name: "Personal", count: 34 },
  { name: "Support", count: 20 }
];

const Templates = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [activeToneFilter, setActiveToneFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplexity, setSelectedComplexity] = useState({
    low: false,
    medium: false,
    high: false
  });

  const CATEGORY_TONE_MAP = {
    "Professional": "Professional",
    "Sales": "Persuasive",
    "Support": "Empathetic",
    "Personal": "Friendly",
  };

  const handleUseTemplate = (temp) => {
    const tone = CATEGORY_TONE_MAP[temp.category] || "Professional";
    toast.success(`Loaded: ${temp.title}`);
    navigate("/generate", { 
      state: { 
        emailPreset: {
          recipient: temp.recipient,
          message: temp.message,
          tone
        }
      } 
    });
  };

  const handleComplexityToggle = (level) => {
    setSelectedComplexity(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
    setCurrentPage(1);
  };

  const handleCategorySelect = (name) => {
    setActiveCategory(name);
    setCurrentPage(1);
  };

  const handleToneSelect = (tone) => {
    setActiveToneFilter(activeToneFilter === tone ? "" : tone);
    setCurrentPage(1);
  };

  // Filter templates list based on category & filters
  const filteredTemplates = TEMPLATES.filter(temp => {
    if (activeCategory !== "All Templates" && temp.category !== activeCategory) {
      return false;
    }
    if (activeToneFilter) {
      // Professional templates map Professional tone, Sales/Personal map Casual/Persuasive, etc.
      if (activeToneFilter === "Casual" && temp.category === "Professional") return false;
      if (activeToneFilter === "Formal" && temp.category === "Personal") return false;
    }
    return true;
  });

  // Pagination calculations
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Filters Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Categories Panel */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">Categories</h4>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                  activeCategory === cat.name
                    ? "bg-email-brand/10 text-email-brand font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeCategory === cat.name ? "bg-email-brand text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Advanced Filters */}
        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">Advanced Filters</h4>
          
          {/* Tone Filters */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block">Tone</span>
            <div className="flex flex-wrap gap-2 px-2">
              {["Casual", "Formal", "Urgent", "Persuasive"].map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleToneSelect(tone)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-all ${
                    activeToneFilter === tone
                      ? "border-email-brand bg-indigo-50/20 text-email-brand"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Checkboxes */}
          <div className="space-y-2.5 px-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Complexity</span>
            
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComplexity.low}
                onChange={() => handleComplexityToggle("low")}
                className="h-4 w-4 cursor-pointer rounded border-slate-200 text-email-brand focus:ring-email-brand"
              />
              <span>Low (Quick replies)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComplexity.medium}
                onChange={() => handleComplexityToggle("medium")}
                className="h-4 w-4 cursor-pointer rounded border-slate-200 text-email-brand focus:ring-email-brand"
              />
              <span>Medium (Detailed)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComplexity.high}
                onChange={() => handleComplexityToggle("high")}
                className="h-4 w-4 cursor-pointer rounded border-slate-200 text-email-brand focus:ring-email-brand"
              />
              <span>High (Comprehensive)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right Content Column */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-heading">Email Templates Library</h2>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Browse our high-performance structures. Optimized with AI to drive engagement and results.
          </p>
        </div>

        {/* Templates Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleTemplates.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-400">
              No templates match your active filters.
            </div>
          ) : (
            visibleTemplates.map((temp) => (
              <div 
                key={temp.id} 
                className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-premium relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${temp.gradient}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-email-brand border border-slate-100">
                      <temp.icon className="h-5 w-5" />
                    </span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-email-brand">
                      {temp.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 font-heading tracking-tight leading-snug">
                    {temp.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 font-medium">
                    {temp.description}
                  </p>
                </div>

                {/* Template stats & buttons */}
                <div className="mt-6">
                  <div className="grid grid-cols-3 border-t border-slate-100/60 pt-4 mb-4 text-center">
                    <div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase">DIFFICULTY</span>
                      <span className="block text-[11px] font-bold text-slate-600 mt-0.5">{temp.difficulty}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase">POPULARITY</span>
                      <span className="block text-[11px] font-bold text-slate-600 mt-0.5">{temp.popularity}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase">SUCCESS</span>
                      <span className="block text-[11px] font-bold text-indigo-600 mt-0.5">{temp.successRate}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUseTemplate(temp)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-email-brand py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover transition-all cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Pagination */}
        {filteredTemplates.length > 0 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-semibold">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} Templates
            </span>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shadow-sm transition-all ${
                    currentPage === i + 1
                      ? "bg-email-brand text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;

