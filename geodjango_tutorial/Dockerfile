FROM continuumio/miniconda3

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Install system dependencies, including GDAL, libpoppler-dev, and netcat
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    gdal-bin \
    libpoppler-dev \
    netcat-openbsd

# Set environment variables for GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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
