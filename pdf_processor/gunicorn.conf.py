# Configuration Gunicorn pour le traitement de PDFs
import multiprocessing
import os

# Configuration de base
bind = "0.0.0.0:5000"
workers = 2  # Limiter le nombre de workers pour éviter la surcharge mémoire
worker_class = "sync"

# Timeouts adaptés pour le traitement de PDFs
timeout = 600  # 10 minutes pour le traitement complet d'un PDF
keepalive = 5
graceful_timeout = 30

# Limites de requêtes
max_requests = 100
max_requests_jitter = 10

# Configuration mémoire
worker_memory_limit = 2048  # 2GB par worker
preload_app = True

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Variables d'environnement
env = {
    'FLASK_ENV': os.environ.get('FLASK_ENV', 'production'),
    'PYTHONUNBUFFERED': '1'
}

# Configuration SSL (si nécessaire)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile" 