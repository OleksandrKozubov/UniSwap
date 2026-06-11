# UniSwap

Student-oriented online marketplace platform developed as a Bachelor Thesis project.

## Features

- User registration and login
- Marketplace listings
- Search and filtering
- Real-time messaging
- Profile management
- Image uploads
- Interactive maps

## Tech Stack

### Frontend
- React.js
- React Router

### Backend
- Node.js
- Express.js
- Socket.IO

### Database
- PostgreSQL

### External Services
- Cloudinary
- OpenStreetMap / React Leaflet

---

## Setup

### 1. Clone repository

git clone https://github.com/OleksandrKozubov/UniSwap.git cd uniswap 

### 2. Install dependencies

Frontend:

cd ../frontend npm install 

Backend:

cd ../backend npm install 

---

## Database Setup

Create a PostgreSQL database:

CREATE DATABASE uniswap; 

Import the provided schema:

psql -U postgres -d uniswap -f database/uniswap_db.sql 

Alternatively, import database/uniswap_db.sql through pgAdmin.

---

## Environment Variables

Create a .env file inside the backend directory:

DATABASE_URL=postgresql://postgres:password@localhost:5432/uniswap  
JWT_SECRET=your_secret  
CLOUDINARY_NAME=your_name 
CLOUDINARY_KEY=your_key 
CLOUDINARY_SECRET=your_secret 

---

## Run Backend

cd backend npm start 

---

## Run Frontend

cd frontend npm start 

---

## Default URLs

Frontend:

http://localhost:3000 

Backend:

http://localhost:5000 

---

Developed as part of the Bachelor Thesis:

Implementation of a Student-Oriented Online Marketplace Platform "UniSwap"
