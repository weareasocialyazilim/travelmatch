# Use Python 3.12 slim image (bookworm base has fewer CVEs)
FROM python:3.12-slim-bookworm as base

# Set working directory
WORKDIR /app

# Install system dependencies and apply security updates
# CVE fixes: zlib (integer overflow), pam (directory traversal)
RUN apt-get update && \
    apt-get upgrade -y && \
    # Explicitly upgrade vulnerable packages to latest patched versions
    apt-get install -y --only-upgrade \
        zlib1g \
        libpam0g \
        libpam-modules \
        libpam-modules-bin \
        libpam-runtime && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl && \
    # Clean up to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
