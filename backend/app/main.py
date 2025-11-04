from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import os
import secrets
import datetime

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, '..', 'auth.db')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    
    # Jobs table
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
    
    # Password reset tokens table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at)')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_reset_token():
    return secrets.token_urlsafe(32)

@app.get("/")
def root():
    return {"message": "Auth API is running"}

@app.post("/api/signup", response_model=UserResponse)
def signup(user: UserCreate):
    try:
        conn = get_db_connection()
        
        # Check if user exists
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Hash password and insert
        password_hash = hash_password(user.password)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        
        new_user = conn.execute(
            "SELECT id, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        
        return dict(new_user)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/login")
def login(user: UserCreate):
    try:
        conn = get_db_connection()
        db_user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        conn.close()
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Incorrect Credentials, Try Again")
        
        password_hash = hash_password(user.password)
        if db_user['hashed_password'] != password_hash:
            raise HTTPException(status_code=401, detail="Incorrect Credentials, Try Again")
        
        return {"message": "Login successful", "user_id": db_user['id']}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        conn = get_db_connection()
        
        # Check if user exists
        user = conn.execute(
            "SELECT id FROM users WHERE email = ?", (request.email,)
        ).fetchone()
        
        if not user:
            # Don't reveal whether email exists or not for security
            conn.close()
            return {"message": "If the email exists, a password reset link has been sent."}
        
        # Generate reset token
        token = generate_reset_token()
        # Use UTC time for consistency with SQLite's datetime('now')
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        
        # Store token in database
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
            (user['id'], token, expires_at)
        )
        conn.commit()
        conn.close()
        
        # In a real application, you would send an email with the reset link
        # For now, we'll return the token (in production, remove this!)
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        print(f"🔗 Password reset link for {request.email}: {reset_link}")
        print(f"⏰ Token expires at (UTC): {expires_at}")
        
        return {"message": "If the email exists, a password reset link has been sent.", "token": token}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        conn = get_db_connection()
        
        # Debug: Print the token we're looking for
        print(f"🔍 Looking for token: {request.token}")
        
        # Find valid, unused token
        token_record = conn.execute(
            """SELECT * FROM password_reset_tokens 
               WHERE token = ? AND used = 0 AND expires_at > datetime('now')""",
            (request.token,)
        ).fetchone()
        
        # Debug: Check what we found
        if token_record:
            print(f"✅ Token found: {dict(token_record)}")
            print(f"⏰ Token expires at: {token_record['expires_at']}")
            print(f"⏰ Current time: {datetime.datetime.now()}")
        else:
            print("❌ Token not found or invalid")
            # Let's check why it's not found
            # Check if token exists but is used
            used_token = conn.execute(
                "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 1",
                (request.token,)
            ).fetchone()
            if used_token:
                print("❌ Token exists but is already used")
            
            # Check if token exists but expired
            expired_token = conn.execute(
                "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at <= datetime('now')",
                (request.token,)
            ).fetchone()
            if expired_token:
                print(f"❌ Token exists but expired at: {expired_token['expires_at']}")
            
            # Check if token doesn't exist at all
            any_token = conn.execute(
                "SELECT * FROM password_reset_tokens WHERE token = ?",
                (request.token,)
            ).fetchone()
            if not any_token:
                print("❌ Token doesn't exist in database")
        
        if not token_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Update user's password
        new_password_hash = hash_password(request.new_password)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE id = ?",
            (new_password_hash, token_record['user_id'])
        )
        
        # Mark token as used
        cursor.execute(
            "UPDATE password_reset_tokens SET used = 1 WHERE id = ?",
            (token_record['id'],)
        )
        
        conn.commit()
        conn.close()
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error in reset_password: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ---- JOB ROUTES ----
class Job(BaseModel):
    title: str
    description: str
    location: str
    company_name: str | None = None


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
        print(f"💥 Error fetching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching jobs")


@app.post("/api/jobs")
def create_job(job: Job):
    print(f"🏢 Creating new job: {job.title}")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO jobs (title, description, location, company_name) VALUES (?, ?, ?, ?)",
            (job.title, job.description, job.location, job.company_name),
        )
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        print("✅ Job created successfully")
        return {"message": "Job added successfully", "id": job_id}
    except Exception as e:
        print(f"💥 Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)