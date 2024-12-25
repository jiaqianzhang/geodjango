# Use the existing Conda Miniconda3 image
FROM conda/miniconda3:latest


# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Update the apt sources to a more recent Debian version
RUN sed -i 's/stretch/buster/g' /etc/apt/sources.list && \
    apt-get update

# Install system dependencies, allowing unauthenticated packages
RUN apt-get install -y --allow-unauthenticated libpoppler-dev netcat-openbsd


# Copy environment YAML file
COPY ENV.yml .

# Step 1: Create the Conda environment from the ENV.yml file
RUN conda env create -f ENV.yml --quiet

# Activate the environment and set the PATH
ENV PATH="/opt/conda/envs/env/bin:$PATH"

# Expose the Django port
EXPOSE 8001

# Copy the Django project files into the container
COPY . .

# Collect static files and run collectstatic
RUN conda run -n env python manage.py collectstatic --noinput

# Command to run the Django development server
CMD ["conda", "run", "-n", "env", "python", "manage.py", "runserver", "0.0.0.0:8001"]
