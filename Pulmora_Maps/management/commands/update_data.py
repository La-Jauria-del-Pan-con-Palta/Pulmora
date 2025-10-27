import json
from django.core.management.base import BaseCommand
from django.conf import settings
from Pulmora_Maps import apis

class Command(BaseCommand):
    def get_aqi(self, aqi_value: int) -> str:
        if aqi_value == 1:
            return "Muy buena"
        elif aqi_value == 2:
            return "Buena"
        elif aqi_value == 3:
            return "Moderada"
        elif aqi_value > 3:
            return "Mala"
        return "Desconocio"
    
    def get_main_pollutant(self, components: dict) -> str:
        if not components:
            return "N/A"

        main_pollutant = max(components, key=components.get)

        pollutant_map = {
            "co": "CO", "no": "NO", "no2": "NO₂", "o3": "O₃", 
            "so2": "SO₂", "pm2_5": "PM₂.₅", "pm10": "PM₁₀", "nh3": "NH₃"
        }
        return pollutant_map.get(main_pollutant, main_pollutant)
    
    def handle(self, *args, **options):
        
        countries = [
            #this are only a example country
            {'name': "Chile", 'code': "CL", 'lat': "-30", 'lon': "71"}
        ]

        environment_data = []
        
        for country in countries:
            co2_per_capita = apis.co2_emmissions(country['code'])
            aqi_data = apis.air_quality(country['lat'], country['lon'])

            if aqi_data:
                aqi_value = aqi_data['aqi']
                aqi_level_text = self._get_aqi_level_text(aqi_value)
                main_pollutant = self._get_main_pollutant(aqi_data['components'])
            else:
                aqi_value = None
                aqi_level_text = "No disponible"
                main_pollutant = "N/A"

            environment_data.append({
                "name": country['name'],
                "code": country['code'],
                "lat": country['lat'],
                "lon": country['lon'],
                "co2_per_capita": co2_per_capita,
                "aqi": aqi_value,
                "aqi_level": aqi_level_text,
                "main_pollutant": main_pollutant
            })

        file = settings.BASE_DIR / 'pulmora' / 'data' / 'environment_data.json'

        file.parent.mkdir(parents=True, exist_ok=True)

        with open(file, 'w', encoding='utf-8') as f:
            json.dump(environment_data, f, indent=4, ensure_ascii=False)

        #This is just to enssure that the file is written correctly
        self.stdout.write(self.style.SUCCESS(f"Tamo ready"))