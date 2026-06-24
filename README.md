# Service Booking System (Django + DRF + JWT)

## 🚀 Project Overview
This is a full-stack backend API for a Service Booking System where customers can book services and workers are automatically assigned based on service type.

## 🔧 Features
- User Authentication (JWT)
- Customer & Worker Roles
- Service Management
- Auto Worker Assignment
- Booking System
- Booking Status Update (Pending → Accepted → Completed)
- Worker Dashboard
- Customer Dashboard

## 📡 API Endpoints

### Auth
- POST /api/token/

### Services
- GET/POST /api/services/

### Workers
- GET /api/workers/

### Bookings
- POST /api/bookings/
- GET /api/bookings/
- PATCH /api/bookings/{id}/status/

### Dashboards
- GET /api/customer/dashboard/
- GET /api/worker/dashboard/

## ⚙️ Tech Stack
- Django
- Django REST Framework
- Simple JWT
- SQLite

## 📌 How to Run
```bash
pip install -r requirements.txt
python manage.py runserver

