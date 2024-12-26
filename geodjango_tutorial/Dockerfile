FROM conda/miniconda3:latest

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory
WORKDIR /app

# Update package lists and install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgdal-dev \
        gdal-bin \
        libpq-dev \
        python3-dev \
        build-essential \
        libproj-dev \
        wget \
        curl \
        software-properties-common && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies using pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Django port
EXPOSE 8001

# Copy the Django project files into the container
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Command to run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
