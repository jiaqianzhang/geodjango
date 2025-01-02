# CafeFinder: A Location-Based Service Application
Technologies Used

- Database: PostgreSQL with PostGIS
- Middle Tier: Django
- Front-End: Progressive Web Application (PWA), Bootstrap, Leaflet.js with OpenStreetMap
- Deployment: Docker, AWS cloud

Installation and Setup
- Prerequisites: Docker and Docker Compose installed, PostgreSQL with PostGIS extension, AWS Cloud setup, Python:lastest, Google Places API key
- Clone the Repository
- Set Up Environment Variables
- Build and Start Docker Containers (docker compose up --build)
- Run Migrations (docker exec -it awm_django_app python manage.py makemigrations, docker exec -it awm_django_app python manage.py migrate)
- Collect static files (docker exec -it awm_django_app python manage.py collectstatic --noinput)

Screenshots
- Sign up page
<img width="1512" alt="Screenshot 2025-01-02 at 08 50 29" src="https://github.com/user-attachments/assets/74171a8d-c7b8-4956-b33d-54c149fd1cc7" />

- Login page
<img width="1512" alt="Screenshot 2025-01-02 at 08 50 22" src="https://github.com/user-attachments/assets/0cdad61a-927c-4ee4-b18e-5a2db8c564af" />

- Cafe finder
<img width="1512" alt="Screenshot 2025-01-02 at 08 50 53" src="https://github.com/user-attachments/assets/4ad22256-9054-4341-a2ab-754b60113c9d" />
<img width="1512" alt="Screenshot 2025-01-02 at 08 54 35" src="https://github.com/user-attachments/assets/a2352d49-5196-4213-9254-fd35abe6a066" />
<img width="1512" alt="Screenshot 2025-01-02 at 08 55 53" src="https://github.com/user-attachments/assets/6222e500-152c-4bed-bc18-4c3a58f5a03f" />
<img width="1512" alt="Screenshot 2025-01-02 at 08 58 50" src="https://github.com/user-attachments/assets/5932ab24-305e-4ad8-b689-1fee1027110d" />
<img width="1512" alt="Screenshot 2025-01-02 at 08 57 24" src="https://github.com/user-attachments/assets/6a886645-5154-4681-ae3f-75385970de51" />

- No favourite list
<img width="1512" alt="Screenshot 2025-01-02 at 08 51 18" src="https://github.com/user-attachments/assets/3cd82344-0b74-4ae3-bc61-add9aca8f0af" />

- Favourite list
<img width="1512" alt="Screenshot 2025-01-02 at 08 51 00" src="https://github.com/user-attachments/assets/02a02fc5-86a3-4cc3-9e72-7f067bbe4e80" />

Useful commands
- docker compose exec awm_django_app /bin/bash -c "cd /app && . /opt/conda/etc/profile.d/conda.sh && conda activate env && python manage.py collectstatic --noinput"
- docker compose down
- docker compose build
- docker compose up -d
- docker exec -it awm_django_app python manage.py createsuperuser
