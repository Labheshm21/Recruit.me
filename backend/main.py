# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import traceback

app = FastAPI()

# ✅ CORS FIX — include all necessary permissions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],
)

# ---------- DATABASE SETUP ----------
def get_db_connection():
    print("🔄 Creating database connection...")
    conn = sqlite3.connect('auth.db')
    conn.row_factory = sqlite3.Row
    print("✅ Database connection created")
    return conn

def init_db():
    print("🔄 Initializing database...")
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            company_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    conn.commit()
    conn.close()
    print("✅ Database initialized")

# Run on startup
print("🚀 Starting FastAPI server...")
init_db()


# ---------- MODELS ----------
class UserCreate(BaseModel):
    email: str
    password: str

class Job(BaseModel):
    title: str
    description: str
    location: str
    company_name: str | None = None


# ---------- HELPERS ----------
def hash_password(password: str) -> str:
    print(f"🔐 Hashing password (length: {len(password)})")
    return hashlib.sha256(password.encode()).hexdigest()


# ---------- ROUTES ----------
@app.get("/")
def root():
    return {"message": "Recruit.me API is running"}


# ---- AUTH ROUTES ----
@app.post("/api/signup")
def signup(user: UserCreate):
    print(f"📝 Signup attempt for: {user.email}")
    try:
        conn = get_db_connection()
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        if existing:
            print("❌ User already exists")
            raise HTTPException(status_code=400, detail="Email already exists")

        password_hash = hash_password(user.password)
        conn.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, password_hash)
        )
        conn.commit()
        conn.close()
        print("✅ Signup successful")
        return {"message": "User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/api/login")
def login(user: UserCreate):
    print(f"🔐 Login attempt for: {user.email}")
    try:
        conn = get_db_connection()
        db_user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        conn.close()

        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        password_hash = hash_password(user.password)
        if db_user['hashed_password'] != password_hash:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        print("✅ Login successful")
        return {"message": "Login successful", "user_id": db_user['id']}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ---- COMPANY JOB ROUTES ----
@app.get("/api/jobs")
def get_jobs():
    try:
        conn = get_db_connection()
        jobs = conn.execute("SELECT * FROM jobs").fetchall()
        conn.close()
        return {"jobs": [dict(j) for j in jobs]}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error fetching jobs")


@app.post("/api/jobs")
def create_job(job: Job):
    print(f"🏢 Creating new job: {job.title}")
    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO jobs (title, description, location, company_name) VALUES (?, ?, ?, ?)",
            (job.title, job.description, job.location, job.company_name),
        )
        conn.commit()
        conn.close()
        print("✅ Job created successfully")
        return {"message": "Job added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ---------- ENTRY POINT ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
