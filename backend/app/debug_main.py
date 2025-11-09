from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import traceback
import os

print("🎯 DEBUG VERSION LOADED!")

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, '..', 'auth.db')
print(f"📁 Database path: {DATABASE_PATH}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    email: str
    password: str

def get_db_connection():
    print(f"🔄 Creating database connection to: {DATABASE_PATH}")
    conn = sqlite3.connect(DATABASE_PATH)
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
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    conn.commit()
    
    # Check what's in the database
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    print(f"📊 Tables in database: {[table['name'] for table in tables]}")
    
    users = conn.execute("SELECT * FROM users").fetchall()
    print(f"👥 Users in database: {len(users)}")
    for user in users:
        print(f"   - {dict(user)}")
    
    conn.close()
    print("✅ Database initialized")

# Initialize database on startup
print("🚀 Starting FastAPI server...")
init_db()

def hash_password(password: str) -> str:
    print(f"🔐 Hashing password (length: {len(password)})")
    return hashlib.sha256(password.encode()).hexdigest()

@app.get("/")
def root():
    return {"message": "Auth API is running"}

@app.post("/api/signup")
def signup(user: UserCreate):
    print(f"📝 Signup attempt for: {user.email}")
    try:
        conn = get_db_connection()
        print("✅ Database connected for signup")
        
        # Check if user exists
        print("🔍 Checking if user exists...")
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (user.email,)
        ).fetchone()
        
        if existing:
            print(f"❌ User already exists: {dict(existing)}")
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Hash password and insert
        print("🔐 Hashing password...")
        password_hash = hash_password(user.password)
        print(f"✅ Password hashed: {password_hash[:20]}...")
        
        print("💾 Inserting user into database...")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        print(f"✅ User inserted with ID: {user_id}")
        
        new_user = conn.execute(
            "SELECT id, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        conn.close()
        
        result = dict(new_user)
        print(f"✅ Signup successful: {result}")
        return result
        
    except HTTPException:
        print("❌ HTTPException raised")
        raise
    except Exception as e:
        print(f"💥 ERROR in signup: {str(e)}")
        print("🔍 Full traceback:")
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
            print("❌ User not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print("🔍 User found, verifying password...")
        password_hash = hash_password(user.password)
        if db_user['hashed_password'] != password_hash:
            print("❌ Password mismatch")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print("✅ Login successful")
        return {"message": "Login successful", "user_id": db_user['id']}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 ERROR in login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)