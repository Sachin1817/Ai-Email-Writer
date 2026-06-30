<div align="center">
  <div style="background-color: #4f46e5; display: inline-flex; border-radius: 20px; padding: 12px;">
    <h1 style="color: white; margin: 0; padding: 0 10px;">⚡ EmailAI: Advanced AI Writing Suite</h1>
  </div>
  <br />
  <p><b>Generate, refine, translate, and analyze professional emails with enterprise-grade AI.</b></p>
</div>

<br />

EmailAI is a full-stack AI-powered application designed to elevate your professional communication. It generates rich, structured emails, provides deep AI analysis on grammar, tone, and readability, and offers single-click quick actions to perfect your writing.

## ✨ Features

- **🧠 Intelligent Generation**: Generate emails instantly with structured outputs (Subject, Greeting, Body, Closing, Signature).
- **📊 AI Quality Metrics**: Real-time evaluation of grammar, tone match, readability, and professionalism (0-100 scores).
- **🌍 Multi-lingual Translation**: One-click translation to Spanish, French, German, Japanese, and more.
- **⚡ Quick Actions**: Shorten, expand, improve, or completely rewrite emails seamlessly.
- **📂 Email Management**: Save drafts, favorite templates, copy to clipboard, or export directly to PDF/Word/TXT.
- **📈 Advanced Analytics**: Track your weekly generation volume, aggregate quality scores, and tone distribution over time.

## 🛠️ Technology Stack

This project utilizes a modern Microservices architecture, split into three distinct applications:

### Frontend (Client)
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, Lucide Icons
- **State & Routing**: React Router DOM

### Backend (API Server)
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & Bcrypt

### AI Microservice
- **Environment**: Python (Flask)
- **AI Integration**: Groq API (Llama 3 / Mixtral Models)
- **Processing**: LangChain, Pydantic Structured Outputs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB connection string
- Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/Sachin1817/Ai-Email-Writer.git
cd Ai-Email-Writer
```

### 2. Setup the AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
# Create a .env file and add your GROQ_API_KEY
python app.py
```
*(Runs on port 5001)*

### 3. Setup the Node.js API Server
```bash
cd ../server
npm install
# Create a .env file and add your MONGO_URI and JWT_SECRET
npm run dev
```
*(Runs on port 5000)*

### 4. Setup the React Frontend
```bash
cd ../client
npm install
npm run dev
```
*(Runs on port 5173)*

## 🤝 Contributing
Contributions, issues and feature requests are welcome!

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
