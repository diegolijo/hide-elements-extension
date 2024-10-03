let hideModeEnabled = false;

document.addEventListener('click', function (event) {
  if (hideModeEnabled) {
    event.preventDefault();
    event.stopPropagation();

    // Aplica el estilo display: none !important al elemento clickeado
    const element = event.target;
    element.style.setProperty('display', 'none', 'important');

    // Deshabilitar el modo de ocultar
    hideModeEnabled = false;
    document.body.classList.remove('hide-cursor');
  }
}, true);

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enableHideMode") {
    hideModeEnabled = true;
    document.body.classList.add('hide-cursor'); // Añade clase para cambiar el cursor
    document.body.classList.remove('is-not-login'); // Elimina la clase is-not-login
    console.log('styles ', document.body.classList);
    sendResponse({ status: "Hide mode enabled" }); 
  }
});