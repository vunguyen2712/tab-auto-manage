function storeUserPrefs() {
    var testPrefs = {'val': 10};
        chrome.storage.sync.set({'myKey': testPrefs}, function() {
            console.log('Saved', 'myKey', testPrefs);
            getUserPrefs();
        });
}

function getUserPrefs() {
    chrome.storage.sync.get('myKey', function (obj) {
        console.log('myKey', obj);
    });
}

storeUserPrefs();
