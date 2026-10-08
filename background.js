chrome.runtime.onInstalled.addListener(() => {
  console.log('La extensión está lista.');
});

const ICONS_ON = {
  16: '/icons/on_icon16.png',
  48: '/icons/on_icon48.png',
  128: '/icons/on_icon128.png'
};

const ICONS_OFF = {
  16: '/icons/icon16.png',
  48: '/icons/icon48.png',
  128: '/icons/icon128.png'
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'on-icon') {
    chrome.action.setIcon({ path: ICONS_ON });
  }
  if (msg.action === 'off-icon') {
    chrome.action.setIcon({ path: ICONS_OFF });
  }
});
