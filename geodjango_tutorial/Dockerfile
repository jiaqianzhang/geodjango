FROM continuumio/miniconda3

LABEL maintainer="Bujar Raufi"

# I use the geodjango_tutorial as my project name adjust to your project name
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

RUN mkdir -p /app
WORKDIR /app

# Install GDAL dependencies
RUN apt-get update && \
    apt-get install -y \
    gdal-bin \
    libgdal-dev && \
    rm -rf /var/lib/apt/lists/*

# Create the environment:
COPY ENV.yml .
RUN conda env create -f ENV.yml

# Make RUN commands use the new environment:
SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# Set GDAL environment variable (optional, but often required for GDAL and pyproj to work properly)
ENV GDAL_VERSION=3.9.3
ENV PROJ_LIB=/opt/conda/envs/env/share/proj

# Copy everything in your Django project to the image.
COPY . /app
ENV PYTHONPATH="/app"

# The code to run when container is started:
COPY manage.py .
ENTRYPOINT ["conda", "run", "-n", "env"]

# Exposing the port that the container will operate feel free to change is port is taken
EXPOSE 8001

# Start the server when the container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
