chrome.runtime.onInstalled.addListener(() => {
  console.log('La extensión está lista.');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "on-icon") {
    chrome.action.setIcon({ path: "/icons/on_icon128.png" });
  }
  if (msg.action === "off-icon") {
    chrome.action.setIcon({ path: "/icons/icon128.png" });
  }
});