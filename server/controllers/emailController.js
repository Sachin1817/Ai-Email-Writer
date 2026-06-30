import Email from "../models/Email.js";
import aiService from "../services/aiService.js";
import mongoose from "mongoose";

// Helper to check if mongoose is connected
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};


// Local storage array for offline testing
let localMocks = [];

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

export const generateEmail = async (req, res) => {
  const { recipient, content, tone, creativity } = req.body;
  const userId = req.user.uid;

  try {
    let aiResponse;
    try {
      aiResponse = await aiService.generate({ recipient, content, tone, creativity });
    } catch (e) {
      console.error("AI service generation failed:", e.message);
      return res.status(502).json({ 
        message: "AI service generation failed or is unreachable", 
        error: e.response?.data?.detail || e.message 
      });
    }

    const emailData = {
      userId,
      subject: aiResponse.subject || "AI Generated Email",
      recipient: recipient || "",
      content: aiResponse.content || "", // Fallback
      preview: aiResponse.preview || "",
      greeting: aiResponse.greeting || "",
      body: aiResponse.body || "",
      closing: aiResponse.closing || "",
      signature: aiResponse.signature || "",
      qualityMetrics: aiResponse.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 },
      alternativeSubjectLines: aiResponse.alternativeSubjectLines || [],
      suggestedFollowUp: aiResponse.suggestedFollowUp || "",
      estimatedReadingTime: aiResponse.estimatedReadingTime || "",
      estimatedReplyRate: aiResponse.estimatedReplyRate || "",
      tone: tone || "PROFESSIONAL",
      creativity: creativity || "BALANCED",
      status: "success"
    };

    let savedEmail;
    try {
      const emailObj = new Email(emailData);
      savedEmail = await emailObj.save();
    } catch (dbErr) {
      console.warn("MongoDB offline, saving email to memory", dbErr.message);
      savedEmail = {
        _id: `mock-db-${Date.now()}`,
        ...emailData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localMocks.unshift(savedEmail);
    }

    return res.status(201).json({ email: savedEmail });
  } catch (error) {
    console.error("Email generation controller error:", error);
    return res.status(500).json({ message: "Failed to generate email", error: error.message });
  }
};

export const rewriteEmail = async (req, res) => {
  const { id } = req.params;
  const { action, additionalInstructions, content, subject } = req.body;

  try {
    let email;
    try {
      email = await Email.findOne({ _id: id, userId: req.user.uid });
    } catch (dbErr) {
      email = localMocks.find(e => e._id === id);
    }

    if (!email) {
      return res.status(404).json({ message: "Email draft not found" });
    }

    // Apply the latest subject and content from UI if provided
    if (content !== undefined && content !== null) {
      email.content = content;
    }
    if (subject !== undefined && subject !== null) {
      email.subject = subject;
    }

    let aiResponse;
    try {
      aiResponse = await aiService.rewrite({
        content: email.content,
        action,
        additionalInstructions,
        subject: email.subject
      });
    } catch (e) {
      console.error("AI service rewrite failed:", e.message);
      return res.status(502).json({ 
        message: "AI service rewrite failed or is unreachable", 
        error: e.response?.data?.detail || e.message 
      });
    }

    email.content = aiResponse.content || "";
    email.preview = aiResponse.preview || "";
    email.greeting = aiResponse.greeting || "";
    email.body = aiResponse.body || "";
    email.closing = aiResponse.closing || "";
    email.signature = aiResponse.signature || "";
    email.qualityMetrics = aiResponse.qualityMetrics || { grammar: 0, tone: 0, readability: 0, professionalism: 0 };
    email.alternativeSubjectLines = aiResponse.alternativeSubjectLines || [];
    email.suggestedFollowUp = aiResponse.suggestedFollowUp || "";
    email.estimatedReadingTime = aiResponse.estimatedReadingTime || "";
    email.estimatedReplyRate = aiResponse.estimatedReplyRate || "";

    if (aiResponse.subject) {
      email.subject = aiResponse.subject;
    }

    let updatedEmail;
    try {
      if (email.save) {
        updatedEmail = await email.save();
      } else {
        // Mock save
        const index = localMocks.findIndex(e => e._id === id);
        if (index !== -1) {
          localMocks[index] = { ...email, content: email.content, subject: email.subject, updatedAt: new Date().toISOString() };
          updatedEmail = localMocks[index];
        } else {
          updatedEmail = email;
        }
      }
    } catch (dbErr) {
      updatedEmail = email;
    }

    return res.status(200).json({ email: updatedEmail });
  } catch (error) {
    console.error("Email rewrite error:", error);
    return res.status(500).json({ message: "Failed to rewrite email", error: error.message });
  }
};

export const getEmails = async (req, res) => {
  const userId = req.user.uid;
  try {
    let emails = [];
    try {
      emails = await Email.find({ userId }).sort({ createdAt: -1 });
    } catch (dbErr) {
      emails = localMocks.filter(e => e.userId === userId);
    }
    return res.status(200).json({ emails });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch emails", error: error.message });
  }
};

export const deleteEmail = async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await Email.deleteOne({ _id: id, userId: req.user.uid });
    } catch (dbErr) {
      localMocks = localMocks.filter(e => e._id !== id);
    }
    return res.status(200).json({ message: "Email draft deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete email", error: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  const { id } = req.params;
  try {
    let email;
    try {
      email = await Email.findOne({ _id: id, userId: req.user.uid });
      if (email) {
        email.isFavorite = !email.isFavorite;
        await email.save();
      }
    } catch (dbErr) {
      const index = localMocks.findIndex(e => e._id === id);
      if (index !== -1) {
        localMocks[index].isFavorite = !localMocks[index].isFavorite;
        email = localMocks[index];
      }
    }

    if (!email) {
      return res.status(404).json({ message: "Email draft not found" });
    }
    return res.status(200).json({ email });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle favorite", error: error.message });
  }
};

export const togglePin = async (req, res) => {
  const { id } = req.params;
  try {
    let email;
    try {
      email = await Email.findOne({ _id: id, userId: req.user.uid });
      if (email) {
        email.isPinned = !email.isPinned;
        await email.save();
      }
    } catch (dbErr) {
      const index = localMocks.findIndex(e => e._id === id);
      if (index !== -1) {
        localMocks[index].isPinned = !localMocks[index].isPinned;
        email = localMocks[index];
      }
    }

    if (!email) {
      return res.status(404).json({ message: "Email draft not found" });
    }
    return res.status(200).json({ email });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle pin", error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  const userId = req.user.uid;
  try {
    let emails = [];
    try {
      emails = await Email.find({ userId }).sort({ createdAt: -1 });
    } catch (dbErr) {
      emails = localMocks.filter(e => e.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCount = emails.length;
    const optimizedCount = emails.filter(e => e.status === "success").length;
    const draftsCount = emails.filter(e => e.status === "draft").length;
    const favoritesCount = emails.filter(e => e.isFavorite).length;
    const recentEmails = emails.slice(0, 3);

    return res.status(200).json({
      totalCount,
      optimizedCount,
      draftsCount,
      favoritesCount,
      recentEmails
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to aggregate statistics", error: error.message });
  }
};

export const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { subject, content } = req.body;
  try {
    let email;
    try {
      email = await Email.findOne({ _id: id, userId: req.user.uid });
      if (email) {
        email.subject = subject;
        email.content = content;
        await email.save();
      }
    } catch (dbErr) {
      const index = localMocks.findIndex(e => e._id === id);
      if (index !== -1) {
        localMocks[index].subject = subject;
        localMocks[index].content = content;
        email = localMocks[index];
      }
    }

    if (!email) {
      return res.status(404).json({ message: "Email draft not found" });
    }
    return res.status(200).json({ email });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update email content", error: error.message });
  }
};
