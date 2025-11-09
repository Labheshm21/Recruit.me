from functools import lru_cache
from typing import List, Optional

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    cognito_region: str = Field(validation_alias=AliasChoices("COGNITO_REGION"))
    cognito_user_pool_id: str = Field(validation_alias=AliasChoices("COGNITO_USER_POOL_ID"))
    cognito_app_client_id: str = Field(validation_alias=AliasChoices("COGNITO_APP_CLIENT_ID"))
    cognito_app_client_secret: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("COGNITO_APP_CLIENT_SECRET"),
    )
    cognito_auto_confirm: bool = Field(
        default=False,
        validation_alias=AliasChoices("COGNITO_AUTO_CONFIRM"),
    )
    jwks_cache_ttl_seconds: int = Field(
        default=3600,
        validation_alias=AliasChoices("COGNITO_JWKS_CACHE_TTL"),
    )

    api_allowed_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("API_ALLOWED_ORIGINS"),
    )

    @property
    def allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.api_allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
