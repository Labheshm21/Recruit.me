import base64
import hashlib
import hmac
from time import time
from typing import Dict, Optional

import boto3
import requests
from botocore.exceptions import ClientError
from jose import jwt

from ..core.config import get_settings

settings = get_settings()
_cognito = boto3.client("cognito-idp", region_name=settings.cognito_region)

ISS = f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/{settings.cognito_user_pool_id}"
JWKS_URL = f"{ISS}/.well-known/jwks.json"

_jwks_cache = {"exp": 0.0, "keys": None}


def _secret_hash(username: str) -> Optional[str]:
    if not settings.cognito_app_client_secret:
        return None
    msg = (username + settings.cognito_app_client_id).encode()
    dig = hmac.new(settings.cognito_app_client_secret.encode(), msg, hashlib.sha256).digest()
    return base64.b64encode(dig).decode()


def _get_jwks() -> Dict:
    now = time()
    if _jwks_cache["exp"] <= now:
        resp = requests.get(JWKS_URL, timeout=10)
        resp.raise_for_status()
        _jwks_cache["keys"] = resp.json()
        _jwks_cache["exp"] = now + int(settings.jwks_cache_ttl_seconds)
    return _jwks_cache["keys"]


def sign_up(email: str, password: str):
    params = {
        "ClientId": settings.cognito_app_client_id,
        "Username": email,
        "Password": password,
        "UserAttributes": [{"Name": "email", "Value": email}],
    }
    sh = _secret_hash(email)
    if sh:
        params["SecretHash"] = sh
    return _cognito.sign_up(**params)


def confirm_sign_up(email: str, code: str):
    params = {"ClientId": settings.cognito_app_client_id, "Username": email, "ConfirmationCode": code}
    sh = _secret_hash(email)
    if sh:
        params["SecretHash"] = sh
    return _cognito.confirm_sign_up(**params)


def resend_confirmation(email: str):
    params = {"ClientId": settings.cognito_app_client_id, "Username": email}
    sh = _secret_hash(email)
    if sh:
        params["SecretHash"] = sh
    return _cognito.resend_confirmation_code(**params)


def initiate_auth(email: str, password: str):
    auth_params = {"USERNAME": email, "PASSWORD": password}
    sh = _secret_hash(email)
    if sh:
        auth_params["SECRET_HASH"] = sh
    return _cognito.initiate_auth(
        ClientId=settings.cognito_app_client_id,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters=auth_params,
    )

def respond_to_new_password_challenge(email: str, new_password: str, session: str):
    auth_params = {"USERNAME": email, "NEW_PASSWORD": new_password}
    sh = _secret_hash(email)
    if sh:
        auth_params["SECRET_HASH"] = sh
    return _cognito.respond_to_auth_challenge(
        ClientId=settings.cognito_app_client_id,
        ChallengeName="NEW_PASSWORD_REQUIRED",
        Session=session,
        ChallengeResponses=auth_params,
    )



def refresh_tokens(refresh_token: str, email: Optional[str] = None):
    auth_params = {"REFRESH_TOKEN": refresh_token}
    sh = _secret_hash(email or "")
    if sh and email:
        auth_params["SECRET_HASH"] = sh
    return _cognito.initiate_auth(
        ClientId=settings.cognito_app_client_id,
        AuthFlow="REFRESH_TOKEN_AUTH",
        AuthParameters=auth_params,
    )


def forgot_password(email: str):
    params = {"ClientId": settings.cognito_app_client_id, "Username": email}
    sh = _secret_hash(email)
    if sh:
        params["SecretHash"] = sh
    return _cognito.forgot_password(**params)


def confirm_forgot_password(email: str, code: str, new_password: str):
    params = {
        "ClientId": settings.cognito_app_client_id,
        "Username": email,
        "ConfirmationCode": code,
        "Password": new_password,
    }
    sh = _secret_hash(email)
    if sh:
        params["SecretHash"] = sh
    return _cognito.confirm_forgot_password(**params)


def verify_access_token(token: str) -> Dict:
    jwks = _get_jwks()
    claims = jwt.get_unverified_claims(token)
    if claims.get("token_use") != "access":
        raise ValueError("Wrong token type")
    return jwt.decode(
        token,
        jwks,
        options={"verify_aud": True, "verify_at_hash": False},
        audience=settings.cognito_app_client_id,
        issuer=ISS,
        algorithms=["RS256"],
    )
