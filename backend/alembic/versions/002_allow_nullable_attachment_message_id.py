"""allow nullable attachment message_id

Revision ID: 002_nullable_message_id
Revises: 001_initial
Create Date: 2026-10-16 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_nullable_message_id'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        'attachments',
        'message_id',
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'attachments',
        'message_id',
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )
