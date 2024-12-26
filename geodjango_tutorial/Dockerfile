# Use a Conda-based image if you need Conda
FROM continuumio/miniconda3:latest

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:ubuntugis/ubuntugis-unstable \
    && apt-get update && apt-get install -y \
    libgdal-dev gdal-bin \
    && gdal-config --version  # Confirm GDAL version

# Create a Conda environment and activate it
RUN conda create -n env python=3.12 -y && conda clean -a
SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# Install Python dependencies
COPY requirements.txt /app/
WORKDIR /app
RUN pip install --upgrade pip && pip install -r requirements.txt

# Expose the Django port
EXPOSE 8001

# Copy the Django project files into the container
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Command to run the Django development server
CMD ["conda", "run", "-n", "env", "python", "manage.py", "runserver", "0.0.0.0:8001"]
