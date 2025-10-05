from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = FastAPI()

@app.get("/")
async def health():
    return JSONResponse({
        "status": "healthy",
        "service": "Asteroid Defense Grid API",
        "version": "1.0.0",
        "platform": "Vercel"
    })

# Vercel handler
def handler(request):
    return app(request)