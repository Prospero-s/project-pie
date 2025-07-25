FROM python:3.10-slim

WORKDIR /app

# Installation de Tesseract OCR et des dépendances nécessaires
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-eng \
    poppler-utils \
    curl \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Installation de Gunicorn pour la production
RUN pip install gunicorn==21.2.0

# Copie des fichiers de l'application
COPY . .

# Création des répertoires pour les fichiers avec permissions
RUN mkdir -p uploads processed storage storage/uploads storage/processed && \
    chmod -R 777 uploads processed storage

# Exposition du port
EXPOSE 5000

# Variables d'environnement par défaut
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0
ENV PYTHONUNBUFFERED=1

# Script de santé pour Docker healthcheck
RUN echo '#!/bin/bash\ncurl -f http://localhost:5000/health || exit 1' > /healthcheck.sh && chmod +x /healthcheck.sh

# Démarrage de l'application avec Gunicorn
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app.main:app"] 