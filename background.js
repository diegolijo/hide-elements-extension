chrome.runtime.onInstalled.addListener(() => {
  console.log('La extensión está lista.');
});

let lastRemovedElementHtml = '';    // Guardar el HTML del elemento eliminado para enviar al popup

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "on-icon") {
    chrome.action.setIcon({ path: "/icons/on_icon128.png" });
  }
  if (msg.action === "off-icon") {
    chrome.action.setIcon({ path: "/icons/icon128.png" });
  }
  if (msg.action === "element-removed") {
    lastRemovedElementHtml = msg.html;
    sendResponse({ status: "Element saved" });
  }
  /* POPUP */
  if (msg.action === "get-last-element") {
    sendResponse({ html: lastRemovedElementHtml });    // Enviar el último elemento eliminado al popup
  }
});