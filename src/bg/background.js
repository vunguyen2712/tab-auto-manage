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
    closeTabOnAlarm(alarm.name);
    clearAlarm(alarm.name);
    console.log(alarm);

});

function closeTabOnAlarm(stringId) {
  var intId = parseInt(stringId);
  chrome.tabs.remove(intId, function(){
    console.log("closing tab: " + intId);
  });
}

function clearAlarm(alarmName) {
  chrome.alarms.clear(alarmName, function(){
    console.log("Clearing alarm: " + alarmName);
  });
}

chrome.browserAction.onClicked.addListener(function (tab) {
    alert("Hey !!! You have clicked");
});

alert("background is running");
