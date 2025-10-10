document.addEventListener('DOMContentLoaded', function () {

    const setupPasswordToggle = (toggleId, passwordId) => {
        const toggleIcon = document.getElementById(toggleId);
        const passwordInput = document.getElementById(passwordId);

        if (!toggleIcon || !passwordInput) {
            return;
        }

        toggleIcon.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            this.classList.toggle('fa-eye-slash');
        });
    };

    setupPasswordToggle('togglePassword', 'id_password');

    setupPasswordToggle('togglePassword1', 'id_password');
    setupPasswordToggle('togglePassword2', 'id_password2');

});