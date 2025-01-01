FROM continuumio/miniconda3

LABEL maintainer="Bujar Raufi"

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings
ENV PYTHONPATH="/app"

# Create and set the working directory
RUN mkdir -p /app
WORKDIR /app

# Create log directory and file with proper permissions
RUN touch /app/debug.log && \
    chmod 666 /app/debug.log

# Create the environment (copy only necessary files first)
COPY ENV.yml .
RUN conda env create -f ENV.yml && \
    conda clean -a

# Make RUN commands use the new environment
SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# Copy project files
COPY . /app

# Remove redundant COPY of manage.py since it's already included in COPY . /app
# COPY manage.py .  <- Remove this line as it's redundant

# Exposing the port
EXPOSE 8001

# Set the entrypoint and command
ENTRYPOINT ["conda", "run", "-n", "env"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
