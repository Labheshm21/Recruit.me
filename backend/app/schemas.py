from typing import List, Optional

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class ConfirmSignupRequest(BaseModel):
    email: EmailStr
    code: str


class ResendConfirmationRequest(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str
    email: Optional[EmailStr] = None  # only needed if client secret enabled


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ConfirmForgotPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class TokenBundle(BaseModel):
    accessToken: str
    idToken: str
    refreshToken: str
    tokenType: str
    expiresIn: int


class ClaimsResponse(BaseModel):
    sub: str
    email: Optional[EmailStr] = None
    groups: Optional[List[str]] = None
