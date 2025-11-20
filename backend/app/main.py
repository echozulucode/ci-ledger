"""
FastAPI Intranet Demo - Main Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.api import auth, users, tokens, items, events, agents, tools, toolchains, tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: Create database tables
    create_db_and_tables()
    
    # Create initial admin user if it doesn't exist
    from app.core.database import get_session
    from app.crud import user as crud_user
    from app.models.user import UserCreate
    
    session = next(get_session())
    admin = crud_user.get_user_by_email(session, settings.FIRST_SUPERUSER_EMAIL)
    if not admin:
        admin_create = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name="Admin User",
            is_admin=True,
            is_active=True
        )
        crud_user.create_user(session, admin_create)
        print(f"✅ Created admin user: {settings.FIRST_SUPERUSER_EMAIL}")
    
    yield
    
    # Shutdown: cleanup if needed


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## FastAPI Intranet Demo Application
    
    A production-ready, full-stack intranet web application showcasing enterprise features.
    
    ### Features
    
    * **Authentication**: JWT-based authentication with username/password
    * **User Management**: Complete user CRUD operations with role-based access control
    * **Personal Access Tokens**: API token generation and management
    * **Sample CRUD**: Items/Projects management demonstrating ownership-based access
    * **Security**: Argon2 password hashing, RBAC, input validation
    
    ### Authentication
    
    Most endpoints require authentication. Use one of the following methods:
    
    1. **JWT Token** (OAuth2 Password Bearer): Login via `/api/auth/login` and use the access token
    2. **Personal Access Token**: Create a token via `/api/users/me/tokens` and use as Bearer token
    
    ### Quick Start
    
    1. Login or register a new account
    2. Use the **Authorize** button to authenticate
    3. Explore the API endpoints below
    
    ### Support
    
    For issues or questions, please refer to the repository documentation.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "API Support",
        "email": settings.FIRST_SUPERUSER_EMAIL,
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=[
        {
            "name": "authentication",
            "description": "User authentication and registration operations. Login, register, and logout endpoints.",
        },
        {
            "name": "users",
            "description": "User profile and account management. View and update user information.",
        },
        {
            "name": "admin",
            "description": "Administrative operations. **Admin access only**. User management and system configuration.",
        },
        {
            "name": "tokens",
            "description": "Personal Access Token (PAT) management. Create and manage API tokens for programmatic access.",
        },
        {
            "name": "items",
            "description": "Sample CRUD entity. Demonstrates ownership-based access control and pagination.",
        },
        {
            "name": "events",
            "description": "Change ledger events with tooling/agent context, filtering, and timeline support.",
        },
        {
            "name": "agents",
            "description": "CI agent inventory and status, linked to events.",
        },
        {
            "name": "tools",
            "description": "Tools and components installed/updated across agents.",
        },
        {
            "name": "toolchains",
            "description": "Toolchain definitions grouping tools used by agents/jobs.",
        },
        {
            "name": "tags",
            "description": "Labels for categorizing events (e.g., outage, rollout).",
        },
    ],
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tokens.router, prefix="/api/users", tags=["tokens"])
app.include_router(items.router)
app.include_router(events.router)
app.include_router(agents.router)
app.include_router(tools.router)
app.include_router(toolchains.router)
app.include_router(tags.router)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Welcome to FastAPI Intranet Demo",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "authentication": "enabled"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
