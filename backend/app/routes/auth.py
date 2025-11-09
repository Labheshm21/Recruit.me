from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies.auth import get_current_claims
from ..schemas import (
    ClaimsResponse,
    ConfirmForgotPasswordRequest,
    ConfirmSignupRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    ResendConfirmationRequest,
    SignupRequest,
    TokenBundle,
)
from ..services import cognito

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: SignupRequest):
    try:
        cognito.sign_up(payload.email, payload.password)
        return {"status": "ok"}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/confirm-signup")
def confirm(payload: ConfirmSignupRequest):
    cognito.confirm_sign_up(payload.email, payload.code)
    return {"status": "ok"}


@router.post("/resend-confirmation")
def resend(payload: ResendConfirmationRequest):
    cognito.resend_confirmation(payload.email)
    return {"status": "ok"}


@router.post("/login")
def login(payload: LoginRequest):
    resp = cognito.initiate_auth(payload.email, payload.password)
    if "ChallengeName" in resp:  # e.g., NEW_PASSWORD_REQUIRED
        return {"challenge": resp["ChallengeName"], "session": resp.get("Session"), "email": payload.email}
    ar = resp.get("AuthenticationResult", {}) or {}
    return {
        "accessToken": ar.get("AccessToken", ""),
        "idToken": ar.get("IdToken", ""),
        "refreshToken": ar.get("RefreshToken", ""),
        "tokenType": ar.get("TokenType", ""),
        "expiresIn": ar.get("ExpiresIn", 0),
    }

@router.post("/complete-new-password")
def complete_new_password(payload: dict):
    resp = cognito.respond_to_new_password_challenge(
        email=payload["email"],
        new_password=payload["new_password"],
        session=payload["session"],
    )
    ar = resp.get("AuthenticationResult", {}) or {}
    return {
        "accessToken": ar.get("AccessToken", ""),
        "idToken": ar.get("IdToken", ""),
        "refreshToken": ar.get("RefreshToken", ""),
        "tokenType": ar.get("TokenType", ""),
        "expiresIn": ar.get("ExpiresIn", 0),
    }



@router.post("/refresh", response_model=TokenBundle)
def refresh(payload: RefreshRequest):
    response = cognito.refresh_tokens(payload.refresh_token, payload.email)
    result = response.get("AuthenticationResult", {}) or {}
    return TokenBundle(
        accessToken=result.get("AccessToken", ""),
        idToken=result.get("IdToken", ""),
        refreshToken=result.get("RefreshToken", ""),
        tokenType=result.get("TokenType", ""),
        expiresIn=result.get("ExpiresIn", 0),
    )


@router.post("/forgot-password")
def forgot(payload: ForgotPasswordRequest):
    cognito.forgot_password(payload.email)
    return {"status": "code_sent"}


@router.post("/forgot-password/confirm")
def forgot_confirm(payload: ConfirmForgotPasswordRequest):
    cognito.confirm_forgot_password(payload.email, payload.code, payload.new_password)
    return {"status": "password_reset"}


@router.get("/me", response_model=ClaimsResponse)
def me(claims: dict = Depends(get_current_claims)):
    return ClaimsResponse(
        sub=claims.get("sub", ""),
        email=claims.get("email"),
        groups=claims.get("cognito:groups"),
    )
