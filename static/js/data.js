document.addEventListener('DOMContentLoaded', function() {

    const map = L.map('interactive-map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    } ).addTo(map);

    setTimeout(function() {
        map.invalidateSize();
    }, 100)
});