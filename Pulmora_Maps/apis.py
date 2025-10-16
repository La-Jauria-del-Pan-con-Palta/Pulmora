import requests
import os
import google as genai

def air_quality(lat, lon):
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        print('Error: No se encuentra la API de OpenWheather')
        return None
    
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"

    try:
        response = response.get(url)
        response.raise_for_status()
        data = response.json
        return data['list'][0]['main']['aqi']
    except requests.exceptions.RequestException as e:
        print(f"Error al llamar a la API de OpenWeather: {e}")
        return None
    
#The first of many API requests to do in Climatiq / I'm gonna find a better and easly way
def co2_emmissions(country_code='US'):
    api_key = os.environ.get('13N7CRNB551EV1S3RN0K2BHKY0')
    if not api_key:
        print('Error: No se encuentra la API de Climatiq')

    url = "https://api.climatiq.io/v1/estimate"
    headers = {"Authorization": f"Bearer {api_key}"}

    payload = {
        "emissions_factor": {
            "activity_id": "financial_spend-scope_3_cat_15_per_capita_co2e",
            "region": country_code,
            "year": 2025,
            "source": "EXIOBASE",
            "data_version": "^3"
        },
    "parameters": {
        "money": 1,
        "money_unit": "usd"
    }
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('co2e')
    except requests.exceptions.RequestException as e:
        print(f'Error al llamar a la API de Climatiq: {e}')

def chatbox(promt):
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print('Error: No se encuentra la API de Gemini')
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(promt)
        return response.text
    except Exception as e:
        print(f"Error al llamar a la API de Gemini: {e}")
        return None