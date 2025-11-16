# Pulmora - Documentación

## 📋 Índice
- [Descripción General](#descripción-general)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)
- [Estado del Proyecto](#estado-del-proyecto)
- [Soporte](#soporte)

## 📖 Descripción General

Pulmora es una comunidad web, enfocada en la concientización del cambio climatico y con retos activos e historias comunitarias se superación, cuenta con un asistente virtual llamado **Pulmorin**, potenciado por la API de Gemini de Google. El proyecto está diseñado para ofrecer una experiencia interactiva relacionada con temas ambientales y calidad del aire.

## ✨ Características

### Pulmorin - Asistente Virtual
- 🤖 Chatbot integrado con API de Gemini
- 💬 Interfaz de conversación intuitiva
- 🎨 Widget provisional en desarrollo
- ⚡ Respuestas en tiempo real

### Funcionalidades Actuales (v1.5)
- Sistema de chat funcional
- Integración con Gemini AI
- Interfaz web responsiva
- Información sobre CO2 y calidad del aire
- Sistema de retos activos temporales o permanentes
- Sistema de historias comunitarias comentables y likeables

## 🔧 Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Django 3.x o 4.x
- Cuenta de Google Cloud con acceso a Gemini API
- Cuenta de OpenWheater con acceso a la API
- Git

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/La-Jauria-del-Pan-con-Palta/Pulmora.git
cd Pulmora
```

### 2. Crear Entorno Virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
SECRET_KEY=tu_clave_secreta_django
DEBUG=True
GEMINI_API_KEY=tu_api_key_de_gemini
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 5. Realizar Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear Superusuario (Opcional)

```bash
python manage.py createsuperuser
```

## ⚙️ Configuración

### Configuración de Gemini API

1. Obtén tu API Key desde [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Añade la clave en el archivo `.env`
3. Asegúrate de que la aplicación tenga acceso a la variable de entorno

### Configuración de Base de Datos

Por defecto, el proyecto usa SQLite. Para usar PostgreSQL o MySQL:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pulmora_db',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_contraseña',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 🚀 Uso

### Iniciar el Servidor de Desarrollo

```bash
python manage.py runserver
```

La aplicación estará disponible en: `http://localhost:8000`

### Acceder al Panel de Administración

```
http://localhost:8000/admin
```

## Explora la comunidad
1. Navega a la pagina principal
2. Busca el botón llamado comunidad
3. Inicia sesión para poder crear una historia
4. Participa en algún reto activo

### Explora los datos
1. Navega a la pagina principal
2. Busca el botón llamado datos
3. Escoge los datos a revisar
4. Da click en el pais de referencia para conocer sus datos


### Explora los recursos educativos
1. Navega a la pagina principal
2. Busca el botón llamado educación
3. Navega entre los diferentes apartados
4. Da click en el paper/video/web-site a revisar

### Interactuar con Pulmorin

1. Navega a la página principal
2. Busca el widget de chat de Pulmorin
3. Escribe tu mensaje y presiona Enter
4. Pulmorin responderá utilizando la API de Gemini

## 💻 Desarrollo

### Debugging

> ⚠️ **IMPORTANTE**: Para debuggear correctamente, utiliza el comando de terminal:

```bash
python manage.py runserver
```

**NO** uses el debugger integrado de VS Code, ya que no funcionará correctamente con la configuración actual del proyecto.

### Trabajar con Branches

#### Crear tu Propia Branch

```bash
# Crear y cambiar a una nueva branch
git checkout -b nombre_de_tu_branch
```

#### Sincronizar con el Repositorio Remoto

```bash
# Ver branches disponibles
git branch -a

# Cambiar a una branch existente
git checkout nombre_branch

# Actualizar tu branch
git pull origin nombre_branch
```

### Workflow de Git Recomendado

```bash
# 1. Actualizar tu branch local
git pull origin main

# 2. Crear una nueva branch para tu feature
git checkout -b feature/nombre-descriptivo

# 3. Hacer cambios y commits
git add .
git commit -m "Descripción clara de los cambios"

# 4. Subir tu branch
git push origin feature/nombre-descriptivo

# 5. Crear Pull Request en GitHub
```

## 📁 Estructura del Proyecto

```
Pulmora/
├── manage.py                 # Script principal de Django
├── requirements.txt          # Dependencias del proyecto
├── .env                      # Variables de entorno (no incluido en repo)
├── .gitignore               # Archivos ignorados por Git
├── pulmora/                 # Carpeta principal del proyecto
│   ├── __init__.py
│   ├── settings.py          # Configuración de Django
│   ├── urls.py              # Rutas principales
│   ├── wsgi.py              # Configuración WSGI
│   └── asgi.py              # Configuración ASGI
├── apps/                    # Aplicaciones del proyecto
│   ├── chat/                # App del chatbot Pulmorin
│   │   ├── views.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   └── templates/
│   └── core/                # App principal
│       ├── views.py
│       ├── models.py
│       └── templates/
├── static/                  # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
├── media/                   # Archivos subidos por usuarios
└── templates/               # Templates globales
    └── base.html
```

## 🤝 Contribución

### Guías de Contribución

1. **No modifiques archivos principales directamente**: Si encuentras algo que quieres cambiar, crea tu propia branch
2. **Commits descriptivos**: Usa mensajes claros que expliquen QUÉ y POR QUÉ cambias algo
3. **Code Review**: Todos los cambios deben pasar por Pull Request antes de merge a main
4. **Testing**: Prueba tus cambios antes de hacer push
5. **Documentación**: Actualiza la documentación si añades nuevas funcionalidades

### Proceso de Pull Request

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
6. Espera la revisión del equipo

### Estándares de Código

- **Python**: Sigue PEP 8
- **JavaScript**: Usa ES6+
- **HTML/CSS**: Mantén estructura semántica
- **Nombres de variables**: Descriptivos y en inglés
- **Comentarios**: Explica lógica compleja, no código obvio

## 📊 Estado del Proyecto

### Versión Actual: v1.5 (Funcional)

#### ✅ Completado
- Integración básica con Gemini API
- Sistema de chat funcional
- Interfaz web provisional
- Sistema de historias comunitariass
- Personalización completa de perfil | Foto, biografia, motivación etc.
- Sistema de logros por usuario
- Pagina con recursos educativos
- Sistema de consulta de datos ambientales


## 📞 Soporte

### ¿Necesitas Ayuda?

- **Equipo**: La Jauría del Pan con Palta
- **Email**: egallardog@usm.cl

### Recursos Útiles

- [Django Documentation](https://docs.djangoproject.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python Best Practices](https://pep8.org/)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## 👥 Equipo

**La Jauría del Pan con Palta**

---

## 🎯 Notas Importantes para Desarrolladores

### Antes de Empezar
1. ✅ Lee toda esta documentación
2. ✅ Configura tu entorno local correctamente
3. ✅ Crea tu propia branch de trabajo
4. ✅ No modifiques archivos principales en main
5. ✅ Usa `python manage.py runserver` para debug

### Buenas Prácticas
- 🔄 Pull frecuentemente de main para evitar conflictos
- 💾 Commits pequeños y frecuentes
- 📝 Documenta funciones complejas
- 🧪 Testea antes de push
- 🤝 Comunícate con el equipo

---

**Última actualización**: Noviembre 2024  
**Versión del documento**: 1.5
