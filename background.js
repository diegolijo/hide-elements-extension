chrome.runtime.onInstalled.addListener(() => {
  console.log('La extensión está lista.');
});

const ICONS_ON = {
  16: '/icons/app-icon-on-16.png',
  32: '/icons/app-icon-on-32.png',
  48: '/icons/app-icon-on-48.png',
  128: '/icons/app-icon-on-128.png'
};

const ICONS_OFF = {
  16: '/icons/app-icon-16.png',
  48: '/icons/app-icon-48.png',
  128: '/icons/app-icon-128.png'
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'on-icon') {
    chrome.action.setIcon({ path: ICONS_ON });
  }
  if (msg.action === 'off-icon') {
    chrome.action.setIcon({ path: ICONS_OFF });
  }
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.tabs.query({}, (tabs) => {
    (tabs || []).forEach((tab) => {
      if (tab.id === info.tabId) {
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'deactivate-hide-mode' }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
  chrome.tabs.sendMessage(info.tabId, { action: 'sync-icon' }, (response) => {
    if (chrome.runtime.lastError || !response || !response.enabled) {
      chrome.action.setIcon({ path: ICONS_OFF });
    }
  });
});
