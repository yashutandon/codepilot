# 🚀 CodePilot

**CodePilot** is a **browser-based, AI-powered IDE** designed to deliver a modern, intelligent coding experience directly in the browser — with real-time collaboration, AI assistance, and in-browser code execution.

🔗 **Live Demo:** https://codepilot.yashutandon.in  

---

## 🧠 What We're Building

CodePilot is a modern web-based IDE featuring:

- 🤝 Real-time collaborative code editing  
- 🤖 AI-powered code suggestions and quick edits  
- 💬 Conversation-based AI coding assistant  
- 🖥️ In-browser code execution using WebContainer  
- 🔄 GitHub import & export integration  
- 🗂️ Multi-file project management  

---

## 🛠️ Tech Stack

### Frontend
- Next.js 16  
- React 19  
- TypeScript  
- Tailwind CSS 4  

### Code Editor
- CodeMirror 6  
- Custom editor extensions  
- One Dark theme  

### Backend & Infrastructure
- Convex (Real-time Database)  
- Inngest (Background Jobs)  

### AI
- OpenAI,Claude (preferred)  
- Gemini 2.0 Flash (free-tier alternative)  

### Authentication
- Clerk  
- GitHub OAuth  

### Code Execution & Terminal
- WebContainer API  
- xterm.js  

### UI & Design System
- shadcn/ui  
- Radix UI  

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yashutandon/codepilot.git
cd codepilot
```
### 2️⃣ Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```
### 3️⃣ Environment Variables
Create a .env.local file:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

OPENAI_API_KEY=
# or
GEMINI_API_KEY=

CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```
###4️⃣ Run the Development Server
```bash
npm run dev
