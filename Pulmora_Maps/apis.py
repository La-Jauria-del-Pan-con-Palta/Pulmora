import requests
import google as genai
from django.conf import settings
import pandas as pd

def air_quality(lat, lon):
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        print('Error: No se encuentra la API de OpenWeather')
        return None
    
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get('list'):
            air_data = data['list'][0]
            return {
                'aqi': air_data['main']['aqi'],
                'components': air_data['components']
            }
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error al llamar a la API de OpenWeather: {e}")
        return None

def get_co2_emissions(countries):
    try:
        
        url = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv"
        df = pd.read_csv(url)

        latest_year = df['year'].max()
        df_latest = df[df['year'] == latest_year]
        
        co2_data = []
        for country in countries:
            country_name = country['name']
            
            name_mapping = {
                'Estados Unidos': 'United States',
                'Reino Unido': 'United Kingdom',
                'Países Bajos': 'Netherlands',
            }
            
            search_name = name_mapping.get(country_name, country_name)
            country_data = df_latest[df_latest['country'] == search_name]
            
            if not country_data.empty:
                co2_per_capita = country_data['co2_per_capita'].values[0]
                total_co2 = country_data['co2'].values[0]
            else:
                co2_per_capita = None
                total_co2 = None
            
            co2_data.append({
                'name': country['name'],
                'code': country['code'],
                'lat': float(country['lat']),
                'lon': float(country['lon']),
                'co2_per_capita': co2_per_capita,
                'total_co2': total_co2
            })
        
        return co2_data
    
    except Exception as e:
        print(f"Error al obtener datos de CO2: {e}")
        return []

"""def chatbox(promt):
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
        return None"""