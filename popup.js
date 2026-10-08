setTimeout(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      window.close();
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-hide-mode' }, () => {
      void chrome.runtime.lastError;
      window.close();
    });
  });
}, 1);
