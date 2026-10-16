FROM python:3.12-slim

WORKDIR /app

# Install curl for healthcheck and netcat/libpq for postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create uploads directory
RUN mkdir -p /app/uploads

COPY alembic.ini .
COPY alembic alembic
COPY app app

EXPOSE 8000

# Entrypoint script that applies migrations then starts server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
