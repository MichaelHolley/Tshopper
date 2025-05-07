# Tshopper

## Introduction

This is a simple shopping list application built with .NET, Vue.js, and SignalR.

The application is designed to be deployed as a Docker container, with a frontend and backend service. The frontend is a Vue.js application that communicates with the backend service using SignalR. The backend service is a .NET service that uses Entity Framework to store and retrieve data from a SQLite database.

<img src="https://github.com/user-attachments/assets/568f990f-9c89-4659-8c85-3d4c49b9f595" width="320" />

## Hosting

### docker-compose

```yml
version: '3.8'

services:
  frontend:
    image: mpholley/tshopper-web:latest
    ports:
      - "6000:80"
    environment:
      - VITE_API_URL=http://backend:8080
    depends_on:
      - backend
    restart: always

  backend:
    image: mpholley/tshopper-service:latest
    ports:
      - "6001:8080"
    environment:
      - Jwt__Key=MySecretKeyWithEnoughCharacter
      - Password=abc123
    volumes:
      - sqlite-data:/app/data
    restart: always

volumes:
  sqlite-data:
```
