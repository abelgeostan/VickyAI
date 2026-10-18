"""add message sources
Revision ID: 003_add_message_sources
Revises: 002_nullable_message_id
Create Date: 2026-10-18 16:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003_add_message_sources'
down_revision = '002_nullable_message_id'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'messages',
        sa.Column('sources', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('messages', 'sources')
