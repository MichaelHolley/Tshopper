# Tshopper

docker-compose.yml

```yml
version: '3.8'

services:
  frontend:
    image: mpholley/tshopper-web:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:80
    depends_on:
      - backend
    restart: always

  backend:
    image: mpholley/tshopper-service:latest
    ports:
      - "6000:80"
    environment:
      - Jwt__Key=MySecretKeyWithEnoughCharacter
      - Password=abc123
    restart: always
```
