from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
        
class JobApplicationBase(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    status: str
    applied_date: str
    withdrawn_date: Optional[str]
    job_title: str
    company: str

    class Config:
        from_attributes = True

class ApplicationStatus(BaseModel):
    has_applied: bool
    application_status: Optional[str]
    can_reapply: bool
    application_id: Optional[int]

class WithdrawRequest(BaseModel):
    application_id: int