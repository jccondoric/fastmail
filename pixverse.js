// pixverse.js
(function() {
    // Función para crear el panel de pegado
    function createPastePanel() {
      // Verificar si el panel ya existe para evitar duplicados
      if (document.getElementById('temp-mail-paste-panel')) {
        return;
      }
      
      // Crear el panel
      const panel = document.createElement('div');
      panel.id = 'temp-mail-paste-panel';
      panel.innerHTML = `
        <div class="temp-mail-paste-header">Auto-completar Registro</div>
        <button id="paste-credentials-button">Pegar Credenciales</button>
        <div id="paste-status">Haz clic para pegar tus credenciales</div>
      `;
      
      // Añadir el panel al inicio del formulario
      const registerForm = document.querySelector('form');
      if (registerForm) {
        registerForm.insertBefore(panel, registerForm.firstChild);
      } else {
        // Si no se encuentra el formulario, añadirlo al principio del body
        document.body.insertBefore(panel, document.body.firstChild);
      }
      
      // Añadir evento al botón
      const pasteButton = document.getElementById('paste-credentials-button');
      pasteButton.addEventListener('click', pasteCredentials);
    }
    
    // Función para pegar las credenciales
    async function pasteCredentials() {
      const statusElement = document.getElementById('paste-status');
      statusElement.textContent = 'Pegando credenciales...';
      statusElement.className = 'processing';
      
      try {
        // Leer del portapapeles
        const clipboardText = await navigator.clipboard.readText();
        console.log('Contenido del portapapeles:', clipboardText);
        
        // Analizar el texto del portapapeles
        const emailMatch = clipboardText.match(/Email: ([^\n]+)/);
        const userMatch = clipboardText.match(/Usuario: ([^\n]+)/);
        const passwordMatch = clipboardText.match(/Contraseña: ([^\n]+)/);
        
        if (emailMatch && userMatch && passwordMatch) {
          const email = emailMatch[1].trim();
          const username = userMatch[1].trim();
          const password = passwordMatch[1].trim();
          
          console.log('Credenciales extraídas:', { email, username, password });
          
          // Completar los campos del formulario
          fillFormFields(username, email, password);
          
          statusElement.textContent = 'Credenciales pegadas con éxito';
          statusElement.className = 'success';
        } else {
          statusElement.textContent = 'Formato de credenciales no reconocido';
          statusElement.className = 'error';
        }
      } catch (error) {
        console.error('Error al acceder al portapapeles:', error);
        statusElement.textContent = 'Error: No se pudo acceder al portapapeles';
        statusElement.className = 'error';
      }
    }
    
    // Función para completar los campos del formulario
    function fillFormFields(username, email, password) {
      // Buscar los campos del formulario
      const usernameField = document.getElementById('Username');
      const emailField = document.getElementById('Mail');
      const passwordField = document.getElementById('Password');
      const confirmPasswordField = document.getElementById('ConfirmPassword');
      
      // Completar los campos si existen
      if (usernameField) {
        usernameField.value = username;
        // Disparar evento de cambio para activar validaciones
        triggerInputEvent(usernameField);
      }
      
      if (emailField) {
        emailField.value = email;
        triggerInputEvent(emailField);
      }
      
      if (passwordField) {
        passwordField.value = password;
        triggerInputEvent(passwordField);
      }
      
      if (confirmPasswordField) {
        confirmPasswordField.value = password;
        triggerInputEvent(confirmPasswordField);
      }
    }
    
    // Función para disparar eventos de input para simular la entrada manual
    function triggerInputEvent(element) {
      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
      
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
    }
    
    // Inicializar cuando la página esté cargada
    function initialize() {
      createPastePanel();
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
    
    // Observar cambios en el DOM para manejar carga dinámica
    const observer = new MutationObserver((mutations) => {
      if (!document.getElementById('temp-mail-paste-panel')) {
        initialize();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  })();