let hideModeEnabled = false;
let currentlyHighlightedElement = null;
let currentCursorIndex = 0;
// Opciones de cursor
const cursorOptions = [
  'none',
  'pointer',
  'crosshair',
  'not-allowed'
];


document.addEventListener('click', function (event) {
  if (!hideModeEnabled) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const element = event.target;
  try {
    console.log('element.parentNode ', element.parentNode);
    // Almacenar el elemento a HTML para enviar
    const elementHtml = element.outerHTML;
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    // Enviar mensaje al background script con el HTML del elemento
    chrome.runtime.sendMessage({ action: "element-removed", html: elementHtml });
  } catch (e) {
    console.error('removeChild:', e);
    // Si falla, intenta ocultar el elemento con display: none
    element.style.setProperty('display', 'none', 'important');
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



// Listener para cambiar el color de fondo al pasar el ratón
document.addEventListener('mouseover', function (event) {
  if (!hideModeEnabled) {
    return;
  }
  const element = event.target;
  // Si hay un elemento actualmente resaltado, restaurar su color original
  if (currentlyHighlightedElement && currentlyHighlightedElement !== element) {
    currentlyHighlightedElement.style.setProperty('background-color', currentlyHighlightedElement.dataset.originalBackgroundColor || '', 'important');
    currentlyHighlightedElement.style.setProperty('background', currentlyHighlightedElement.dataset.originalBackgroundColor || '', 'important');
    currentlyHighlightedElement.removeAttribute('data-original-background-color');
  }
  // Guarda el color de fondo original si aún no se ha guardado
  if (!element.dataset.originalBackgroundColor) {
    element.dataset.originalBackgroundColor = window.getComputedStyle(element).backgroundColor;
  }
  // Cambiar el color de fondo a rojo con !important
  element.style.setProperty('background-color', '#FF0000AA', 'important');
  currentlyHighlightedElement = element;
}, true);



// Listener para restaurar el color de fondo original al dejar de pasar el ratón
document.addEventListener('mouseout', function (event) {
  if (!hideModeEnabled) {
    return;
  }
  const element = event.target;
  if (element === currentlyHighlightedElement) {
    // Restaurar el color de fondo al original con !important
    element.style.setProperty('background-color', element.dataset.originalBackgroundColor || '', 'important');
    element.style.setProperty('background', element.dataset.originalBackgroundColor || '', 'important');
    element.removeAttribute('data-original-background-color');

    // Resetear la variable
    currentlyHighlightedElement = null;
  }
}, true);