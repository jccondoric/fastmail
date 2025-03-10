// content.js
(function() {
    // Crear el panel de la extensión y añadirlo a la página
    function createPanel() {
      // Verificar si el panel ya existe para evitar duplicados
      if (document.getElementById('temp-mail-generator-panel')) {
        return;
      }
      
      // Crear el panel de la extensión
      const panel = document.createElement('div');
      panel.id = 'temp-mail-generator-panel';
      panel.innerHTML = `
        <div class="temp-mail-generator-header">Generador de Email</div>
        <button id="temp-mail-generator-button">Crear Nuevo Email</button>
        
        <div class="info-container">
          <div class="info-label">Email:</div>
          <div id="email-display" class="info-value"></div>
        </div>
        
        <div class="info-container">
          <div class="info-label">Usuario:</div>
          <div id="username-display" class="info-value"></div>
        </div>
        
        <div class="info-container">
          <div class="info-label">Contraseña:</div>
          <div id="password-display" class="info-value"></div>
        </div>
        
        <button id="copy-info-button" disabled>Copiar toda la información</button>
        
        <div id="temp-mail-generator-status">Listo para generar</div>
      `;
      
      // Añadir el panel a la página (justo antes del input de email)
      const mailInput = document.getElementById('mail');
      if (mailInput && mailInput.parentNode) {
        mailInput.parentNode.insertBefore(panel, mailInput);
      } else {
        // Si no se encuentra el input de email, añadirlo al principio del body
        document.body.insertBefore(panel, document.body.firstChild);
      }
      
      // Añadir el evento click al botón de generar
      const generateButton = document.getElementById('temp-mail-generator-button');
      generateButton.addEventListener('click', generateAndWaitForEmail);
      
      // Añadir el evento click al botón de copiar
      const copyButton = document.getElementById('copy-info-button');
      copyButton.addEventListener('click', copyAllInfo);
    }
    
    // Función para obtener el email actual de la página
    function getCurrentEmail() {
      const mailInput = document.getElementById('mail');
      return mailInput ? mailInput.value : '';
    }
    
    // Función para generar un nuevo email y esperar hasta que se genere
    function generateAndWaitForEmail() {
      const statusElement = document.getElementById('temp-mail-generator-status');
      statusElement.textContent = 'Generando email...';
      statusElement.className = 'generating';
      
      // Resetear los campos de información
      document.getElementById('email-display').textContent = '';
      document.getElementById('username-display').textContent = '';
      document.getElementById('password-display').textContent = '';
      document.getElementById('copy-info-button').disabled = true;
      
      // Hacer clic en el botón borrar para generar un nuevo email
      const deleteButton = document.getElementById('click-to-delete');
      if (!deleteButton) {
        statusElement.textContent = 'Error: No se encontró el botón de borrar';
        statusElement.className = 'error';
        return;
      }
      
      // Guardar el email actual para comparar
      const currentEmail = getCurrentEmail();
      console.log('Email actual antes de generar:', currentEmail);
      
      // Hacer clic en el botón borrar
      deleteButton.click();
      
      // Comprobar periódicamente si se ha generado un nuevo email
      let checkAttempts = 0;
      const maxAttempts = 40; // 40 intentos * 250ms = 10 segundos máximo
      
      const checkInterval = setInterval(() => {
        checkAttempts++;
        const newEmail = getCurrentEmail();
        console.log('Comprobando email (intento ' + checkAttempts + '):', newEmail);
        
        // Verificar si el email ha cambiado y es válido
        if (newEmail && newEmail !== currentEmail && newEmail !== 'Cargando' && newEmail.includes('@')) {
          // Se ha generado un nuevo email
          clearInterval(checkInterval);
          
          // Actualizar el estado
          statusElement.textContent = `Email generado con éxito`;
          statusElement.className = 'success';
          
          // Actualizar los campos de información
          updateInfoFields(newEmail);
        } else if (checkAttempts >= maxAttempts) {
          // Tiempo de espera agotado
          clearInterval(checkInterval);
          statusElement.textContent = 'Tiempo de espera agotado. Intenta de nuevo.';
          statusElement.className = 'error';
        }
      }, 250); // Comprobar cada 250ms para mayor precisión
    }
    
    // Función para actualizar los campos de información
    function updateInfoFields(email) {
      console.log('Actualizando campos con email:', email);
      
      // Obtener las partes del email
      const parts = email.split('@');
      const username = parts[0];
      const domain = parts[1];
      
      // Generar la contraseña (usuario + @ + primera letra del dominio)
      const password = username + '@' + domain.charAt(0);
      
      // Actualizar los campos
      document.getElementById('email-display').textContent = email;
      document.getElementById('username-display').textContent = username;
      document.getElementById('password-display').textContent = password;
      
      // Habilitar el botón de copiar
      document.getElementById('copy-info-button').disabled = false;
    }
    
    // Función para copiar toda la información
    function copyAllInfo() {
      const email = document.getElementById('email-display').textContent;
      const username = document.getElementById('username-display').textContent;
      const password = document.getElementById('password-display').textContent;
      
      const infoText = `Email: ${email}\nUsuario: ${username}\nContraseña: ${password}`;
      
      navigator.clipboard.writeText(infoText)
        .then(() => {
          const statusElement = document.getElementById('temp-mail-generator-status');
          statusElement.textContent = 'Información copiada al portapapeles';
          statusElement.className = 'success';
        })
        .catch((err) => {
          console.error('Error al copiar: ', err);
          const statusElement = document.getElementById('temp-mail-generator-status');
          statusElement.textContent = 'Error al copiar la información';
          statusElement.className = 'error';
        });
    }
    
    // También observar cambios en el campo de email
    function setupEmailChangeObserver() {
      const mailInput = document.getElementById('mail');
      if (!mailInput) return;
      
      // Observar cambios en el valor del campo de email
      const emailObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            const newEmail = mailInput.value;
            if (newEmail && newEmail !== 'Cargando' && newEmail.includes('@')) {
              console.log('Valor del email detectado cambiado:', newEmail);
              
              // Actualizar campos si no están actualizados ya
              const currentDisplayedEmail = document.getElementById('email-display').textContent;
              if (currentDisplayedEmail !== newEmail) {
                updateInfoFields(newEmail);
                
                const statusElement = document.getElementById('temp-mail-generator-status');
                statusElement.textContent = 'Email detectado automáticamente';
                statusElement.className = 'success';
              }
            }
          }
        });
      });
      
      emailObserver.observe(mailInput, { attributes: true });
    }
    
    // También escuchar cambios directos en el valor del input
    function setupValueChangeListener() {
      const mailInput = document.getElementById('mail');
      if (!mailInput) return;
      
      // Usar un MutationObserver para detectar cuando el campo de email podría haber cambiado
      const observer = new MutationObserver(() => {
        const newEmail = mailInput.value;
        if (newEmail && newEmail !== 'Cargando' && newEmail.includes('@')) {
          const currentDisplayedEmail = document.getElementById('email-display').textContent;
          if (currentDisplayedEmail !== newEmail) {
            console.log('Email detectado en listener:', newEmail);
            updateInfoFields(newEmail);
          }
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Comprobar periódicamente también (como backup)
      setInterval(() => {
        const newEmail = mailInput.value;
        if (newEmail && newEmail !== 'Cargando' && newEmail.includes('@')) {
          const currentDisplayedEmail = document.getElementById('email-display').textContent;
          if (currentDisplayedEmail !== newEmail) {
            console.log('Email detectado en intervalo:', newEmail);
            updateInfoFields(newEmail);
          }
        }
      }, 1000);
    }
    
    // Ejecutar cuando la página esté completamente cargada
    function initialize() {
      createPanel();
      setupEmailChangeObserver();
      setupValueChangeListener();
      
      // Si ya hay un email, mostrarlo
      const currentEmail = getCurrentEmail();
      if (currentEmail && currentEmail !== 'Cargando' && currentEmail.includes('@')) {
        updateInfoFields(currentEmail);
        document.getElementById('copy-info-button').disabled = false;
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
    
    // Observar cambios en el DOM para manejar recargas dinámicas o SPAs
    const observer = new MutationObserver((mutations) => {
      if (!document.getElementById('temp-mail-generator-panel')) {
        initialize();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  })();