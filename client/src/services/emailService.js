import API from "./api";

const emailService = {
  // Generate a brand new email
  generateEmail: async (data) => {
    const response = await API.post("/emails/generate", data);
    return response.data;
  },

  // Perform operations like rewrite, improve, expand, shorten, translate
  rewriteEmail: async (id, action, additionalInstructions = "", content = "", subject = "") => {
    const response = await API.post(`/emails/${id}/rewrite`, {
      action,
      additionalInstructions,
      content,
      subject
    });
    return response.data;
  },

  // Get email history with search and pagination
  getEmails: async (params) => {
    const response = await API.get("/emails", { params });
    return response.data;
  },

  // Delete an email
  deleteEmail: async (id) => {
    const response = await API.delete(`/emails/${id}`);
    return response.data;
  },

  // Add / remove from favorites
  toggleFavorite: async (id) => {
    const response = await API.post(`/emails/${id}/favorite`);
    return response.data;
  },

  // Pin / unpin email
  togglePin: async (id) => {
    const response = await API.post(`/emails/${id}/pin`);
    return response.data;
  },

  // Get metrics and charts data
  getStatistics: async () => {
    const response = await API.get("/emails/statistics");
    return response.data;
  },

  // Update existing email content (saves local edits)
  updateEmail: async (id, data) => {
    const response = await API.put(`/emails/${id}`, data);
    return response.data;
  }
};

export default emailService;
