"use strict";
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
var minTabsKept = 10;

var currentTabIdStr = "";
var totalOpenTabs = 0;


/*
  --- Event Listeners ---
*/

chrome.tabs.onCreated.addListener(function(tab) {
    var tabId = tab.id;
    var tabUrl = tab.url;
    var idList = "";
    var alarmName = "" + tabId;
    // console.log("just created. Tab id: " + tabId);
    chrome.alarms.create(alarmName, {delayInMinutes: timeToKeepInMinutes});
    chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
            idList += tabs[i].id + " ";
        }
        // alert("Id list is:" + idList);
    });

    // alert("just created. Tab id: " + tab);
});

chrome.alarms.onAlarm.addListener(function(alarm){
    closeTabOnAlarm(alarm.name); // disable for debugging
    clearAlarm(alarm.name);
    console.log(alarm);
});

// Listen when switching to a new tab
chrome.tabs.onActivated.addListener(function (activeInfoObj){
    // Create an alarm for the previously active tab to CLOSE tab at timeToKeepInMinutes
    if (currentTabIdStr){
        chrome.alarms.create(currentTabIdStr, {delayInMinutes: timeToKeepInMinutes});
    }
    // clear the alarm for the active tab to KEEP it OPEN
    var tabIdStr = activeInfoObj.tabId.toString();  // alarmName (string) is same as tabId (int) but diff types
    clearAlarm(tabIdStr);
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

function init() {
    // count tabs
    countOpenTabs();
    // set alarms on all tab except for the active ones
}

alert("background is running");
