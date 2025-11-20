% for directive in directives + ["from alembic import op", "import sqlalchemy as sa"]:
${directive}
% endfor
${imports if imports else ""}

def upgrade():
    ${upgrades if upgrades else "pass"}


def downgrade():
    ${downgrades if downgrades else "pass"}
