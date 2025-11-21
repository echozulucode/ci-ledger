"""
Application configuration using Pydantic BaseSettings.
All configuration is loaded from environment variables or .env file.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "CI Ledger"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-use-openssl-rand-hex-32",
        description="Secret key for JWT signing"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS
    
    # LDAP Configuration
    LDAP_ENABLED: bool = False
    LDAP_SERVER: Optional[str] = None
    LDAP_PORT: int = 389
    LDAP_USE_SSL: bool = False
    LDAP_BIND_DN: Optional[str] = None
    LDAP_BIND_PASSWORD: Optional[str] = None
    LDAP_SEARCH_BASE: Optional[str] = None
    LDAP_USE_NTLM: bool = False  # Use NTLM authentication (for Windows AD)
    LDAP_TIMEOUT: int = 10  # Connection timeout in seconds
    LDAP_USER_SEARCH_FILTER: str = "(sAMAccountName={username})"
    LDAP_GROUP_SEARCH_FILTER: str = "(member={user_dn})"
    LDAP_ADMIN_GROUPS: str = ""  # Comma-separated list of admin groups
    LDAP_ALLOWED_GROUPS: str = ""  # Comma-separated list of allowed groups (empty = all)
    
    # Email Configuration
    SMTP_ENABLED: bool = False
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: Optional[str] = None
    
    # First superuser
    FIRST_SUPERUSER_EMAIL: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"
    
    # Dev helpers
    SEED_SAMPLE_DATA: bool = False
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


# Create settings instance
settings = Settings()
