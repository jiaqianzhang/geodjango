# # Use a Conda-based image if you need Conda
# FROM continuumio/miniconda3:latest

# # Set environment variables
# ENV PYTHONUNBUFFERED 1

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     software-properties-common \
#     && add-apt-repository ppa:ubuntugis/ubuntugis-unstable \
#     && apt-get update && apt-get install -y \
#     libgdal-dev gdal-bin \
#     && gdal-config --version  # Confirm GDAL version

# # Create a Conda environment and activate it
# RUN conda create -n env python=3.12 -y && conda clean -a
# SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# # Install Python dependencies
# COPY requirements.txt /app/
# WORKDIR /app
# RUN pip install --upgrade pip && pip install -r requirements.txt

# # Expose the Django port
# EXPOSE 8001

# # Copy the Django project files into the container
# COPY . .

# # Collect static files
# RUN python manage.py collectstatic --noinput

# # Command to run the Django development server
# CMD ["conda", "run", "-n", "env", "python", "manage.py", "runserver", "0.0.0.0:8001"]

# Use a Miniconda base image
# FROM continuumio/miniconda3

# # Set environment variables for Django
# ENV PYTHONUNBUFFERED=1
# ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# # Set the working directory
# WORKDIR /app

# # Install system dependencies, including libpoppler-dev and netcat
# RUN apt-get update && apt-get install -y libpoppler-dev netcat-openbsd

# # Copy environment YAML file and create the Conda environment
# COPY ENV.yml .
# RUN conda env create -f ENV.yml

# # Activate the environment and set the PATH
# ENV PATH=/opt/conda/envs/awm_env/bin:$PATH

# # Expose the Django port
# EXPOSE 8001

# # Copy the Django project files into the container
# COPY . .

# # Copy static files and run collectstatic
# COPY ./static /app/static
# RUN conda run -n awm_env python manage.py collectstatic --noinput


# # Command to run the Django development server
# CMD ["conda", "run", "-n", "awm_env", "python", "manage.py", "runserver", "0.0.0.0:8001"]
# Use a Miniconda base image
# FROM continuumio/miniconda3

# # Set environment variables for Django
# ENV PYTHONUNBUFFERED=1
# ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# # Set the working directory
# WORKDIR /app

# # Install system dependencies, including libpoppler-dev and netcat
# RUN apt-get update && apt-get install -y libpoppler-dev netcat-openbsd

# # Copy environment YAML file and create the Conda environment
# COPY ENV.yml .
# RUN conda env create -f ENV.yml

# # Activate the environment and set the PATH
# ENV PATH=/opt/conda/envs/awm_env/bin:$PATH

# # Expose the Django port
# EXPOSE 8001

# # Copy the Django project files into the container
# COPY . .

# # Command to run the Django development server
# CMD ["conda", "run", "-n", "awm_env", "python", "manage.py", "runserver", "0.0.0.0:8001"]

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
