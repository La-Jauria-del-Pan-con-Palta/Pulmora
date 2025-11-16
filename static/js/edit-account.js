let selectedEmoji = '🙂';
let uploadedImage = null;
let currentAvatar = null; // Guardar el avatar actual

// Cargar datos existentes del perfil al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosExistentes();
});

function cargarDatosExistentes() {
    // Detectar si hay una imagen o emoji cargado
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarEmoji = document.getElementById('avatarEmoji');
    
    // Si hay una imagen en el avatar
    const imgElement = avatarEmoji.querySelector('img');
    if (imgElement) {
        uploadedImage = imgElement.src;
        currentAvatar = imgElement.src; // Guardar como avatar actual
    } else {
        // Es un emoji
        const emojiText = avatarEmoji.textContent.trim();
        selectedEmoji = emojiText || '🙂';
        currentAvatar = emojiText || '🙂'; // Guardar como avatar actual
    }
}

function selectEmoji(emoji) {
    selectedEmoji = emoji;
    uploadedImage = null; // Limpiar imagen subida porque ahora usamos emoji
    document.getElementById('avatarEmoji').textContent = emoji;
    document.getElementById('previewAvatar').textContent = emoji;

    // Update selected state
    document.querySelectorAll('.emoji-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.emoji === emoji) {
            opt.classList.add('selected');
        }
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage = e.target.result;
            document.getElementById('avatarPreview').innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
            document.getElementById('previewAvatar').innerHTML = `<img src="${e.target.result}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        };
        reader.readAsDataURL(file);
    }
}

function previewProfile() {
    const pais = document.getElementById('pais').value;
    const bio = document.getElementById('bio').value || 'Tu biografía aparecerá aquí';
    const objetivo = document.getElementById('objetivo').value || 'Tu objetivo aparecerá aquí';

    const paisEmoji = pais ? document.getElementById('pais').options[document.getElementById('pais').selectedIndex].text.split(' ')[0] : '';

    document.getElementById('previewBio').textContent = `${paisEmoji} ${bio}`;
    document.getElementById('previewObjetivo').textContent = objetivo;

    // Actualizar avatar en preview
    const previewAvatar = document.getElementById('previewAvatar');
    if (uploadedImage) {
        previewAvatar.innerHTML = `<img src="${uploadedImage}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        previewAvatar.textContent = selectedEmoji;
    }

    document.getElementById('previewCard').style.display = 'block';
    document.getElementById('previewCard').scrollIntoView({ behavior: 'smooth' });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Determinar qué avatar usar
    let avatarToSave;
    if (uploadedImage) {
        // Si hay una imagen subida en esta sesión, usarla
        avatarToSave = uploadedImage;
    } else if (selectedEmoji !== currentAvatar && selectedEmoji !== '🙂') {
        // Si seleccionó un emoji diferente al actual, usarlo
        avatarToSave = selectedEmoji;
    } else {
        // Mantener el avatar actual (imagen o emoji)
        avatarToSave = currentAvatar;
    }

    // Recopilar datos del formulario
    const formData = {
        avatar: avatarToSave,
        bio: document.getElementById('bio').value,
        pais: document.getElementById('pais').value,
        objetivo: document.getElementById('objetivo').value
    };

    // Solo incluir username y email si fueron modificados
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (username && username !== document.getElementById('username').defaultValue) {
        formData.username = username;
    }
    
    if (email && email !== document.getElementById('email').defaultValue) {
        formData.email = email;
    }

    // Obtener el token CSRF
    const csrftoken = getCookie('csrftoken');

    // Enviar datos al servidor Django
    fetch('/update_profile/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de éxito
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                successMsg.style.display = 'none';
                // Redirigir a la página de perfil
                window.location.href = '/account/';
            }, 2000);
        } else {
            alert('Error al guardar el perfil: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al guardar el perfil. Por favor, intenta de nuevo.');
    });
});