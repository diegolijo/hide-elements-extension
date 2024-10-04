chrome.runtime.onInstalled.addListener(() => {
  console.log('La extensión está lista.');
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === "onIcon") {
    chrome.action.setIcon({ path: "/icons/icon128.png" });
  }
  if (msg.action === "offIcon") {
    chrome.action.setIcon({ path: "/icons/off_icon128.png" });
  }
});