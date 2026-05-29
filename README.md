# Tshopper

## Introduction

A shopping list application built with .NET, Vue.js, and SignalR. Includes an AI chat assistant that lets you manage your list using natural language (e.g. "add milk and eggs", "remove all checked items").

The frontend is a Vue.js application that communicates with the backend over SignalR. The backend is a .NET service using Entity Framework with a SQLite database. AI chat is powered by any OpenAI-compatible API (defaults to OpenRouter).

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
    depends_on:
      - backend
    restart: always

  backend:
    image: mpholley/tshopper-service:latest
    ports:
      - "6001:8080"
    environment:
      - Jwt__Key=MySecretKeyWithEnoughCharacters
      - Password=abc123
      - OpenRouter__ApiKey=your-api-key
      - OpenRouter__Model=openai/gpt-5.4-mini
    volumes:
      - sqlite-data:/app/data
    restart: always

volumes:
  sqlite-data:
```
