# Use the existing Conda Miniconda3 image
FROM conda/miniconda3:latest

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Update apt-get and install dependencies one by one for easier debugging
RUN apt-get update -y && \
    apt-get install -y libgdal-dev && \
    apt-get install -y gdal-bin && \
    apt-get install -y libpq-dev && \
    apt-get install -y python3-dev && \
    apt-get install -y build-essential && \
    apt-get install -y libproj-dev && \
    apt-get clean


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
