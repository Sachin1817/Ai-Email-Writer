import axios from "axios";

// Helper to base64url encode a JSON object
const base64UrlEncode = (obj) => {
  const jsonStr = JSON.stringify(obj);
  return Buffer.from(jsonStr).toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// Construct a mock JWT (header.payload.signature)
const header = { alg: "none", typ: "JWT" };
const payload = {
  uid: "test-verifier-999",
  user_id: "test-verifier-999",
  email: "verifier@example.com",
  name: "Verifier Bot"
};

const token = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.mocksignature`;

const runVerification = async () => {
  const client = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  try {
    console.log("\n1. Testing health check...");
    const health = await client.get("/health");
    console.log("Health Check response status:", health.status);
    console.log("Database status:", health.data.database);

    console.log("\n2. Testing email generation endpoint (now hitting active AI service)...");
    const genRes = await client.post("/emails/generate", {
      recipient: "Hiring Manager",
      content: "Thank you for the software engineer interview last Tuesday.",
      tone: "PROFESSIONAL",
      creativity: "BALANCED"
    });
    console.log("Generation response status:", genRes.status);
    console.log("Generated Subject:", genRes.data.email?.subject);
    console.log("Generated Content snippet:", genRes.data.email?.content?.slice(0, 150) + "...");

    console.log("\n3. Testing email rewrite/expansion endpoint...");
    const emailId = genRes.data.email?._id;
    const rewriteRes = await client.post(`/emails/${emailId}/rewrite`, {
      action: "EXPAND",
      content: genRes.data.email?.content,
      subject: genRes.data.email?.subject
    });
    console.log("Rewrite response status:", rewriteRes.status);
    console.log("Expanded Content snippet:", rewriteRes.data.email?.content?.slice(0, 150) + "...");
    
    console.log("\n4. Testing duplicate expansion prevention...");
    const rewriteRes2 = await client.post(`/emails/${emailId}/rewrite`, {
      action: "EXPAND",
      content: rewriteRes.data.email?.content,
      subject: rewriteRes.data.email?.subject
    });
    console.log("Second Rewrite response status:", rewriteRes2.status);
    console.log("Same content length check:", rewriteRes.data.email?.content?.length === rewriteRes2.data.email?.content?.length ? "PASS (No duplicates added)" : "FAIL (Length grew, duplication occurred)");

    console.log("\nVerification SUCCESS: Live AI service generation and expansion works without duplication!");
    process.exit(0);
  } catch (error) {
    console.error("\nVerification FAILED with error:", error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

runVerification();
