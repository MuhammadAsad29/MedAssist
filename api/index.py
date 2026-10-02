import sys
import os

# Add root directory to sys.path for module resolution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app

# Vercel serverless WSGI handler
