"""CI Ledger - Infrastructure Change Tracker API"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables, get_session
from app.api import auth, users, tokens, events, agents, tools, toolchains, tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: create database tables and seed core data
    create_db_and_tables()

    from app.crud import user as crud_user
    from app.models.user import UserCreate
    from app import seeds

    session = next(get_session())
    admin = crud_user.get_user_by_email(session, settings.FIRST_SUPERUSER_EMAIL)
    if not admin:
        admin_create = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name="Admin User",
            is_admin=True,
            is_active=True,
        )
        crud_user.create_user(session, admin_create)
        print(f"? Created admin user: {settings.FIRST_SUPERUSER_EMAIL}")

    # Optionally seed sample data for local development
    if settings.SEED_SAMPLE_DATA and settings.ENVIRONMENT == "development":
        seeds.seed_sample_data(session)
        print("ⓘ Seeded sample CI Ledger data")

    yield

    # Shutdown: cleanup if needed


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## CI Ledger API
    
    Timeline-based change tracker for CI infrastructure with FastAPI + SQLModel.
    
    ### Features
    * **Auth**: JWT login plus Personal Access Tokens
    * **Change events**: typed/severity-scoped events with metadata
    * **Inventory**: agents, tools, toolchains, tags with linking
    * **Filtering**: time range, agent/tool, type/severity/source, search
    
    ### Authentication
    Use the **Authorize** button, then:
    1. JWT token from `/api/auth/login`
    2. Personal Access Token from `/api/users/me/tokens`
    
    ### Quick Start
    1. Create agents, tools, tags, and toolchains
    2. Post events with related agents/tools/tags
    3. Query `/api/events` with filters for timeline views
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
app.include_router(events.router)
app.include_router(agents.router)
app.include_router(tools.router)
app.include_router(toolchains.router)
app.include_router(tags.router)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Welcome to CI Ledger",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "authentication": "enabled",
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
