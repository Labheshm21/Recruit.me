# Recruit.me 

## 🛠 Tech Stack

**Frontend:**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: JavaScript (React)

**Backend:**
- **Framework**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: Custom secure hashing

## 📁 Project Structure

```
Recruit.me/
├── 📂 backend/                 # FastAPI Backend
│   ├── 📂 app/
│   │   └── 🐍 main.py         # Main application file
│   ├── 📄 requirements.txt    # Python dependencies
│   └── 🗃️ auth.db            # SQLite database
├── 📂 frontend/               # Next.js Frontend
│   ├── 📂 app/
│   │   ├── 📄 layout.js       # Root layout
│   │   ├── 📂 login/         
│   │   ├── 📂 signup/        
│   │   ├── 📂 forgot-password/
│   │   ├── 📂 reset-password/
│   │   └── 📂 components/
│   ├── 📄 package.json       # Node.js dependencies
│   └── ⚙️ next.config.js     # Next.js configuration
└── 📄 README.md             # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```
   🌐 **API Server**: http://localhost:8001  

### Frontend Setup

1. **Open new terminal and navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   🌐 **Application**: http://localhost:3000

## 🔄 Workflow

1. **User Registration** → Email validation → Account creation
2. **User Login** → Credential verification → Session management
3. **Password Reset** → Token generation → Secure password update
4. **Error Handling** → User-friendly messages → Secure error responses
