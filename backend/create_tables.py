import sqlite3

def create_tables():
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create job_applications table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        status TEXT DEFAULT 'applied',
        applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        withdrawn_date DATETIME NULL,
        cover_letter TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, job_id)
    )
    ''')
    
    # Create index on email
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    
    # Commit and close
    conn.commit()
    conn.close()
    
    print("✅ Users and job_applications tables created successfully!")

if __name__ == "__main__":
    create_tables()