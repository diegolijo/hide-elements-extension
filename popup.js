const displayArea = document.createElement('div');
document.body.appendChild(displayArea);

setTimeout(() => {
    queryTabs({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length === 0) {
            return console.log('No active tab found.');
        }
        return sendMessage(tabs[0].id, { action: 'toggle-hide-mode' });
    }).then(response => {
        console.log('queryTabs them: ', response);
        window.close();
    }).catch(error => {
        window.close();
        console.log('queryTabs error: ', error.message);
    });
    fetchLastElement();
}, 1);


function fetchLastElement() {
    chrome.runtime.sendMessage({ action: 'get-last-element' }, (response) => {
        if (response?.html) {
            displayArea.innerText = `${response.html}`;
        } else {
            displayArea.innerHTML = '<p>No se ha eliminado ningún elemento aún.</p>';
        }
    });
}

function queryTabs(queryInfo) {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(queryInfo, (tabs) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError));
            }
            resolve(tabs);
        });
    });
}

function sendMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError));
            }
            resolve(response);
        });
    });
}
