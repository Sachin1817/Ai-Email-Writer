import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import emailService from "../services/emailService";
import { 
  exportToTXT, 
  exportToPDF, 
  exportToDOCX 
} from "../utils/exportHelper";
import { 
  Sparkles, 
  User, 
  Mail, 
  Sliders, 
  Copy, 
  Star, 
  Download, 
  Check, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const TONES = [
  "Professional", "Casual", "Formal", "Friendly", "Persuasive", 
  "Confident", "Empathetic", "Apologetic", "Appreciative", "Urgent"
];

const SUGGESTIONS = [
  {
    label: "Interview Follow-up",
    recipient: "Hiring Manager",
    message: "I wanted to follow up on my interview for the software engineer role last Tuesday. Thank you for the opportunity."
  },
  {
    label: "Sales Proposal",
    recipient: "Procurement Director",
    message: "We offer enterprise software solutions that reduce build times by 40%. Would love to discuss a partnership."
  },
  {
    label: "Meeting Summary",
    recipient: "Marketing Team",
    message: "Summarize the key points of our discussion: launch date is set for Sept 1, marketing campaign begins Aug 15, next sync is next Monday."
  },
  {
    label: "Leave Request",
    recipient: "HR Team / Manager",
    message: "Requesting personal leave for 3 days starting next Monday due to family commitments. All my active tasks are fully covered."
  },
  {
    label: "Customer Apology",
    recipient: "Client Account Head",
    message: "Apologizing for the delay in delivering the final Q2 performance reports. We are implementing checks to prevent future issues."
  },
  {
    label: "Thank You Note",
    recipient: "Event Organizers",
    message: "Thank you for hosting such an insightful conference yesterday. The networking sessions and panels were highly valuable."
  },
  {
    label: "Customer Support Reply",
    recipient: "Premium User",
    message: "Replying to resolve the payment billing issue. We have credited your account balance and upgraded your plan tier."
  },
  {
    label: "Recommendation Letter",
    recipient: "Admissions Committee",
    message: "Writing a strong recommendation for Alex, who excelled as a senior product engineer in my team for two years."
  },
  {
    label: "Event Invitation",
    recipient: "Product Managers Guild",
    message: "Inviting you to attend our next Tech Innovators Roundtable on July 15 at our headquarters. Please confirm your RSVP."
  },
  {
    label: "Salary Negotiation",
    recipient: "Director of Talent Acquisition",
    message: "Discussing the salary package for the Lead Designer offer, proposing a base of 120k given my years of sector expertise."
  },
  {
    label: "Project Status Update",
    recipient: "Steering Committee",
    message: "Providing the status update for Project Alpha. Phase 2 milestones are on schedule, and QA testing starts next Wednesday."
  },
  {
    label: "Pitch Deck Feedback",
    recipient: "Startup Founder",
    message: "Sharing feedback on the series A deck: strengthen slide 4 market size metrics, and add client logos on slide 8."
  },
  {
    label: "Resignation Notice",
    recipient: "Managing Director",
    message: "Submitting formal resignation from the role of Senior Dev. My last day will be July 30. Thank you for support."
  },
  {
    label: "Networking Request",
    recipient: "Industry Peer",
    message: "Reaching out to connect and exchange insights on recent trends in LLM deployment pipelines. Would love a 15-min chat."
  },
  {
    label: "Cold Intro",
    recipient: "Chief Information Officer",
    message: "Introducing our software optimization tools which help engineering teams cut CI build queues by half. Let's connect."
  }
];

const appendBeforeSignature = (content, addition) => {
  const signOffs = [
    "Best regards,", 
    "Sincerely,", 
    "Regards,", 
    "Warmly,", 
    "Best,",
    "Best regards",
    "Sincerely",
    "Regards",
    "Warmly",
    "Best"
  ];
  
  for (const signOff of signOffs) {
    const escapedSignOff = signOff.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|\\n)(${escapedSignOff}[\\s,]*(?:\\n|$))`, 'i');
    const match = content.match(regex);
    if (match) {
      const index = match.index;
      const prefix = content.substring(0, index);
      const suffix = content.substring(index);
      return prefix.trimEnd() + "\n\n" + addition.trim() + "\n\n" + suffix.trim();
    }
  }
  return content.trimEnd() + "\n\n" + addition.trim();
};

const getMockEmailForTone = (recipient, content, tone, userName) => {
  const toneUpper = (tone || "PROFESSIONAL").toUpperCase();
  const name = userName || "James Dalton";
  const rec = recipient || "Partners";
  const topic = content.split(".")[0].slice(0, 40);

  switch (toneUpper) {
    case "FRIENDLY":
      return {
        subject: `Hello from ${name} - regarding ${topic}`,
        content: `Hi ${recipient || "there"}!\n\nHope you're having a wonderful week! 😊\n\nI just wanted to drop a quick line to check in about: ${content}.\n\nLet's catch up soon over a quick call!\n\nWarmly,\n${name}`
      };
    case "CASUAL":
      return {
        subject: `Quick update on ${topic}`,
        content: `Hi ${recipient || "there"},\n\nHope you're doing well! Just wanted to reach out regarding: ${content}.\n\nLet me know what you think when you get a chance, and we can chat more about it soon.\n\nTalk to you later,\n${name}`
      };
    case "FORMAL":
      return {
        subject: `Formal Proposal: ${topic}`,
        content: `Dear ${recipient || "Sir/Madam"},\n\nI am writing to formally address the matter of: ${content}.\n\nWe trust that our proposed approach aligns with your strategic objectives. Please review the attached points at your convenience.\n\nSincerely,\n${name}`
      };
    case "PERSUASIVE":
      return {
        subject: `Unlock new opportunities: ${topic}`,
        content: `Dear ${rec},\n\nWe have a unique opportunity to drive substantial value regarding: ${content}.\n\nBy leveraging our combined strengths, we can optimize operations and accelerate our growth path. Let's set up a call to explore how we can make this happen.\n\nBest regards,\n${name}`
      };
    case "CONFIDENT":
      return {
        subject: `Proposal: ${topic}`,
        content: `Dear ${rec},\n\nI am writing to outline our concrete plan regarding: ${content}.\n\nOur team is fully prepared to deliver top-tier results and exceed expectations. I am certain we can establish a seamless execution process. Let's schedule a call to finalize the next steps.\n\nBest regards,\n${name}`
      };
    case "EMPATHETIC":
      return {
        subject: `Supporting you on ${topic}`,
        content: `Dear ${rec},\n\nI completely understand the challenges you are facing regarding: ${content}.\n\nPlease know that we are here to support you in any way possible, and we want to ensure this transition is as smooth and stress-free as possible. Let me know how we can best help.\n\nWarmly,\n${name}`
      };
    case "APOLOGETIC":
      return {
        subject: `Sincere apologies regarding ${topic}`,
        content: `Dear ${rec},\n\nWe sincerely apologize for any inconvenience caused regarding: ${content}.\n\nWe take full responsibility and are implementing immediate measures to prevent this from happening in the future. Thank you for your patience and understanding.\n\nSincerely,\n${name}`
      };
    case "APPRECIATIVE":
      return {
        subject: `Sincere thanks for ${topic}`,
        content: `Dear ${rec},\n\nI wanted to express my sincere appreciation for your partnership and efforts regarding: ${content}.\n\nYour dedication has been instrumental, and we are truly grateful for our collaboration. Thank you once again for your support.\n\nBest regards,\n${name}`
      };
    case "URGENT":
      return {
        subject: `URGENT: Actions required on ${topic}`,
        content: `Dear ${rec},\n\nThis is a time-sensitive update regarding: ${content}.\n\nPlease review this immediately and provide your feedback as soon as possible so we can proceed without further delays.\n\nBest,\n${name}`
      };
    case "PROFESSIONAL":
    default:
      return {
        subject: `Strategic Proposal for ${recipient || "Partnership"}`,
        content: `Dear ${rec},\n\nI hope this email finds you well.\n\nFollowing up on our discussions, I am writing to highlight: ${content}.\n\nLet's schedule a call to discuss synergies.\n\nBest regards,\n${name}`
      };
  }
};

const Generate = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Form State
  const [recipient, setRecipient] = useState("");
  const [coreMessage, setCoreMessage] = useState("");
  const [activeTone, setActiveTone] = useState("Professional");
  const [creativity, setCreativity] = useState(50); // 0 = Precise, 50 = Balanced, 100 = Creative

  // UI Control & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailId, setEmailId] = useState(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState(""); // Fallback / legacy

  // New Structured Fields
  const [preview, setPreview] = useState("");
  const [greeting, setGreeting] = useState("");
  const [body, setBody] = useState("");
  const [closing, setClosing] = useState("");
  const [signature, setSignature] = useState("");
  const [qualityMetrics, setQualityMetrics] = useState({ grammar: 0, tone: 0, readability: 0, professionalism: 0 });
  const [alternativeSubjectLines, setAlternativeSubjectLines] = useState([]);
  const [suggestedFollowUp, setSuggestedFollowUp] = useState("");
  const [estimatedReadingTime, setEstimatedReadingTime] = useState("");
  const [estimatedReplyRate, setEstimatedReplyRate] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [translateDropdownOpen, setTranslateDropdownOpen] = useState(false);

  // Check if routed with preset action/email ID or template emailPreset
  useEffect(() => {
    if (location.state) {
      const { emailId: routeEmailId, action, emailPreset } = location.state;
      if (routeEmailId) {
        loadExistingEmail(routeEmailId);
      } else if (emailPreset) {
        // Routed from Templates page — apply all preset fields
        setRecipient(emailPreset.recipient || "");
        setCoreMessage(emailPreset.message || "");
        if (emailPreset.tone && TONES.includes(emailPreset.tone)) {
          setActiveTone(emailPreset.tone);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action) {
        handleActionPreset(action);
      }
    }
  }, [location.state]);


  const loadExistingEmail = async (id) => {
    const toastId = toast.loading("Loading email details...");
    try {
      // In a real app we'd fetch details by ID. 
      // Let's call the history endpoint and find the email or fallback.
      const res = await emailService.getEmails();
      const email = res.emails?.find(e => e._id === id);
      if (email) {
        setEmailId(email._id);
        setSubject(email.subject);
        setContent(email.content || "");
        setPreview(email.preview || "");
        setGreeting(email.greeting || "");
        setBody(email.body || "");
        setClosing(email.closing || "");
        setSignature(email.signature || "");
        setQualityMetrics(email.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 });
        setAlternativeSubjectLines(email.alternativeSubjectLines || []);
        setSuggestedFollowUp(email.suggestedFollowUp || "");
        setEstimatedReadingTime(email.estimatedReadingTime || "");
        setEstimatedReplyRate(email.estimatedReplyRate || "");
        
        setRecipient(email.recipient || "");
        setActiveTone(email.tone || "Professional");
        setIsFavorite(email.isFavorite || false);
        toast.success("Loaded draft successfully", { id: toastId });
      } else {
        toast.error("Email draft not found", { id: toastId });
      }
    } catch {
      toast.error("Could not fetch details", { id: toastId });
    }
  };

  const handleActionPreset = (action) => {
    if (action === "generate") {
      setCoreMessage("Write a friendly introduction proposal...");
    } else if (action === "rewrite") {
      setCoreMessage("Rewrite the following: Hi, please review the budget calculations immediately.");
      setActiveTone("Formal");
    } else if (action === "improve") {
      setCoreMessage("Improve readability: We are writing to make an application for the job opening.");
    } else if (action === "translate") {
      setCoreMessage("Translate to Spanish: Thank you so much for meeting with us yesterday.");
    }
  };

  const handleApplySuggestion = (sug) => {
    setRecipient(sug.recipient);
    setCoreMessage(sug.message);
    toast.success(`Applied: ${sug.label}`);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!coreMessage.trim()) {
      toast.error("Please enter a core message first.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("AI is crafting your masterpiece...");
    
    try {
      const res = await emailService.generateEmail({
        recipient,
        content: coreMessage, // map coreMessage to backend payload content
        tone: activeTone.toUpperCase(),
        creativity: creativity <= 33 ? "PRECISE" : creativity <= 66 ? "BALANCED" : "CREATIVE"
      });

      if (res && res.email) {
        setEmailId(res.email._id);
        setSubject(res.email.subject || "Strategic Partnership Proposal");
        setContent(res.email.content || "");
        setPreview(res.email.preview || "");
        setGreeting(res.email.greeting || "");
        setBody(res.email.body || "");
        setClosing(res.email.closing || "");
        setSignature(res.email.signature || "");
        setQualityMetrics(res.email.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 });
        setAlternativeSubjectLines(res.email.alternativeSubjectLines || []);
        setSuggestedFollowUp(res.email.suggestedFollowUp || "");
        setEstimatedReadingTime(res.email.estimatedReadingTime || "");
        setEstimatedReplyRate(res.email.estimatedReplyRate || "");
        setIsFavorite(false);
        toast.success("Email generated successfully!", { id: toastId });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to generate email";
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Action Modifiers
  const getFullEmailText = () => {
    if (content.trim()) return content;
    return [greeting, body, closing, signature].filter(Boolean).join("\n\n");
  };

  const handleQuickModify = async (modifier) => {
    const fullText = getFullEmailText();
    if (!fullText.trim() || !emailId) {
      toast.error("Generate an email first to apply modifiers.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Applying modifier: ${modifier}...`);

    try {
      const res = await emailService.rewriteEmail(emailId, modifier.toUpperCase(), "", fullText, subject);
      if (res && res.email) {
        setContent(res.email.content || "");
        setPreview(res.email.preview || "");
        setGreeting(res.email.greeting || "");
        setBody(res.email.body || "");
        setClosing(res.email.closing || "");
        setSignature(res.email.signature || "");
        setQualityMetrics(res.email.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 });
        setAlternativeSubjectLines(res.email.alternativeSubjectLines || []);
        setSuggestedFollowUp(res.email.suggestedFollowUp || "");
        setEstimatedReadingTime(res.email.estimatedReadingTime || "");
        setEstimatedReplyRate(res.email.estimatedReplyRate || "");
        if (res.email.subject) setSubject(res.email.subject);
        toast.success(`Applied: ${modifier}`, { id: toastId });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("AI Modify error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || `Failed to apply modifier: ${modifier}`;
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async (lang) => {
    setTranslateDropdownOpen(false);
    const fullText = getFullEmailText();
    if (!fullText.trim() || !emailId) {
      toast.error("Generate an email first to translate.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Translating to ${lang}...`);

    try {
      const res = await emailService.rewriteEmail(emailId, "TRANSLATE", `Translate to ${lang}`, fullText, subject);
      if (res && res.email) {
        setContent(res.email.content || "");
        setPreview(res.email.preview || "");
        setGreeting(res.email.greeting || "");
        setBody(res.email.body || "");
        setClosing(res.email.closing || "");
        setSignature(res.email.signature || "");
        setQualityMetrics(res.email.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 });
        setAlternativeSubjectLines(res.email.alternativeSubjectLines || []);
        setSuggestedFollowUp(res.email.suggestedFollowUp || "");
        setEstimatedReadingTime(res.email.estimatedReadingTime || "");
        setEstimatedReplyRate(res.email.estimatedReplyRate || "");
        if (res.email.subject) setSubject(res.email.subject);
        toast.success(`Translated to ${lang}`, { id: toastId });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("AI Translation error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || `Failed to translate to ${lang}`;
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerExport = (format) => {
    setExportDropdownOpen(false);
    const fullText = getFullEmailText();
    if (!fullText.trim()) {
      toast.error("No content to export");
      return;
    }
    
    const element = document.createElement("a");
    let mimeType = 'text/plain';
    let contentToExport = `Subject: ${subject}\n\n${fullText}`;
    
    if (format === 'html') {
      mimeType = 'text/html';
      contentToExport = `<html><body><h2>${subject}</h2><p>${fullText.replace(/\n/g, '<br/>')}</p></body></html>`;
    }
    
    const file = new Blob([contentToExport], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `email_export_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : format === 'docx' ? 'doc' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${content}`);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavoriteToggle = async () => {
    if (!emailId) return;
    try {
      await emailService.toggleFavorite(emailId);
      setIsFavorite(!isFavorite);
      toast.success(!isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch {
      setIsFavorite(!isFavorite);
      toast.success(!isFavorite ? "Added mock to favorites" : "Removed mock from favorites");
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Input Pane: Form Fields */}
      <div className="lg:col-span-5 space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800 font-heading">New Email</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
          {/* Context Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5" />
              <span>Context</span>
            </h3>

            {/* Recipient */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Recipient Name/Role</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Sarah Miller or Marketing Lead"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            {/* Core message text box */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-500">What is the core message?</label>
                <span className="text-[10px] font-bold text-slate-400">{coreMessage.length} / 500</span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <textarea
                  placeholder="e.g. Follow up on our meeting, outline pricing details, request a demo next week..."
                  value={coreMessage}
                  maxLength={500}
                  onChange={(e) => setCoreMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Style & Tone Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Style & Tone</span>
            </h3>

            {/* Core Tones selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTone("Professional")}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold border transition-all ${
                  activeTone === "Professional"
                    ? "border-email-brand bg-indigo-50/20 text-email-brand shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {activeTone === "Professional" && <Check className="h-4 w-4 stroke-[3px]" />}
                <span>Professional</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTone("Casual")}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold border transition-all ${
                  activeTone === "Casual"
                    ? "border-email-brand bg-indigo-50/20 text-email-brand shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {activeTone === "Casual" && <Check className="h-4 w-4 stroke-[3px]" />}
                <span>Casual</span>
              </button>
            </div>

            {/* Other tones selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">More Tone Options</label>
              <select
                value={TONES.includes(activeTone) ? activeTone : "Professional"}
                onChange={(e) => setActiveTone(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none transition-all focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                {TONES.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>

            {/* Creativity Index Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Creativity Level</span>
                <span className="text-email-brand font-bold">
                  {creativity <= 33 ? "Precise" : creativity <= 66 ? "Balanced" : "Creative"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={creativity}
                onChange={(e) => setCreativity(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer rounded-lg bg-slate-100 accent-email-brand transition-all"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-email-brand py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-email-brand-hover disabled:opacity-60 transition-all cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>Generate Masterpiece</span>
          </button>
        </form>

        {/* Suggested Prompts Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Prompts</h4>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug) => (
              <button
                key={sug.label}
                type="button"
                onClick={() => handleApplySuggestion(sug)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Preview Pane: Email Inbox Mockup */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <h2 className="text-xl font-bold text-slate-800 font-heading mb-4 lg:self-start">Preview</h2>

        <div className="flex-1 flex flex-col rounded-2xl border border-slate-100 bg-white shadow-premium overflow-hidden min-h-[500px]">
          {/* Email Header Panel */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-email-brand text-white font-bold text-sm shadow-sm">
                  {user?.displayName?.split(" ").map(n => n[0]).join("") || "JD"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 leading-none m-0">
                    {user?.displayName || "James Dalton"}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                    to {recipient || "(Recipient Name/Role)"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-bold">
                Today, {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Editable Subject field */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-400">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Generate an email to generate the subject..."
                className="flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Email Content Panel / Loading Spinner */}
          <div className="flex-1 p-6 relative flex flex-col">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
                >
                  <div className="flex items-center justify-center relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-email-brand/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-email-brand border-t-transparent animate-spin"></div>
                    <Sparkles className="h-6 w-6 text-email-brand animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 animate-pulse">AI Writing Assistant thinking...</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {body || content ? (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">


                {/* Structured Email Content */}
                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-700 bg-transparent outline-none">
                  {greeting && <div>{greeting}</div>}
                  {body && <div className="whitespace-pre-wrap">{body}</div>}
                  {!body && content && <div className="whitespace-pre-wrap">{content}</div>}
                  {closing && <div>{closing}</div>}
                  {signature && <div>{signature}</div>}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-12">
                <AlertCircle className="h-10 w-10 text-slate-300 stroke-[1.5px] mb-3" />
                <h4 className="text-xs font-bold text-slate-500">Draft Content Empty</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">
                  Fill out the parameters on the left and click 'Generate Masterpiece' to begin.
                </p>
              </div>
            )}
          </div>

          {/* Email Footer Toolbar */}
          {(body || content) && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              {/* Left actions: Copy / Fav / Export */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500 stroke-rose-500 text-rose-500" : ""}`} />
                  <span>Favorite</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </button>

                  {exportDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setExportDropdownOpen(false)} />
                      <div className="absolute bottom-11 left-0 z-20 w-36 rounded-xl border border-slate-100 bg-white py-1.5 shadow-premium text-xs text-slate-600">
                        <button
                          onClick={() => triggerExport("pdf")}
                          className="flex w-full items-center px-4 py-2 hover:bg-slate-50 font-semibold"
                        >
                          PDF Document
                        </button>
                        <button
                          onClick={() => triggerExport("docx")}
                          className="flex w-full items-center px-4 py-2 hover:bg-slate-50 font-semibold"
                        >
                          Word Document
                        </button>
                        <button
                          onClick={() => triggerExport("txt")}
                          className="flex w-full items-center px-4 py-2 hover:bg-slate-50 font-semibold"
                        >
                          Text File
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right actions: AI Modification Suite */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickModify("shorten")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                >
                  Shorten
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickModify("expand")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickModify("improve")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                >
                  Improve
                </button>

                {/* Translate Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTranslateDropdownOpen(!translateDropdownOpen)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wide"
                  >
                    Translate
                  </button>
                  {translateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setTranslateDropdownOpen(false)} />
                      <div className="absolute bottom-11 right-0 z-20 w-32 rounded-xl border border-slate-100 bg-white py-1.5 shadow-premium text-xs text-slate-600">
                        {["Spanish", "French", "German", "Japanese"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleTranslate(lang)}
                            className="flex w-full items-center px-4 py-2 hover:bg-slate-50 font-semibold"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-email-brand hover:bg-indigo-100/50 transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
