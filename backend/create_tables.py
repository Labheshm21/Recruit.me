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
    
    # Create index on email
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    
    # Commit and close
    conn.commit()
    conn.close()
    
    print("✅ Users table created successfully!")

if __name__ == "__main__":
    create_tables()