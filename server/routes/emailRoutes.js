import express from "express";
import {
  generateEmail,
  rewriteEmail,
  getEmails,
  deleteEmail,
  toggleFavorite,
  togglePin,
  getStatistics,
  updateEmail
} from "../controllers/emailController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all endpoints
router.use(authMiddleware);

router.post("/generate", generateEmail);
router.post("/:id/rewrite", rewriteEmail);
router.get("/", getEmails);
router.delete("/:id", deleteEmail);
router.post("/:id/favorite", toggleFavorite);
router.post("/:id/pin", togglePin);
router.get("/statistics", getStatistics);
router.put("/:id", updateEmail);

export default router;
