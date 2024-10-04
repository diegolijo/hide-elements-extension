let hideModeEnabled = false;

// Opciones de cursor
const cursorOptions = [
  'none',
  'pointer',
  'crosshair',
  'not-allowed'
];

let currentCursorIndex = 0;

document.addEventListener('click', function (event) {
  if (hideModeEnabled) {
    event.preventDefault();
    event.stopPropagation();
    const element = event.target;
    try {
      console.log('element.parentNode ', element.parentNode);
      // Primer intento: elimina el elemento del DOM
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (e) {
      console.error('removeChild:', e);
      // Si falla,  ocultar el elemento con display: none
      element.style.setProperty('display', 'none', 'important');
    }
  }
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle-hide-mode") {
    hideModeEnabled = !hideModeEnabled;
    if (hideModeEnabled) {
      document.body.classList.add('hide-cursor'); // Añade clase para cambiar el cursor
      document.body.classList.remove('is-not-login'); // Elimina la clase is-not-login
      document.body.style.setProperty('overflow', 'auto', 'important');
      chrome.runtime.sendMessage({ action: 'on-icon', value: true }); // enviamos a background cambiar el icono
      sendResponse({ status: "Hide mode enabled" });
    }
    if (!hideModeEnabled) {
      document.body.classList.remove('hide-cursor');
      chrome.runtime.sendMessage({ action: 'off-icon', value: true }); // enviamos a background cambiar el icono
      sendResponse({ status: "Hide mode disabled" });
    }
  }
});