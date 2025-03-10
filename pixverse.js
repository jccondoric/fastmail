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
        <button id="paste-verification-button" style="margin-top: 8px; background-color: #28a745;">Pegar Código de Verificación</button>
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
      
      // Añadir eventos a los botones
      const pasteButton = document.getElementById('paste-credentials-button');
      pasteButton.addEventListener('click', pasteCredentials);
      
      const verificationButton = document.getElementById('paste-verification-button');
      verificationButton.addEventListener('click', pasteVerificationCode);
    }
    
    // Función para pegar las credenciales
    async function pasteCredentials() {
      const statusElement = document.getElementById('paste-status');
      statusElement.textContent = 'Pegando credenciales...';
      statusElement.className = 'processing';
      
      try {
        // Intentar primero desde localStorage
        const email = localStorage.getItem('pixverse_email');
        const username = localStorage.getItem('pixverse_username');
        const password = localStorage.getItem('pixverse_password');
        
        if (email && username && password) {
          // Usar información de localStorage
          fillFormFields(username, email, password);
          statusElement.textContent = 'Credenciales pegadas desde localStorage';
          statusElement.className = 'success';
          return;
        }
        
        // Si no hay datos en localStorage, intentar desde el portapapeles
        const clipboardText = await navigator.clipboard.readText();
        console.log('Contenido del portapapeles:', clipboardText);
        
        // Analizar el texto del portapapeles
        const emailMatch = clipboardText.match(/Email: ([^\n]+)/);
        const userMatch = clipboardText.match(/Usuario: ([^\n]+)/);
        const passwordMatch = clipboardText.match(/Contraseña: ([^\n]+)/);
        
        if (emailMatch && userMatch && passwordMatch) {
          const clipEmail = emailMatch[1].trim();
          const clipUsername = userMatch[1].trim();
          const clipPassword = passwordMatch[1].trim();
          
          console.log('Credenciales extraídas:', { clipEmail, clipUsername, clipPassword });
          
          // Guardar en localStorage para uso futuro
          localStorage.setItem('pixverse_email', clipEmail);
          localStorage.setItem('pixverse_username', clipUsername);
          localStorage.setItem('pixverse_password', clipPassword);
          
          // Completar los campos del formulario
          fillFormFields(clipUsername, clipEmail, clipPassword);
          
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
    
    // Función para pegar el código de verificación
    async function pasteVerificationCode() {
      const statusElement = document.getElementById('paste-status');
      statusElement.textContent = 'Pegando código de verificación...';
      statusElement.className = 'processing';
      
      try {
        // Intentar primero desde localStorage
        const storedCode = localStorage.getItem('pixverse_verification_code');
        
        if (storedCode) {
          // Usar el código desde localStorage
          fillVerificationCode(storedCode);
          statusElement.textContent = 'Código de verificación pegado desde localStorage';
          statusElement.className = 'success';
          return;
        }
        
        // Si no hay datos en localStorage, intentar desde el portapapeles
        const clipboardText = await navigator.clipboard.readText();
        
        // Intentar extraer código de verificación
        const codeMatch = clipboardText.match(/Código: (\d{6})/);
        
        // Si no hay un formato "Código: XXXXXX", verificar si es solo un número de 6 dígitos
        if (codeMatch) {
          const code = codeMatch[1].trim();
          fillVerificationCode(code);
          
          // Guardar en localStorage
          localStorage.setItem('pixverse_verification_code', code);
          
          statusElement.textContent = 'Código de verificación pegado con éxito';
          statusElement.className = 'success';
        } else if (/^\d{6}$/.test(clipboardText.trim())) {
          // Es solo un número de 6 dígitos
          const code = clipboardText.trim();
          fillVerificationCode(code);
          
          // Guardar en localStorage
          localStorage.setItem('pixverse_verification_code', code);
          
          statusElement.textContent = 'Código de verificación pegado con éxito';
          statusElement.className = 'success';
        } else {
          statusElement.textContent = 'No se encontró un código de verificación válido';
          statusElement.className = 'error';
        }
      } catch (error) {
        console.error('Error al acceder al portapapeles:', error);
        statusElement.textContent = 'Error: No se pudo acceder al portapapeles';
        statusElement.className = 'error';
      }
    }
    
    // Función para completar el campo de código de verificación
    function fillVerificationCode(code) {
      const codeField = document.getElementById('Code');
      if (codeField) {
        codeField.value = code;
        // Disparar evento de cambio para activar validaciones
        triggerInputEvent(codeField);
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