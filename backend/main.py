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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001"
    ],  # frontend URLs
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
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        
        # Fetch the created user
        new_user = conn.execute(
            "SELECT id, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        print("✅ Signup successful")
        return {"id": new_user['id'], "email": new_user['email']}

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
        return {"message": "Login successful", "user_id": db_user['id'], "email": db_user['email']}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ---- COMPANY JOB ROUTES ----
@app.get("/api/jobs")
def get_jobs(search: str = "", page: int = 1, per_page: int = 10):
    try:
        conn = get_db_connection()
        
        # Build query with search filter
        if search:
            query = """
                SELECT * FROM jobs 
                WHERE title LIKE ? OR description LIKE ? OR location LIKE ? OR company_name LIKE ?
                ORDER BY created_at DESC
            """
            search_pattern = f"%{search}%"
            jobs = conn.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern)).fetchall()
        else:
            jobs = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
        
        # Calculate pagination
        total_jobs = len(jobs)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_jobs = jobs[start_idx:end_idx]
        
        conn.close()
        
        return {
            "jobs": [dict(j) for j in paginated_jobs],
            "total": total_jobs,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_jobs + per_page - 1) // per_page
        }
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
