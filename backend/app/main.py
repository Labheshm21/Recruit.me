from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import hashlib
import os
import secrets
import datetime

# Add these Pydantic models for request/response
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

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    availability: Optional[str] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None
    resume_cv: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    availability: Optional[str] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None
    resume_cv: Optional[str] = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, '..', 'auth.db')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            first_name TEXT,
            last_name TEXT,
            email TEXT NOT NULL,
            phone TEXT,
            skills TEXT,
            experience TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            availability TEXT,
            linkedin_profile TEXT,
            github_profile TEXT,
            resume_cv TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id)
        )
    ''')
    
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
    conn.commit()
    conn.close()

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
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        
        if existing:
            # Return 400 with specific message instead of 500
            conn.close()
            raise HTTPException(status_code=400, detail="User Already Exists! Please, Try Again")
        
        password_hash = hash_password(user.password)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, password_hash)
        )
        user_id = cursor.lastrowid
        
        # Create empty profile for new user
        cursor.execute(
            """INSERT INTO user_profiles (user_id, email) 
               VALUES (?, ?)""",
            (user_id, user.email)
        )
        
        conn.commit()
        
        new_user = conn.execute(
            "SELECT id, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        
        return dict(new_user)
        
    except HTTPException:
        # Re-raise HTTP exceptions (like our 400 error)
        raise
    except Exception as e:
        # Only catch unexpected errors and return 500
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
        
        return {
            "message": "Login successful", 
            "user_id": db_user['id'],
            "email": db_user['email']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.get("/api/profile/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int):
    try:
        conn = get_db_connection()
        profile = conn.execute(
            """SELECT * FROM user_profiles WHERE user_id = ?""",
            (user_id,)
        ).fetchone()
        conn.close()
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return dict(profile)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.put("/api/profile/{user_id}")
def update_user_profile(user_id: int, profile: ProfileUpdate):
    try:
        conn = get_db_connection()
        
        # Check if user exists
        user = conn.execute(
            "SELECT id FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build update query dynamically based on provided fields
        update_fields = []
        values = []
        
        for field, value in profile.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ?")
                values.append(value)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at timestamp
        update_fields.append("updated_at = datetime('now')")
        
        values.append(user_id)
        
        query = f"""
            UPDATE user_profiles 
            SET {', '.join(update_fields)}
            WHERE user_id = ?
        """
        
        cursor = conn.cursor()
        cursor.execute(query, values)
        
        if cursor.rowcount == 0:
            # Profile doesn't exist, create one
            cursor.execute(
                """INSERT INTO user_profiles 
                   (user_id, email, first_name, last_name, phone, skills, experience, 
                    city, state, zip_code, availability, linkedin_profile, github_profile, resume_cv)
                   VALUES (?, (SELECT email FROM users WHERE id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, user_id, profile.first_name, profile.last_name, profile.phone,
                 profile.skills, profile.experience, profile.city, profile.state,
                 profile.zip_code, profile.availability, profile.linkedin_profile,
                 profile.github_profile, profile.resume_cv)
            )
        
        conn.commit()
        conn.close()
        
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    try:
        conn = get_db_connection()
        user = conn.execute(
            "SELECT id FROM users WHERE email = ?", (request.email,)
        ).fetchone()
        
        if not user:
            conn.close()
            return {"message": "If the email exists, a password reset link has been sent."}
        
        token = generate_reset_token()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+1 hour'))",
            (user['id'], token)
        )
        conn.commit()
        conn.close()
        
        return {"message": "If the email exists, a password reset link has been sent.", "token": token}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/reset-password")
def reset_password(request: ResetPasswordRequest):
    try:
        conn = get_db_connection()
        token_record = conn.execute(
            """SELECT * FROM password_reset_tokens 
               WHERE token = ? AND used = 0 AND expires_at > datetime('now')""",
            (request.token,)
        ).fetchone()
        
        if not token_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if new password is same as old password
        user = conn.execute(
            "SELECT hashed_password FROM users WHERE id = ?", (token_record['user_id'],)
        ).fetchone()
        
        if user:
            new_password_hash = hash_password(request.new_password)
            if user['hashed_password'] == new_password_hash:
                raise HTTPException(status_code=400, detail="New Password Cannot be Same As Old Password")
        
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE id = ?",
            (new_password_hash, token_record['user_id'])
        )
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
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)