"""initial ci ledger schema"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Users and auth
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_ldap_user", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "personal_access_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scopes", sa.String(), nullable=False, server_default="read"),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
    )
    op.create_index("ix_personal_access_tokens_name", "personal_access_tokens", ["name"], unique=False)
    op.create_index("ix_personal_access_tokens_token_hash", "personal_access_tokens", ["token_hash"], unique=True)
    op.create_index("ix_personal_access_tokens_user_id", "personal_access_tokens", ["user_id"], unique=False)

    # Sample items
    op.create_table(
        "items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # CI Ledger domain tables
    op.create_table(
        "agents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("vm_hostname", sa.String(length=255), nullable=True),
        sa.Column("labels", sa.JSON(), nullable=True),
        sa.Column("os_type", sa.String(length=100), nullable=True),
        sa.Column("architecture", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_agents_name", "agents", ["name"])

    op.create_table(
        "tools",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False, server_default="other"),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="other"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_tools_name", "tools", ["name"])

    op.create_table(
        "toolchains",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_toolchains_name", "toolchains", ["name"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=4000), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False, server_default="info"),
        sa.Column("source", sa.String(length=50), nullable=False, server_default="manual"),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_events_timestamp", "events", ["timestamp"], unique=False)
    op.create_index("ix_events_event_type", "events", ["event_type"], unique=False)
    op.create_index("ix_events_severity", "events", ["severity"], unique=False)
    op.create_index("ix_events_source", "events", ["source"], unique=False)

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
    )
    op.create_index("ix_tags_name", "tags", ["name"], unique=True)

    op.create_table(
        "toolchain_tools",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("toolchain_id", sa.Integer(), sa.ForeignKey("toolchains.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tool_id", sa.Integer(), sa.ForeignKey("tools.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_toolchain_tools_tc", "toolchain_tools", ["toolchain_id"])
    op.create_index("ix_toolchain_tools_tool", "toolchain_tools", ["tool_id"])
    op.create_unique_constraint("uq_toolchain_tool", "toolchain_tools", ["toolchain_id", "tool_id"])

    op.create_table(
        "event_agents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_id", sa.Integer(), sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_event_agents_event", "event_agents", ["event_id"])
    op.create_index("ix_event_agents_agent", "event_agents", ["agent_id"])
    op.create_unique_constraint("uq_event_agent", "event_agents", ["event_id", "agent_id"])

    op.create_table(
        "event_tools",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tool_id", sa.Integer(), sa.ForeignKey("tools.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_from", sa.String(length=100), nullable=True),
        sa.Column("version_to", sa.String(length=100), nullable=True),
    )
    op.create_index("ix_event_tools_event", "event_tools", ["event_id"])
    op.create_index("ix_event_tools_tool", "event_tools", ["tool_id"])
    op.create_unique_constraint("uq_event_tool", "event_tools", ["event_id", "tool_id"])

    op.create_table(
        "event_tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tag_id", sa.Integer(), sa.ForeignKey("tags.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_event_tags_event", "event_tags", ["event_id"])
    op.create_index("ix_event_tags_tag", "event_tags", ["tag_id"])
    op.create_unique_constraint("uq_event_tag", "event_tags", ["event_id", "tag_id"])


def downgrade():
    op.drop_table("event_tags")
    op.drop_table("event_tools")
    op.drop_table("event_agents")
    op.drop_table("toolchain_tools")
    op.drop_table("tags")
    op.drop_table("events")
    op.drop_table("toolchains")
    op.drop_table("tools")
    op.drop_table("agents")
    op.drop_table("items")
    op.drop_index("ix_personal_access_tokens_user_id", table_name="personal_access_tokens")
    op.drop_index("ix_personal_access_tokens_token_hash", table_name="personal_access_tokens")
    op.drop_index("ix_personal_access_tokens_name", table_name="personal_access_tokens")
    op.drop_table("personal_access_tokens")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
