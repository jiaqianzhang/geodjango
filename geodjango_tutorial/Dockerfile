FROM continuumio/miniconda3

LABEL maintainer="Bujar Raufi"

# set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=geodjango_tutorial.settings
ENV PYTHONPATH="/app"

# create and set the working directory
RUN mkdir -p /app
WORKDIR /app

# create log directory and file with proper permissions
RUN touch /app/debug.log && \
    chmod 666 /app/debug.log

# install system dependencies including GDAL
RUN apt-get update && \
    apt-get install -y \
    curl \
    netcat-openbsd \
    build-essential \
    python3-dev \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# set GDAL environment variables
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so

# copy environment file and create conda environment
COPY ENV.yml .
RUN conda env create -f ENV.yml && \
    conda clean -a

# make RUN commands use the new environment
SHELL ["conda", "run", "-n", "env", "/bin/bash", "-c"]

# verify GDAL installation
RUN gdal-config --version && \
    python -c "from osgeo import gdal; print(gdal.__version__)"

# copy project files
COPY . /app

# expose port
EXPOSE 8001

# set the entrypoint
ENTRYPOINT ["conda", "run", "-n", "env"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
