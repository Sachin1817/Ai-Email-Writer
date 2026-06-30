import os
import json
import httpx
from groq import Groq

class GroqClient:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY", "")
        self.is_configured = bool(self.api_key and not self.api_key.startswith("gsk_your_groq_api_key"))
        
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
        self.is_gemini_configured = bool(self.gemini_api_key and not self.gemini_api_key.startswith("your_gemini_api_key"))
        
        if self.is_configured:
            try:
                self.client = Groq(api_key=self.api_key)
                print("Groq Client initialized successfully")
            except Exception as e:
                print(f"Error initializing Groq client: {e}")
                self.is_configured = False
                
        if not self.is_configured:
            if self.is_gemini_configured:
                print("Groq API Key missing or placeholder found. Operating with Gemini fallback.")
            else:
                print("Groq API Key missing or default placeholder found. Operating in simulated fallback mode.")

    def _call_gemini(self, prompt: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        response = httpx.post(url, json=payload, headers=headers, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned = text.strip()
        # Strip markdown code fences if present
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            # Remove opening fence line (e.g. ```json)
            lines = lines[1:] if lines[0].startswith("```") else lines
            # Remove closing fence line
            lines = lines[:-1] if lines and lines[-1].strip() == "```" else lines
            cleaned = "\n".join(lines).strip()
        return json.loads(cleaned)

    def _read_prompt(self, filename: str) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filepath = os.path.join(base_dir, "prompts", filename)
        with open(filepath, "r", encoding="utf-8") as file:
            return file.read()

    def _validate_quality(self, data: dict) -> bool:
        if not all(k in data for k in ["subject", "preview", "greeting", "body", "closing", "signature", "qualityMetrics"]):
            return False
        metrics = data.get("qualityMetrics", {})
        for key in ["grammar", "tone", "readability", "professionalism"]:
            score = metrics.get(key, 0)
            if not isinstance(score, (int, float)) or score < 70:
                return False
        return True

    def generate_email(self, recipient: str, content: str, tone: str, creativity: str) -> dict:
        prompt_template = self._read_prompt("generate.txt")
        system_prompt = prompt_template.format(
            recipient=recipient or "Recipient",
            content=content,
            tone=tone,
            creativity=creativity
        )

        last_error = None
        max_retries = 3

        for attempt in range(max_retries):
            if self.is_configured:
                try:
                    temp_map = {"PRECISE": 0.2, "BALANCED": 0.65, "CREATIVE": 0.95}
                    temperature = temp_map.get(creativity, 0.65)
                    completion = self.client.chat.completions.create(
                        messages=[
                            {"role": "user", "content": system_prompt}
                        ],
                        model="llama-3.3-70b-versatile",
                        temperature=temperature,
                        response_format={"type": "json_object"}
                    )
                    raw_response = completion.choices[0].message.content
                    parsed_json = json.loads(raw_response)
                    
                    if self._validate_quality(parsed_json) or attempt == max_retries - 1:
                        return parsed_json
                    else:
                        print(f"Validation failed on attempt {attempt+1}. Retrying...")
                        continue
                        
                except Exception as e:
                    print(f"Groq API error during generate (attempt {attempt+1}): {e}.")
                    last_error = e

            if self.is_gemini_configured:
                try:
                    parsed_json = self._call_gemini(system_prompt)
                    if self._validate_quality(parsed_json) or attempt == max_retries - 1:
                        return parsed_json
                    else:
                        print(f"Validation failed on Gemini attempt {attempt+1}. Retrying...")
                        continue
                except Exception as e:
                    print(f"Gemini API error during generate (attempt {attempt+1}): {e}.")
                    last_error = e

        if last_error:
            raise Exception(f"AI Generation failed after {max_retries} attempts: {str(last_error)}")
        raise Exception("AI API is not configured (missing GROQ_API_KEY and GEMINI_API_KEY)")

    def rewrite_email(self, content: str, action: str, additional_instructions: str, subject: str = "") -> dict:
        prompt_template = self._read_prompt("rewrite.txt")
        system_prompt = prompt_template.format(
            action=action,
            additional_instructions=additional_instructions or "None",
            content=content,
            subject=subject or "None"
        )

        last_error = None
        max_retries = 3

        for attempt in range(max_retries):
            if self.is_configured:
                try:
                    completion = self.client.chat.completions.create(
                        messages=[
                            {"role": "user", "content": system_prompt}
                        ],
                        model="llama-3.3-70b-versatile",
                        temperature=0.4,
                        response_format={"type": "json_object"}
                    )
                    raw_response = completion.choices[0].message.content
                    parsed_json = json.loads(raw_response)

                    if self._validate_quality(parsed_json) or attempt == max_retries - 1:
                        return parsed_json
                    else:
                        print(f"Validation failed on rewrite attempt {attempt+1}. Retrying...")
                        continue

                except Exception as e:
                    print(f"Groq API error during rewrite (attempt {attempt+1}): {e}.")
                    last_error = e

            if self.is_gemini_configured:
                try:
                    parsed_json = self._call_gemini(system_prompt)
                    if self._validate_quality(parsed_json) or attempt == max_retries - 1:
                        return parsed_json
                    else:
                        print(f"Validation failed on Gemini rewrite attempt {attempt+1}. Retrying...")
                        continue
                except Exception as e:
                    print(f"Gemini API error during rewrite (attempt {attempt+1}): {e}.")
                    last_error = e

        if last_error:
            raise Exception(f"AI Rewrite failed after {max_retries} attempts: {str(last_error)}")
        raise Exception("AI API is not configured (missing GROQ_API_KEY and GEMINI_API_KEY)")

    def _mock_generate(self, recipient: str, content: str, tone: str, creativity: str) -> dict:
        tone_upper = (tone or "PROFESSIONAL").upper()
        rec = recipient or "Partners"
        topic = content.split(".")[0][:40]
        
        if tone_upper == "FRIENDLY":
            subject = f"Hello from James - regarding {topic}"
            body = f"Hi {recipient or 'there'}!\n\nHope you're having a wonderful week! 😊\n\nI just wanted to drop a quick line to check in about: {content}.\n\nLet's catch up soon over a quick call!\n\nWarmly,\nJames"
        elif tone_upper == "CASUAL":
            subject = f"Quick update on {topic}"
            body = f"Hi {recipient or 'there'},\n\nHope you're doing well! Just wanted to reach out regarding: {content}.\n\nLet me know what you think when you get a chance, and we can chat more about it soon.\n\nTalk to you later,\nJames"
        elif tone_upper == "FORMAL":
            subject = f"Formal Proposal: {topic}"
            body = f"Dear {recipient or 'Sir/Madam'},\n\nI am writing to formally address the matter of: {content}.\n\nWe trust that our proposed approach aligns with your strategic objectives. Please review the attached points at your convenience.\n\nSincerely,\nJames"
        elif tone_upper == "PERSUASIVE":
            subject = f"Unlock new opportunities: {topic}"
            body = f"Dear {rec},\n\nWe have a unique opportunity to drive substantial value regarding: {content}.\n\nBy leveraging our combined strengths, we can optimize operations and accelerate our growth path. Let's set up a call to explore how we can make this happen.\n\nBest regards,\nJames"
        elif tone_upper == "CONFIDENT":
            subject = f"Proposal: {topic}"
            body = f"Dear {rec},\n\nI am writing to outline our concrete plan regarding: {content}.\n\nOur team is fully prepared to deliver top-tier results and exceed expectations. I am certain we can establish a seamless execution process. Let's schedule a call to finalize the next steps.\n\nBest regards,\nJames"
        elif tone_upper == "EMPATHETIC":
            subject = f"Supporting you on {topic}"
            body = f"Dear {rec},\n\nI completely understand the challenges you are facing regarding: {content}.\n\nPlease know that we are here to support you in any way possible, and we want to ensure this transition is as smooth and stress-free as possible. Let know how we can best help.\n\nWarmly,\nJames"
        elif tone_upper == "APOLOGETIC":
            subject = f"Sincere apologies regarding {topic}"
            body = f"Dear {rec},\n\nWe sincerely apologize for any inconvenience caused regarding: {content}.\n\nWe take full responsibility and are implementing immediate measures to prevent this from happening in the future. Thank you for your patience and understanding.\n\nSincerely,\nJames"
        elif tone_upper == "APPRECIATIVE":
            subject = f"Sincere thanks for {topic}"
            body = f"Dear {rec},\n\nI wanted to express my sincere appreciation for your partnership and efforts regarding: {content}.\n\nYour dedication has been instrumental, and we are truly grateful for our collaboration. Thank you once again for your support.\n\nBest regards,\nJames"
        elif tone_upper == "URGENT":
            subject = f"URGENT: Actions required on {topic}"
            body = f"Dear {rec},\n\nThis is a time-sensitive update regarding: {content}.\n\nPlease review this immediately and provide your feedback as soon as possible so we can proceed without further delays.\n\nBest,\nJames"
        else:
            subject = f"Strategic Proposal for {recipient or 'Partnership'}"
            body = f"Dear {rec},\n\nI hope this email finds you well.\n\nFollowing up on our discussions, I am writing to highlight: {content}.\n\nLet's schedule a call to discuss synergies.\n\nBest regards,\nJames"
            
        return {"subject": subject, "content": body}

    def _append_before_signature(self, content: str, addition: str) -> str:
        sign_offs = [
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
        ]
        import re
        for sign_off in sign_offs:
            pattern = re.compile(rf"(^|\n)({re.escape(sign_off)}[\s,]*\n)", re.IGNORECASE)
            match = pattern.search(content)
            if match:
                index = match.start()
                prefix = content[:index]
                suffix = content[index:]
                return prefix.rstrip() + "\n\n" + addition.strip() + "\n\n" + suffix.strip()
        return content.rstrip() + "\n\n" + addition.strip()

    def _mock_rewrite(self, content: str, action: str, additional_instructions: str, subject: str = "") -> dict:
        action_upper = action.upper()
        body = content
        
        if action_upper == "SHORTEN":
            sentences = [s.strip() for s in content.split(".") if s.strip()]
            if len(sentences) > 2:
                body = ". ".join(sentences[:2]) + f".\n\nLooking forward to your response.\n\nBest regards,\nJames"
            else:
                body = content + f"\n\nRegards,\nJames"
        elif action_upper == "EXPAND":
            expansion = ""
            if "Furthermore, we would be pleased to schedule" in content:
                if "Additionally, to ensure all alignment" in content:
                    if "In preparation for our first session" in content:
                        expansion = "" # Already fully expanded in mock mode
                    else:
                        expansion = (
                            "In preparation for our first session, we will share a detailed project plan outlining "
                            "key milestones, dependencies, and resource allocations."
                        )
                else:
                    expansion = (
                        "Additionally, to ensure all alignment on the timeline, we propose setting up weekly progress updates. "
                        "Our technical leads are ready to collaborate directly with your team starting next Monday."
                    )
            else:
                expansion = (
                    "Furthermore, we would be pleased to schedule a comprehensive walkthrough of the draft proposals "
                    "to address any structural adjustments you deem necessary. We remain committed to facilitating a "
                    "seamless integration process and look forward to collaborating closely on this initiative."
                )
            body = self._append_before_signature(content, expansion) if expansion else content
        elif action_upper == "TRANSLATE":
            lang = additional_instructions or "Spanish"
            if "spanish" in lang.lower():
                body = f"Estimados,\n\nCon respecto a su mensaje:\n\n{content}\n\nQuedamos a su disposición.\n\nSaludos cordiales."
            elif "french" in lang.lower():
                body = f"Bonjour,\n\nConcernant votre message:\n\n{content}\n\nNous restons à votre disposition.\n\nCordialement."
            else:
                body = f"[{lang} Translation]\n\n{content}"
        elif action_upper == "IMPROVE":
            replacements = {
                "I am writing to": "I would like to",
                "I'm writing to": "I would like to",
                "want to": "wish to",
                "need to": "require to",
                "give me": "provide me with",
                "thanks": "thank you",
                "tell me": "inform me",
                "ASAP": "at your earliest convenience",
                "sorry": "we apologize",
                "please check": "please review"
            }
            body = content
            import re
            for old, new in replacements.items():
                compiled = re.compile(re.escape(old), re.IGNORECASE)
                body = compiled.sub(new, body)
            
            if body == content:
                if "We appreciate your consideration of these points" in content:
                    improvement = "Please let us know if you require any further modifications."
                else:
                    improvement = "We appreciate your consideration of these points and look forward to working together."
                body = self._append_before_signature(content, improvement)
                
        return {"subject": subject or "Updated Email Draft", "content": body}
