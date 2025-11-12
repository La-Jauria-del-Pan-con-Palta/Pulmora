let selectedEmoji = '🙂';
let uploadedImage = null;

function selectEmoji(emoji) {
    selectedEmoji = emoji;
    uploadedImage = null;
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
    const nombre = document.getElementById('nombre').value || 'Tu Nombre';
    const pais = document.getElementById('pais').value;
    const bio = document.getElementById('bio').value || 'Tu biografía aparecerá aquí';
    const objetivo = document.getElementById('objetivo').value || 'Tu objetivo aparecerá aquí';

    const paisEmoji = pais ? document.getElementById('pais').options[document.getElementById('pais').selectedIndex].text.split(' ')[0] : '';

    document.getElementById('previewNombre').textContent = nombre;
    document.getElementById('previewBio').textContent = `${paisEmoji} ${bio}`;
    document.getElementById('previewObjetivo').textContent = objetivo;

    if (!uploadedImage) {
        document.getElementById('previewAvatar').textContent = selectedEmoji;
    }

    document.getElementById('previewCard').style.display = 'block';
    document.getElementById('previewCard').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Aquí iría la lógica para enviar los datos al backend Django
    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        pais: document.getElementById('pais').value,
        bio: document.getElementById('bio').value,
        objetivo: document.getElementById('objetivo').value,
        intereses: document.getElementById('intereses').value,
        nivel: document.getElementById('nivel').value,
        publico: document.getElementById('publico').checked,
        avatar: uploadedImage || selectedEmoji
    };

    console.log('Datos del perfil:', formData);

    // Mostrar mensaje de éxito
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
});