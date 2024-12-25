# Use Miniconda base image
FROM conda/miniconda3:latest

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpoppler-dev netcat-openbsd

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
