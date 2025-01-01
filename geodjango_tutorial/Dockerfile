FROM continuumio/miniconda3

LABEL maintainer="Bujar Raufi"

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings
ENV PYTHONPATH="/app"

# Create and set the working directory
RUN mkdir -p /app
WORKDIR /app

# Install GDAL and dependencies via Conda
COPY ENV.yml .
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential && \
    conda env create -f ENV.yml && \
    conda clean -a && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Activate the environment
SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# Set GDAL environment variables
ENV GDAL_VERSION=3.9.3
ENV PROJ_LIB=/opt/conda/envs/env/share/proj
ENV GDAL_DATA=/opt/conda/envs/env/share/gdal

# Copy the project files
COPY . /app

# Expose the Django development server port
EXPOSE 8001

# Run migrations and start the server
CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8001"]
