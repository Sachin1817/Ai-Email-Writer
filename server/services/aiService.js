import axios from "axios";

const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const aiServiceClient = axios.create({
  baseURL: AI_URL,
  timeout: 50000 // 50 seconds timeout for AI generation
});

const aiService = {
  generate: async (payload) => {
    try {
      const response = await aiServiceClient.post("/generate", {
        recipient: payload.recipient || "",
        content: payload.content || "",
        tone: payload.tone || "PROFESSIONAL",
        creativity: payload.creativity || "BALANCED"
      });
      return response.data;
    } catch (error) {
      console.error("FastAPI generation request failed:", error.message);
      throw error;
    }
  },

  rewrite: async (payload) => {
    try {
      const response = await aiServiceClient.post("/rewrite", {
        content: payload.content || "",
        action: payload.action || "IMPROVE",
        additional_instructions: payload.additionalInstructions || "",
        subject: payload.subject || ""
      });
      return response.data;
    } catch (error) {
      console.error("FastAPI rewrite request failed:", error.message);
      throw error;
    }
  }
};

export default aiService;
