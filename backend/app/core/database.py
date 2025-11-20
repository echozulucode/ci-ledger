"""Database connection and session management."""
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True if settings.ENVIRONMENT == "development" else False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)


def create_db_and_tables():
    """Create database tables (skips existing tables)."""
    SQLModel.metadata.create_all(engine, checkfirst=True)


def get_session():
    """
    Get database session.
    
    Yields:
        Database session
    """
    with Session(engine) as session:
        yield session
