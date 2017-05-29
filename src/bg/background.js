'use strict';
// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
//
//
// //example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
// });
//
// chrome.tabs.getSelected(null, function(tab) {
//     var tab = tab.id;
//     tabUrl = tab.url;
//     alert(tab.url);
// });
//

/*
  -- Extension setting --
*/
var timeToKeepInMinutes = 1/12; // double
var minTabsKept = 11; // min number of tabs user want to keep

var currentTabIdStr = "";
var totalOpenTabs = 0;
var totalActiveAlarms = 0;


/*
  --- Event Listeners ---
*/

chrome.tabs.onCreated.addListener(function(tab) {
    ++totalOpenTabs;
    var tabId = tab.id;
    var tabUrl = tab.url;
    var alarmName = tabId.toString();
    // console.log("just created. Tab id: " + tabId);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfoObj) {
    --totalOpenTabs;
    // create object to be store
    var storeVal = {};
    chrome.tabs.get(tabId, function (tab){
        storeVal.url = tab.url;
        storeVal.title = tab.title;
        storeVal.favIconUrl = tab.favIconUrl;
        storeVal.index = tab.index;
        storeObject(tabId, storeVal);
    });

    // if totalOpenTabs <= minTabsKept remove all alarms to keep all current tabs
    if (totalOpenTabs <= minTabsKept) {
        console.log("Having minTabsKept of tabs or less. Thus, clearing all alarms");
        if(totalActiveAlarms > 0) {
            clearAllAlarms();
        }
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    clearAlarm(alarm.name);
    closeTabOnAlarm(alarm.name); // disable for debugging
    console.log(alarm);
});

// Listen when switching to a new tab
chrome.tabs.onActivated.addListener(function (activeInfoObj) {
    // Create an alarm for the previously active tab to CLOSE tab at timeToKeepInMinutes
    if (currentTabIdStr && totalOpenTabs > minTabsKept){
        chrome.alarms.create(currentTabIdStr, {delayInMinutes: timeToKeepInMinutes});
        ++totalActiveAlarms;
        console.log("Created alarm for " + currentTabIdStr);
    }
    // clear the alarm for the active tab to KEEP it OPEN
    var tabIdStr = activeInfoObj.tabId.toString();  // alarmName (string) is same as tabId (int) but diff types
    if (totalActiveAlarms > 0) {
        clearAlarm(tabIdStr);
    }
    // Save active tab var
    currentTabIdStr = tabIdStr;
});

chrome.browserAction.onClicked.addListener(function (tab) {
    getAllAlarms(); // print console all current alarms
    // alert("Hey !!! You have clicked");
});


init();


/*
  --- Helper functions
*/
function closeTabOnAlarm(stringId) {
    var intId = parseInt(stringId);
    chrome.tabs.remove(intId, function(){
        console.log("closing tab: " + intId);
    });
}

function clearAlarm(alarmName) {
    chrome.alarms.clear(alarmName, function(wasCleared){
        console.log("Clearing alarm: " + alarmName + " WasClear: " + wasCleared);
    });
}

function countOpenTabs() {
    chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
            ++totalOpenTabs;
        }
        console.log("totalOpenTabs init = " + totalOpenTabs);
    });
}

function getAllAlarms() { // for debugging
    chrome.alarms.getAll(function (alarms){
        var alarmListStr = alarms.toString();
        console.log(alarmListStr);
    });
}

function clearAllAlarms(){
    chrome.alarms.clearAll(function (wasCleared){
        totalActiveAlarms = 0;
        console.log("Cleared all Alarms");
    });
}

function storeObject(key, value) { // key is intTabId
    var storeObj = {};
    storeObj[key] = value;
    console.log('the storeObj is:');
    console.log(storeObj);
    chrome.tabs.sendMessage(key, {greeting: "hello"}, function(response) {
        // console.log(response.farewell);
    });
    // console.log('Successfully Stored object with key: ' + key);
    // chrome.storage.sync.set(storeObj, function() {
    //     if (chrome.runtime.error) {
    //         console.log("Runtime error.");
    //     } else {
    //
    //     }
    // });
}

function init() {
    // count tabs
    countOpenTabs();
    // will not set alarms for all tabs on init and start setting alarm for 1 tab when user switches tab
}

alert("background is running");
