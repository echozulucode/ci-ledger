"""Add is_ldap_user field to users table."""
from app.core.database import engine
from sqlmodel import text

def migrate():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_ldap_user BOOLEAN NOT NULL DEFAULT 0"))
            print("✓ Migration successful: Added is_ldap_user column")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("✓ Column already exists, skipping migration")
            else:
                print(f"✗ Migration failed: {e}")
                raise

if __name__ == "__main__":
    migrate()
