import requests
import google as genai
from django.conf import settings
from django.core.cache import cache
import pandas as pd
from .coords import COUNTRIES_COORDINATES, normalize_country_name

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

def air_quality_cache():
    cache_key = 'air_quality_cache'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    print('Cache vacia, se demorara en renderizar la pagina')
    air_quality_data = []
    processed = 0

    for country_name, country_info in COUNTRIES_COORDINATES.items():
        processed += 1

        aqi_data = air_quality(country_info['lat'], country_info['lon'])

        if aqi_data:
            air_quality_data.append({
                'name': country_name,
                'code': country_info['code'],
                'lat': country_info['lat'],
                'lon': country_info['lon'],
                'aqi': aqi_data['aqi'],
                'components': aqi_data['components']
            })
            print('Datos agregados')
        else:
            print('Error al agregar los datos')
    
    cache.set(cache_key, air_quality_data, 60 * 60 * 24)
    return air_quality_data

def co2_emissions():
        
    url = "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv"
    df = pd.read_csv(url)
        
    latest_year = df['year'].max()
    df_latest = df[df['year'] == latest_year]
        
    exclude_entities = [
        'World', 'Asia', 'Europe', 'Africa', 'North America', 
        'South America', 'Oceania', 'European Union', 'High-income countries',
        'Low-income countries', 'Middle-income countries'
    ]
        
    df_countries = df_latest[~df_latest['country'].isin(exclude_entities)]
    df_countries = df_countries[
        (df_countries['co2_per_capita'].notna()) &
        (df_countries['co2'].notna())
    ]
        
    co2_data = []
        
    for _, row in df_countries.iterrows():
        country_name = row['country']
        normalized_name = normalize_country_name(country_name)
            
        country_info = COUNTRIES_COORDINATES.get(normalized_name)
            
        if country_info:
            co2_data.append({
                'name': country_name,
                'code': country_info['code'],
                'lat': country_info['lat'],
                'lon': country_info['lon'],
                'co2_per_capita': float(row['co2_per_capita']),
                'total_co2': float(row['co2']) if pd.notna(row['co2']) else 0
            })
        
    print(f"✅ Datos de CO2 obtenidos para {len(co2_data)} países")
    return co2_data

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