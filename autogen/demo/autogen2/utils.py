from PIL import Image
import requests
from io import BytesIO
from typing import Dict, Any
import os

def picsum_photos() -> str:
    img = requests.get("https://picsum.photos/300/200").content
    img_bin = BytesIO(img)
    img_pil = Image.open(img_bin)    
    file_name = "picsum.png"
    img_pil.save(file_name)
    return file_name

def get_weather(location: str) -> Dict[str, Any]:    
    response = requests.get(f"https://api.weatherapi.com/v1/current.json?q={location}&key={os.environ['WEATHER_API_KEY']}")
    if response.status_code != 200:
        return "Not found"
    return response.json()