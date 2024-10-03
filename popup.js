setTimeout(() => {
    //document.getElementById('hideButton').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "enableHideMode" }, function (response) {
            window.close();
        });
    });
    //});
}, 0);