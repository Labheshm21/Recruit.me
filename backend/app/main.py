from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import hashlib
import os
import secrets
import datetime
import re

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

# Authentication Models
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

# Profile Models
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

# Job Models
class Job(BaseModel):
    id: int
    title: str
    company: str
    location: str
    type: str
    skills_required: List[str]
    experience: str
    salary: str
    description: str
    responsibilities: List[str]
    requirements: List[str]
    posted_date: str

class JobSearchResponse(BaseModel):
    jobs: List[Job]
    total_jobs: int
    total_pages: int
    current_page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Sample Jobs Data
SAMPLE_JOBS = [
    # Page 1
    {
        "id": 1,
        "title": "Senior Backend Engineer",
        "company": "TechCorp Solutions",
        "location": "San Francisco, CA (Remote)",
        "type": "Full-time",
        "skills_required": ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
        "experience": "5+ years",
        "salary": "$140,000 - $180,000",
        "description": "We are looking for a Senior Backend Engineer to join our growing engineering team. You will be responsible for designing, building, and maintaining our core backend services.",
        "responsibilities": [
            "Design and develop scalable backend services",
            "Collaborate with frontend developers to integrate user-facing elements",
            "Optimize applications for maximum speed and scalability",
            "Implement security and data protection protocols"
        ],
        "requirements": [
            "Bachelor's degree in Computer Science or related field",
            "5+ years of experience in backend development",
            "Strong knowledge of Python and Django framework",
            "Experience with PostgreSQL and database design"
        ],
        "posted_date": "2024-01-15"
    },
    {
        "id": 2,
        "title": "Frontend Engineer",
        "company": "InnovateTech",
        "location": "New York, NY (Hybrid)",
        "type": "Full-time",
        "skills_required": ["JavaScript", "React", "TypeScript", "CSS", "Redux"],
        "experience": "3+ years",
        "salary": "$120,000 - $150,000",
        "description": "Join our frontend team to build beautiful, responsive user interfaces for our SaaS platform. You'll work closely with designers and backend engineers.",
        "responsibilities": [
            "Develop new user-facing features using React.js",
            "Build reusable components and front-end libraries",
            "Translate designs and wireframes into high-quality code",
            "Optimize components for maximum performance across browsers"
        ],
        "requirements": [
            "3+ years of experience in frontend development",
            "Proficiency in JavaScript, React, and TypeScript",
            "Experience with state management libraries (Redux)",
            "Knowledge of modern authorization mechanisms"
        ],
        "posted_date": "2024-01-14"
    },
    {
        "id": 3,
        "title": "Full Stack Developer",
        "company": "StartUp Ventures",
        "location": "Austin, TX (Remote)",
        "type": "Full-time",
        "skills_required": ["JavaScript", "Node.js", "React", "MongoDB", "Express"],
        "experience": "4+ years",
        "salary": "$130,000 - $160,000",
        "description": "We're seeking a versatile Full Stack Developer who can work across our entire technology stack and help us build amazing products.",
        "responsibilities": [
            "Develop both frontend and backend components",
            "Design and implement RESTful APIs",
            "Collaborate with cross-functional teams",
            "Participate in code reviews and technical discussions"
        ],
        "requirements": [
            "4+ years of full stack development experience",
            "Proficiency in Node.js and React",
            "Experience with MongoDB or similar NoSQL databases",
            "Knowledge of cloud platforms (AWS, Azure, or GCP)"
        ],
        "posted_date": "2024-01-13"
    },
    # Page 2
    {
        "id": 4,
        "title": "DevOps Engineer",
        "company": "CloudFirst Inc",
        "location": "Seattle, WA (Remote)",
        "type": "Full-time",
        "skills_required": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        "experience": "4+ years",
        "salary": "$135,000 - $170,000",
        "description": "Join our infrastructure team to build and maintain our cloud infrastructure and deployment pipelines.",
        "responsibilities": [
            "Design and maintain CI/CD pipelines",
            "Manage cloud infrastructure on AWS",
            "Implement monitoring and alerting systems",
            "Ensure system reliability and performance"
        ],
        "requirements": [
            "4+ years of DevOps or infrastructure experience",
            "Strong knowledge of AWS services",
            "Experience with containerization (Docker, Kubernetes)",
            "Proficiency in infrastructure as code (Terraform)"
        ],
        "posted_date": "2024-01-12"
    },
    {
        "id": 5,
        "title": "Data Scientist",
        "company": "DataInsights Corp",
        "location": "Boston, MA (Hybrid)",
        "type": "Full-time",
        "skills_required": ["Python", "Machine Learning", "SQL", "TensorFlow", "PyTorch"],
        "experience": "3+ years",
        "salary": "$125,000 - $155,000",
        "description": "Help us derive insights from data and build machine learning models that drive business decisions.",
        "responsibilities": [
            "Develop and implement machine learning models",
            "Analyze and interpret complex data sets",
            "Collaborate with product teams to define requirements",
            "Create data visualizations and reports"
        ],
        "requirements": [
            "Master's degree in Data Science, Statistics, or related field",
            "3+ years of experience in data science",
            "Proficiency in Python and ML libraries",
            "Experience with SQL and data visualization tools"
        ],
        "posted_date": "2024-01-11"
    },
    {
        "id": 6,
        "title": "Mobile App Developer",
        "company": "AppWorks Studio",
        "location": "Los Angeles, CA (Remote)",
        "type": "Full-time",
        "skills_required": ["React Native", "iOS", "Android", "JavaScript", "TypeScript"],
        "experience": "3+ years",
        "salary": "$115,000 - $145,000",
        "description": "Build amazing mobile experiences for both iOS and Android platforms using React Native.",
        "responsibilities": [
            "Develop cross-platform mobile applications",
            "Collaborate with UX/UI designers",
            "Optimize app performance and user experience",
            "Write clean, maintainable code"
        ],
        "requirements": [
            "3+ years of mobile development experience",
            "Proficiency in React Native",
            "Experience with both iOS and Android platforms",
            "Knowledge of mobile app design patterns"
        ],
        "posted_date": "2024-01-10"
    },
    # Page 3
    {
        "id": 7,
        "title": "QA Automation Engineer",
        "company": "QualityFirst Tech",
        "location": "Chicago, IL (Remote)",
        "type": "Full-time",
        "skills_required": ["Selenium", "Java", "TestNG", "JUnit", "API Testing"],
        "experience": "3+ years",
        "salary": "$95,000 - $125,000",
        "description": "Ensure the quality of our software products through automated testing and quality assurance processes.",
        "responsibilities": [
            "Develop and maintain automated test scripts",
            "Create test plans and test cases",
            "Perform API and integration testing",
            "Collaborate with development teams"
        ],
        "requirements": [
            "3+ years of QA automation experience",
            "Proficiency in Selenium and Java",
            "Experience with test frameworks (TestNG, JUnit)",
            "Knowledge of software testing methodologies"
        ],
        "posted_date": "2024-01-09"
    },
    {
        "id": 8,
        "title": "UX/UI Designer",
        "company": "DesignInnovate",
        "location": "Portland, OR (Hybrid)",
        "type": "Full-time",
        "skills_required": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping"],
        "experience": "4+ years",
        "salary": "$90,000 - $120,000",
        "description": "Create intuitive and beautiful user experiences for our digital products.",
        "responsibilities": [
            "Design user interfaces and experiences",
            "Create wireframes, prototypes, and mockups",
            "Conduct user research and testing",
            "Collaborate with product and engineering teams"
        ],
        "requirements": [
            "4+ years of UX/UI design experience",
            "Proficiency in design tools (Figma, Adobe XD)",
            "Strong portfolio demonstrating design skills",
            "Understanding of user-centered design principles"
        ],
        "posted_date": "2024-01-08"
    },
    {
        "id": 9,
        "title": "Product Manager",
        "company": "ProductLabs",
        "location": "Denver, CO (Remote)",
        "type": "Full-time",
        "skills_required": ["Product Strategy", "Agile", "Market Research", "Roadmapping", "Stakeholder Management"],
        "experience": "5+ years",
        "salary": "$130,000 - $160,000",
        "description": "Lead product development from conception to launch, working with cross-functional teams.",
        "responsibilities": [
            "Define product vision and strategy",
            "Create and maintain product roadmaps",
            "Gather and prioritize product requirements",
            "Work with engineering and design teams"
        ],
        "requirements": [
            "5+ years of product management experience",
            "Experience with Agile methodologies",
            "Strong analytical and problem-solving skills",
            "Excellent communication and leadership skills"
        ],
        "posted_date": "2024-01-07"
    },
    # Page 4
    {
        "id": 10,
        "title": "Security Engineer",
        "company": "SecureSystems",
        "location": "Washington, DC (Hybrid)",
        "type": "Full-time",
        "skills_required": ["Cybersecurity", "Network Security", "Python", "AWS Security", "Incident Response"],
        "experience": "4+ years",
        "salary": "$140,000 - $175,000",
        "description": "Protect our systems and data from security threats and ensure compliance with security standards.",
        "responsibilities": [
            "Implement security measures and controls",
            "Conduct security assessments and audits",
            "Monitor for security incidents",
            "Develop security policies and procedures"
        ],
        "requirements": [
            "4+ years of cybersecurity experience",
            "Knowledge of security frameworks and standards",
            "Experience with cloud security (AWS)",
            "Relevant certifications (CISSP, CISM) preferred"
        ],
        "posted_date": "2024-01-06"
    },
    {
        "id": 11,
        "title": "Database Administrator",
        "company": "DataSystems Pro",
        "location": "Atlanta, GA (Remote)",
        "type": "Full-time",
        "skills_required": ["SQL", "PostgreSQL", "MySQL", "Database Design", "Performance Tuning"],
        "experience": "4+ years",
        "salary": "$110,000 - $140,000",
        "description": "Manage and optimize our database systems to ensure high performance and availability.",
        "responsibilities": [
            "Design and maintain database systems",
            "Optimize database performance",
            "Implement backup and recovery strategies",
            "Ensure data security and integrity"
        ],
        "requirements": [
            "4+ years of database administration experience",
            "Proficiency in PostgreSQL and MySQL",
            "Knowledge of database design and normalization",
            "Experience with database performance tuning"
        ],
        "posted_date": "2024-01-05"
    },
    {
        "id": 12,
        "title": "Technical Lead",
        "company": "LeadTech Solutions",
        "location": "San Diego, CA (Hybrid)",
        "type": "Full-time",
        "skills_required": ["Java", "Spring Boot", "Microservices", "Team Leadership", "System Design"],
        "experience": "7+ years",
        "salary": "$150,000 - $190,000",
        "description": "Lead a team of developers and drive technical excellence in our software development practices.",
        "responsibilities": [
            "Lead and mentor development team",
            "Make technical decisions and set standards",
            "Design system architecture",
            "Coordinate with product and business stakeholders"
        ],
        "requirements": [
            "7+ years of software development experience",
            "2+ years in a technical leadership role",
            "Strong knowledge of Java and Spring Boot",
            "Experience with microservices architecture"
        ],
        "posted_date": "2024-01-04"
    },
    # Page 5
    {
        "id": 13,
        "title": "AI/ML Engineer",
        "company": "AIImpact Labs",
        "location": "Research Triangle, NC (Remote)",
        "type": "Full-time",
        "skills_required": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
        "experience": "3+ years",
        "salary": "$135,000 - $165,000",
        "description": "Develop and deploy machine learning models to solve complex business problems.",
        "responsibilities": [
            "Research and implement ML algorithms",
            "Train and optimize machine learning models",
            "Deploy models to production",
            "Collaborate with data scientists and engineers"
        ],
        "requirements": [
            "Master's or PhD in Computer Science or related field",
            "3+ years of ML engineering experience",
            "Proficiency in TensorFlow or PyTorch",
            "Experience with ML deployment and MLOps"
        ],
        "posted_date": "2024-01-03"
    },
    {
        "id": 14,
        "title": "Cloud Solutions Architect",
        "company": "CloudNative Inc",
        "location": "Dallas, TX (Remote)",
        "type": "Full-time",
        "skills_required": ["AWS", "Azure", "Cloud Architecture", "Kubernetes", "Terraform"],
        "experience": "6+ years",
        "salary": "$145,000 - $180,000",
        "description": "Design and implement cloud solutions that are scalable, secure, and cost-effective.",
        "responsibilities": [
            "Design cloud architecture solutions",
            "Provide technical guidance to teams",
            "Evaluate and recommend cloud technologies",
            "Ensure solutions meet security and compliance requirements"
        ],
        "requirements": [
            "6+ years of cloud architecture experience",
            "Expertise in AWS and/or Azure",
            "Relevant certifications (AWS Solutions Architect)",
            "Experience with containerization and orchestration"
        ],
        "posted_date": "2024-01-02"
    },
    {
        "id": 15,
        "title": "Scrum Master",
        "company": "AgileWorks",
        "location": "Phoenix, AZ (Remote)",
        "type": "Full-time",
        "skills_required": ["Scrum", "Agile", "JIRA", "Team Facilitation", "Project Management"],
        "experience": "4+ years",
        "salary": "$100,000 - $130,000",
        "description": "Facilitate Agile processes and help teams deliver high-quality software efficiently.",
        "responsibilities": [
            "Facilitate Scrum ceremonies",
            "Remove impediments for the team",
            "Coach team on Agile principles",
            "Track and report on team progress"
        ],
        "requirements": [
            "4+ years of experience as Scrum Master",
            "CSM or PSM certification",
            "Experience with Agile tools (JIRA)",
            "Excellent facilitation and communication skills"
        ],
        "posted_date": "2024-01-01"
    }
]

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
        # Validation checks
        if not profile.first_name or not profile.first_name.strip():
            raise HTTPException(status_code=400, detail="First name is required")
        
        if not profile.last_name or not profile.last_name.strip():
            raise HTTPException(status_code=400, detail="Last name is required")
        
        if not profile.phone or not profile.phone.strip():
            raise HTTPException(status_code=400, detail="Phone number is required")
        
        # Validate phone format
        digits = re.sub(r'\D', '', profile.phone)
        if len(digits) < 10:
            raise HTTPException(status_code=400, detail="Phone number must contain at least 10 digits")
        
        if not profile.skills or not profile.skills.strip():
            raise HTTPException(status_code=400, detail="Skills are required")

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
                values.append(value.strip() if isinstance(value, str) else value)
        
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

@app.get("/api/jobs", response_model=JobSearchResponse)
def search_jobs(search: str = None, page: int = 1, per_page: int = 3):
    try:
        # Filter jobs based on search query
        filtered_jobs = SAMPLE_JOBS
        if search:
            search_lower = search.lower()
            filtered_jobs = [
                job for job in SAMPLE_JOBS
                if (search_lower in job['title'].lower() or 
                    search_lower in job['company'].lower() or
                    any(search_lower in skill.lower() for skill in job['skills_required']))
            ]
        
        # Calculate pagination
        total_jobs = len(filtered_jobs)
        total_pages = (total_jobs + per_page - 1) // per_page
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        
        # Get jobs for current page
        paginated_jobs = filtered_jobs[start_index:end_index]
        
        return {
            "jobs": paginated_jobs,
            "total_jobs": total_jobs,
            "total_pages": total_pages,
            "current_page": page,
            "per_page": per_page,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

