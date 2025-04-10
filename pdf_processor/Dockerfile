FROM python:3.10-slim

WORKDIR /app

# Installation de Tesseract OCR et des dépendances nécessaires
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-eng \
    poppler-utils \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie des fichiers de l'application
COPY . .

# Création des répertoires pour les fichiers
RUN mkdir -p uploads processed

# Exposition du port
EXPOSE 5000

# Démarrage de l'application
CMD ["python", "app/main.py"] 