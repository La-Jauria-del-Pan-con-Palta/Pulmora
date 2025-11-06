document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('interactive-map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    setTimeout(function() {
        map.invalidateSize();
    }, 100);

    let countriesData = [];
    try {
        const dataElement = document.getElementById('countries-data');
        if (!dataElement) {
            console.error('ERROR: No se encontró el elemento countries-data');
            return;
        }
        
        const jsonText = dataElement.textContent.trim();
        console.log('JSON recibido (primeros 200 chars):', jsonText.substring(0, 200));
        
        countriesData = JSON.parse(jsonText);
        console.log('✓ Datos parseados correctamente');
        console.log('✓ Total de países:', countriesData.length);
        console.log('✓ Primer país:', countriesData[0]);
    } catch (error) {
        console.error('ERROR al parsear datos:', error);
        alert('Error al cargar los datos del mapa. Revisa la consola para más detalles.');
        return;
    }
    
    if (countriesData.length === 0) {
        console.warn('ADVERTENCIA: No hay datos de países para mostrar');
        return;
    }

    function getColorByAQI(aqi) {
        if (!aqi) return '#9ca3af';
        
        switch(aqi) {
            case 1: return '#a4d6a4';
            case 2: return '#5cb85c';
            case 3: return '#f0ad4e';
            case 4: return '#d9534f';
            case 5: return '#8b0000'; 
            default: return '#9ca3af';
        }
    }

    function getAQILevel(aqi) {
        if (!aqi) return 'Sin datos';
        
        const levels = {
            1: 'Buena',
            2: 'Regular',
            3: 'Moderada',
            4: 'Mala',
            5: 'Muy Mala'
        };
        return levels[aqi] || 'Desconocido';
    }

    function getMainPollutant(components) {
        if (!components) return 'N/A';
        
        const dangerLevels = {
            'PM2.5': { value: components.pm2_5 || 0, limit: 15 },
            'PM10': { value: components.pm10 || 0, limit: 45 },
            'NO₂': { value: components.no2 || 0, limit: 25 },
            'SO₂': { value: components.so2 || 0, limit: 40 },
            'O₃': { value: components.o3 || 0, limit: 100 },
            'CO': { value: components.co || 0, limit: 4000 }
        };

        let maxExcess = 0;
        let mainPollutant = 'N/A';

        Object.keys(dangerLevels).forEach(key => {
            const pollutant = dangerLevels[key];
            const excessPercentage = (pollutant.value / pollutant.limit) * 100;
            
            if (excessPercentage > maxExcess) {
                maxExcess = excessPercentage;
                mainPollutant = key;
            }
        });

        return mainPollutant;
    }

    function updateKPICards(countryData) {
        const aqiValue = countryData.aqi || '--';
        document.getElementById('kpi-value-aqi').textContent = aqiValue;

        const aqiLevel = getAQILevel(countryData.aqi);
        document.getElementById('kpi-value-aqi-level').textContent = aqiLevel;

        const mainPollutant = getMainPollutant(countryData.components);
        document.getElementById('kpi-value-main-pollutant').textContent = mainPollutant;

        const pm25Value = countryData.components?.pm2_5 
            ? countryData.components.pm2_5.toFixed(2) 
            : '--';
        document.getElementById('kpi-value-pm25').textContent = `${pm25Value} µg/m³`;

        const aqiCard = document.getElementById('card-aqi-level');
        aqiCard.style.borderLeft = `4px solid ${getColorByAQI(countryData.aqi)}`;
    }

    console.log('🎨 Comenzando a dibujar marcadores...');
    let markersAdded = 0;
    
    countriesData.forEach((country, index) => {
        const color = getColorByAQI(country.aqi);
        
        console.log(`Dibujando ${country.name}: AQI=${country.aqi}, Color=${color}, Lat=${country.lat}, Lon=${country.lon}`);
        
        const circle = L.circleMarker([country.lat, country.lon], {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        markersAdded++;
        console.log(`✓ Marcador #${markersAdded} agregado para ${country.name}`);

        circle.on('click', function() {
            console.log(`🖱️  Click en ${country.name}`);
            updateKPICards(country);
            map.setView([country.lat, country.lon], 5);
        });

        circle.on('mouseover', function() {
            this.setStyle({
                radius: 12,
                weight: 3
            });
        });

        circle.on('mouseout', function() {
            this.setStyle({
                radius: 8,
                weight: 2
            });
        });
    });

    const aqiCounts = {
        'Buena (1)': 0,
        'Regular (2)': 0,
        'Moderada (3)': 0,
        'Mala (4)': 0,
        'Muy Mala (5)': 0
    };

    countriesData.forEach(country => {
        if (country.aqi) {
            switch(country.aqi) {
                case 1: aqiCounts['Buena (1)']++; break;
                case 2: aqiCounts['Regular (2)']++; break;
                case 3: aqiCounts['Moderada (3)']++; break;
                case 4: aqiCounts['Mala (4)']++; break;
                case 5: aqiCounts['Muy Mala (5)']++; break;
            }
        }
    });

    const ctxAqi = document.getElementById('aqi-distribution-chart').getContext('2d');
    new Chart(ctxAqi, {
        type: 'bar',
        data: {
            labels: Object.keys(aqiCounts),
            datasets: [{
                label: 'Número de países',
                data: Object.values(aqiCounts),
                backgroundColor: [
                    'rgba(164, 214, 164, 0.7)',
                    'rgba(92, 184, 92, 0.7)',
                    'rgba(240, 173, 78, 0.7)',
                    'rgba(217, 83, 79, 0.7)',
                    'rgba(139, 0, 0, 0.7)'
                ],
                borderColor: [
                    'rgba(164, 214, 164, 1)',
                    'rgba(92, 184, 92, 1)',
                    'rgba(240, 173, 78, 1)',
                    'rgba(217, 83, 79, 1)',
                    'rgba(139, 0, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    const avgPollutants = {
        'PM2.5': 0,
        'PM10': 0,
        'NO₂': 0,
        'SO₂': 0,
        'O₃': 0,
        'CO': 0
    };

    const limits = {
        pm2_5: 15,
        pm10: 45,
        no2: 25,
        so2: 40,
        o3: 100,
        co: 4000
    };

    let validCountries = 0;
    countriesData.forEach(country => {
        if (country.components) {
            avgPollutants['PM2.5'] += ((country.components.pm2_5 || 0) / limits.pm2_5) * 100;
            avgPollutants['PM10'] += ((country.components.pm10 || 0) / limits.pm10) * 100;
            avgPollutants['NO₂'] += ((country.components.no2 || 0) / limits.no2) * 100;
            avgPollutants['SO₂'] += ((country.components.so2 || 0) / limits.so2) * 100;
            avgPollutants['O₃'] += ((country.components.o3 || 0) / limits.o3) * 100;
            avgPollutants['CO'] += ((country.components.co || 0) / limits.co) * 100;
            validCountries++;
        }
    });

    Object.keys(avgPollutants).forEach(key => {
        avgPollutants[key] = validCountries > 0 ? avgPollutants[key] / validCountries : 0;
    });

    console.log('📊 Contaminantes promedio (% sobre límite OMS):', avgPollutants);

    const ctxPollutants = document.getElementById('pollutants-chart').getContext('2d');
    new Chart(ctxPollutants, {
        type: 'doughnut',
        data: {
            labels: Object.keys(avgPollutants),
            datasets: [{
                data: Object.values(avgPollutants),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Promedio global (% sobre límite OMS)',
                    font: {
                        size: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.toFixed(1) + '% del límite';
                            return label;
                        }
                    }
                }
            }
        }
    });
});