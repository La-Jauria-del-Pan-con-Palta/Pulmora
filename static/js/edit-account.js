let selectedEmoji = '🙂';
let uploadedImage = null;
let currentAvatar = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarDatosExistentes();
});

function cargarDatosExistentes() {
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarEmoji = document.getElementById('avatarEmoji');

    const imgElement = avatarEmoji.querySelector('img');
    if (imgElement) {
        uploadedImage = imgElement.src;
        currentAvatar = imgElement.src;
    } else {
        const emojiText = avatarEmoji.textContent.trim();
        selectedEmoji = emojiText || '🙂';
        currentAvatar = emojiText || '🙂';
    }
}

function selectEmoji(emoji) {
    selectedEmoji = emoji;
    uploadedImage = null;
    document.getElementById('avatarEmoji').textContent = emoji;
    document.getElementById('previewAvatar').textContent = emoji;

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

    let avatarToSave;
    if (uploadedImage) {
        avatarToSave = uploadedImage;
    } else if (selectedEmoji !== currentAvatar && selectedEmoji !== '🙂') {
        avatarToSave = selectedEmoji;
    } else {
        avatarToSave = currentAvatar;
    }
    const formData = {
        avatar: avatarToSave,
        bio: document.getElementById('bio').value,
        pais: document.getElementById('pais').value,
        objetivo: document.getElementById('objetivo').value
    };

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (username && username !== document.getElementById('username').defaultValue) {
        formData.username = username;
    }
    
    if (email && email !== document.getElementById('email').defaultValue) {
        formData.email = email;
    }

    const csrftoken = getCookie('csrftoken');

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
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                successMsg.style.display = 'none';
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