import sys
import os

# Add root directory to sys.path for module resolution
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import app

# Vercel serverless WSGI handler
