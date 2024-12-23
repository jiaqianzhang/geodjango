# Use a Miniconda base image
FROM conda/miniconda3

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Update apt sources and install system dependencies
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list && \
    sed -i '/stretch-updates/d' /etc/apt/sources.list && \
    sed -i '/security.debian.org/d' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends libpoppler-dev netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copy environment YAML file and create the Conda environment
COPY ENV.yml .
RUN conda env create -f ENV.yml

# Activate the environment and set the PATH
ENV PATH="/opt/conda/envs/env/bin:$PATH"

# Expose the Django port
EXPOSE 8001

# Copy the Django project files into the container
COPY . .

# Collect static files
RUN conda run -n env python manage.py collectstatic --noinput

# Command to run the Django development server
CMD ["conda", "run", "-n", "env", "python", "manage.py", "runserver", "0.0.0.0:8001"]
