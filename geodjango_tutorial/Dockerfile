# FROM conda/miniconda3:latest

# # Set environment variables
# ENV PYTHONUNBUFFERED=1
# ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings
# ENV DEBIAN_FRONTEND=noninteractive

# # Set the working directory
# WORKDIR /app

# # Update package lists and install dependencies
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#         gnupg2 \
#         software-properties-common \
#         wget \
#         curl \
#         ca-certificates && \
#     # Add UbuntuGIS repository for updated GDAL
#     wget -qO - https://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add - && \
#     apt-get update && \
#     apt-get install -y --no-install-recommends \
#         libgdal-dev \
#         gdal-bin \
#         libpq-dev \
#         python3-dev \
#         build-essential \
#         libproj-dev && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# # Install Python dependencies using pip
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Expose the Django port
# EXPOSE 8001

# # Copy the Django project files into the container
# COPY . .

# # Collect static files
# RUN python manage.py collectstatic --noinput

# # Command to run the Django development server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
# Use a Miniconda base image
FROM continuumio/miniconda3

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Install system dependencies, including libpoppler-dev and netcat
RUN apt-get update && apt-get install -y libpoppler-dev netcat-openbsd

# Copy environment YAML file and create the Conda environment
COPY ENV.yml .
RUN conda env create -f ENV.yml

# Activate the environment and set the PATH
ENV PATH=/opt/conda/envs/env/bin:$PATH

# Expose the Django port
EXPOSE 8001

# Copy the Django project files into the container
COPY . .

# Copy static files and run collectstatic
COPY ./static /app/static
RUN conda run -n env python manage.py collectstatic --noinput

# Command to run the Django development server
CMD ["conda", "run", "-n", "env", "python", "manage.py", "runserver", "0.0.0.0:8001"]