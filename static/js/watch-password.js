document.addEventListener("DOMContentLoaded", function () {
    const setupPasswordToggle = (toggleId, passwordId) => {
        const toggleIcon = document.getElementById(toggleId);
        const passwordInput = document.getElementById(passwordId);

        if (!toggleIcon || !passwordInput) {
            console.warn(`Elementos no encontrados para el toggle: ${toggleId} o el campo de contraseña: ${passwordId}.`);
            return;
        }

        toggleIcon.addEventListener("click", function () {
            console.log(`Click event detected for toggleIcon: ${toggleId}`);
            const currentType = passwordInput.getAttribute("type");
            const newType = currentType === "password" ? "text" : "password";
            passwordInput.setAttribute("type", newType);
            
            this.classList.toggle("fa-eye-slash");
            console.log(`Password input (${passwordId}) type changed from ${currentType} to ${newType}.`);
        });
    };

    setupPasswordToggle("togglePassword", "id_password");
    setupPasswordToggle("togglePassword1", "id_password1");
    setupPasswordToggle("togglePassword2", "id_password2");
});