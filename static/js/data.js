document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('interactive-map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    setTimeout(function() {
        map.invalidateSize();
    }, 100);

    let airQualityData = [];
    let co2Data = [];
    let currentView = 'co2-emissions';
    let currentMarkers = [];
    let currentCharts = {
        distribution: null,
        comparison: null
    };

    try {
        const airQualityElement = document.getElementById('air-quality-data');
        const co2Element = document.getElementById('co2-data');
        
        if (airQualityElement) {
            airQualityData = JSON.parse(airQualityElement.textContent.trim());
            console.log('✓ Datos Air Quality cargados:', airQualityData.length);
        }
        
        if (co2Element) {
            co2Data = JSON.parse(co2Element.textContent.trim());
            console.log('✓ Datos CO2 cargados:', co2Data.length);
        }
    } catch (error) {
        console.error('ERROR al cargar datos:', error);
        alert('Error al cargar los datos. Revisa la consola.');
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

    function getColorByCO2(co2) {
        if (!co2 || co2 === null) return '#9ca3af';
        
        if (co2 < 2) return '#a4d6a4';  
        if (co2 < 5) return '#5cb85c';  
        if (co2 < 10) return '#f0ad4e';  
        if (co2 < 15) return '#d9534f';     
        return '#8b0000';               
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

    function getCO2Level(co2) {
        if (!co2 || co2 === null) return 'Sin datos';
        
        if (co2 < 2) return 'Muy Bajo';
        if (co2 < 5) return 'Bajo';
        if (co2 < 10) return 'Moderado';
        if (co2 < 15) return 'Alto';
        return 'Muy Alto';
    }

    function clearMarkers() {
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];
    }

    function renderAirQualityMarkers(data) {
        clearMarkers();
        
        data.forEach(country => {
            if (!country.aqi) return;
            
            const color = getColorByAQI(country.aqi);
            
            const circle = L.circleMarker([country.lat, country.lon], {
                radius: 8,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
            
            currentMarkers.push(circle);

            circle.on('click', function() {
                updateKPICards(country, 'air-quality');
                map.setView([country.lat, country.lon], 5);
            });

            circle.on('mouseover', function() {
                this.setStyle({ radius: 12, weight: 3 });
            });

            circle.on('mouseout', function() {
                this.setStyle({ radius: 8, weight: 2 });
            });
        });
    }

    function renderCO2Markers(data) {
        clearMarkers();
        
        data.forEach(country => {
            if (!country.co2_per_capita) return;
            
            const color = getColorByCO2(country.co2_per_capita);
            
            const circle = L.circleMarker([country.lat, country.lon], {
                radius: 8,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
            
            currentMarkers.push(circle);

            circle.on('click', function() {
                updateKPICards(country, 'co2-emissions');
                map.setView([country.lat, country.lon], 5);
            });

            circle.on('mouseover', function() {
                this.setStyle({ radius: 12, weight: 3 });
            });

            circle.on('mouseout', function() {
                this.setStyle({ radius: 8, weight: 2 });
            });
        });
    }

    function updateLegend(view) {
        const legendDiv = document.getElementById('map-legend');
        
        if (view === 'air-quality') {
            legendDiv.innerHTML = `
                <h4>Calidad del Aire (AQI)</h4>
                <ul>
                    <li><span class="color-box" style="background-color: #a4d6a4;"></span> Buena (1)</li>
                    <li><span class="color-box" style="background-color: #5cb85c;"></span> Regular (2)</li>
                    <li><span class="color-box" style="background-color: #f0ad4e;"></span> Moderada (3)</li>
                    <li><span class="color-box" style="background-color: #d9534f;"></span> Mala (4)</li>
                    <li><span class="color-box" style="background-color: #8b0000;"></span> Muy Mala (5)</li>
                </ul>
            `;
        } else {
            legendDiv.innerHTML = `
                <h4>Emisiones CO₂ per cápita</h4>
                <ul>
                    <li><span class="color-box" style="background-color: #a4d6a4;"></span> Muy Bajo (&lt;2 t)</li>
                    <li><span class="color-box" style="background-color: #5cb85c;"></span> Bajo (2-5 t)</li>
                    <li><span class="color-box" style="background-color: #f0ad4e;"></span> Moderado (5-10 t)</li>
                    <li><span class="color-box" style="background-color: #d9534f;"></span> Alto (10-15 t)</li>
                    <li><span class="color-box" style="background-color: #8b0000;"></span> Muy Alto (&gt;15 t)</li>
                </ul>
            `;
        }
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

    function updateKPICards(countryData, view) {
        const kpiContainer = document.getElementById('kpi-cards');
        
        if (view === 'air-quality') {
            const aqiValue = countryData.aqi || '--';
            const aqiLevel = getAQILevel(countryData.aqi);
            const mainPollutant = getMainPollutant(countryData.components);
            const pm25Value = countryData.components?.pm2_5 
                ? countryData.components.pm2_5.toFixed(2) 
                : '--';
            
            kpiContainer.innerHTML = `
                <div class="card" style="border-left: 4px solid ${getColorByAQI(countryData.aqi)}">
                    <img src="/static/img/metrics.png" alt="Calidad del Aire">
                    <h3>${aqiValue}</h3>
                    <p>Índice Calidad del Aire</p>
                </div>
                <div class="card">
                    <img src="/static/img/co2.png" alt="Nivel de Calidad">
                    <h3>${aqiLevel}</h3>
                    <p>Nivel Calidad del Aire</p>
                </div>
                <div class="card">
                    <img src="/static/img/target.png" alt="Contaminante principal">
                    <h3>${mainPollutant}</h3>
                    <p>Contaminante más peligroso</p>
                </div>
                <div class="card">
                    <img src="/static/img/users.png" alt="PM2.5">
                    <h3>${pm25Value} µg/m³</h3>
                    <p>Partículas PM2.5</p>
                </div>
            `;
        } else {
            const co2PerCapita = countryData.co2_per_capita 
                ? countryData.co2_per_capita.toFixed(2) 
                : '--';
            const co2Level = getCO2Level(countryData.co2_per_capita);
            const totalCO2 = countryData.total_co2 
                ? countryData.total_co2.toFixed(2) 
                : '--';
            
            kpiContainer.innerHTML = `
                <div class="card" style="border-left: 4px solid ${getColorByCO2(countryData.co2_per_capita)}">
                    <img src="/static/img/co2.png" alt="CO2 per cápita">
                    <h3>${co2PerCapita} t</h3>
                    <p>CO₂ per cápita (toneladas)</p>
                </div>
                <div class="card">
                    <img src="/static/img/metrics.png" alt="Nivel emisiones">
                    <h3>${co2Level}</h3>
                    <p>Nivel de Emisiones</p>
                </div>
                <div class="card">
                    <img src="/static/img/target.png" alt="Total CO2">
                    <h3>${totalCO2} Mt</h3>
                    <p>Emisiones Totales (millones t)</p>
                </div>
                <div class="card">
                    <img src="/static/img/users.png" alt="País">
                    <h3>${countryData.name}</h3>
                    <p>País seleccionado</p>
                </div>
            `;
        }
    }

    function destroyCharts() {
        if (currentCharts.distribution) {
            currentCharts.distribution.destroy();
            currentCharts.distribution = null;
        }
        if (currentCharts.comparison) {
            currentCharts.comparison.destroy();
            currentCharts.comparison = null;
        }
    }

    function renderAirQualityCharts(data) {
        destroyCharts();
        
        const chartsContainer = document.getElementById('charts-container');
        chartsContainer.innerHTML = `
            <div class="chart-card">
                <h4>Distribución de Calidad del Aire</h4>
                <canvas id="aqi-distribution-chart"></canvas>
            </div>
            <div class="chart-card">
                <h4>Contaminantes vs Límites OMS</h4>
                <canvas id="pollutants-chart"></canvas>
            </div>
        `;

        const aqiCounts = {
            'Buena (1)': 0,
            'Regular (2)': 0,
            'Moderada (3)': 0,
            'Mala (4)': 0,
            'Muy Mala (5)': 0
        };

        data.forEach(country => {
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
        currentCharts.distribution = new Chart(ctxAqi, {
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
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        const avgPollutants = {
            'PM2.5': 0, 'PM10': 0, 'NO₂': 0, 'SO₂': 0, 'O₃': 0, 'CO': 0
        };

        const limits = {
            pm2_5: 15, pm10: 45, no2: 25, so2: 40, o3: 100, co: 4000
        };

        let validCountries = 0;
        data.forEach(country => {
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

        const ctxPollutants = document.getElementById('pollutants-chart').getContext('2d');
        currentCharts.comparison = new Chart(ctxPollutants, {
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
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: 'Promedio global (% sobre límite OMS)',
                        font: { size: 12 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                label += context.parsed.toFixed(1) + '% del límite';
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderCO2Charts(data) {
        destroyCharts();
        
        const chartsContainer = document.getElementById('charts-container');
        chartsContainer.innerHTML = `
            <div class="chart-card">
                <h4>Distribución de Emisiones CO₂</h4>
                <canvas id="co2-distribution-chart"></canvas>
            </div>
            <div class="chart-card">
                <h4>Top 10 Países Emisores</h4>
                <canvas id="co2-top-chart"></canvas>
            </div>
        `;

        const co2Levels = {
            'Muy Bajo': 0,
            'Bajo': 0,
            'Moderado': 0,
            'Alto': 0,
            'Muy Alto': 0
        };

        data.forEach(country => {
            if (country.co2_per_capita) {
                const level = getCO2Level(country.co2_per_capita);
                if (co2Levels[level] !== undefined) {
                    co2Levels[level]++;
                }
            }
        });

        const ctxDist = document.getElementById('co2-distribution-chart').getContext('2d');
        currentCharts.distribution = new Chart(ctxDist, {
            type: 'bar',
            data: {
                labels: Object.keys(co2Levels),
                datasets: [{
                    label: 'Número de países',
                    data: Object.values(co2Levels),
                    backgroundColor: [
                        'rgba(164, 214, 164, 0.7)',
                        'rgba(92, 184, 92, 0.7)',
                        'rgba(240, 173, 78, 0.7)',
                        'rgba(217, 83, 79, 0.7)',
                        'rgba(139, 0, 0, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        const validData = data.filter(c => c.co2_per_capita).sort((a, b) => b.co2_per_capita - a.co2_per_capita);
        const top10 = validData.slice(0, 10);

        const ctxTop = document.getElementById('co2-top-chart').getContext('2d');
        currentCharts.comparison = new Chart(ctxTop, {
            type: 'bar',
            data: {
                labels: top10.map(c => c.name),
                datasets: [{
                    label: 'CO₂ per cápita (toneladas)',
                    data: top10.map(c => c.co2_per_capita),
                    backgroundColor: top10.map(c => getColorByCO2(c.co2_per_capita) + 'B3'),
                    borderColor: top10.map(c => getColorByCO2(c.co2_per_capita)),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    }

    function renderView(view) {
        currentView = view;
        
        if (view === 'air-quality') {
            renderAirQualityMarkers(airQualityData);
            updateLegend('air-quality');
            updateKPICards(airQualityData[0] || {}, 'air-quality');
            renderAirQualityCharts(airQualityData);
        } else {
            renderCO2Markers(co2Data);
            updateLegend('co2-emissions');
            updateKPICards(co2Data[0] || {}, 'co2-emissions');
            renderCO2Charts(co2Data);
        }
    }

    document.querySelectorAll('.switch-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderView(this.dataset.view);
        });
    });

    renderView(currentView);
});