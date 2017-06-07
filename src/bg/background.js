'use strict';
/*
  -- Extension setting --
*/
var timeToKeepInMinutes = 10/60; // double
var minTabsKept = 14; // min number of tabs user want to keep

var currentTabIdStr = "";
var totalOpenTabs = 0;
var totalActiveAlarms = 0;
var closedTabsHistoryData = [];


/*
  --- Event Listeners ---
*/

chrome.tabs.onCreated.addListener(function(tab) {
    ++totalOpenTabs;
    console.log('totalOpenTabs = ' + totalOpenTabs);
    var tabId = tab.id;
    var tabUrl = tab.url;
    var alarmName = tabId.toString();
    // console.log("just created. Tab id: " + tabId);
});

// handle init data request to auto-closed-history page
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.action === 'getInitData')
          sendResponse({data: closedTabsHistoryData});
});

// Connection with popUpjs for data sending
chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           if(msg.action === 'initPopUp'){
              var dataSentToPopUp = {
                  action: 'sendInitDataFromBgToPopup',
                  tabsKept : minTabsKept,
                  closeInactiveTabsByMin : timeToKeepInMinutes
              };
              port.postMessage(dataSentToPopUp);

           } else if (msg.action === 'sendUpdatedSettingData'){
              timeToKeepInMinutes = parseInt(msg.keepInactiveTabsForMinutes); // convert o sec by /60
              minTabsKept = parseInt(msg.minTabsKept);
              if (totalOpenTabs <= minTabsKept) {
                  console.log("Having minTabsKept of tabs or less. Thus, clearing all alarms");
                  if(totalActiveAlarms > 0) {
                      clearAllAlarms();
                  }
              }
              port.postMessage({action: 'Recieved updated data from Popup'});
           }
      });
 })

chrome.tabs.onRemoved.addListener(function(tabId, removeInfoObj) {
    --totalOpenTabs;
    console.log('totalOpenTabs = ' + totalOpenTabs);

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
    // Make currentTab become previous active tab var
    currentTabIdStr = tabIdStr;
});

chrome.browserAction.onClicked.addListener(function (tab) {
    getAllAlarms(); // print console all current alarms
});

init();

/*
  --- Helper functions
*/
function closeTabOnAlarm(stringId) {
    var intTabId = parseInt(stringId);

    // create object to be store and store the closing tab info
    var tabInfo = {
        tabId: intTabId
    };
    chrome.tabs.get(intTabId, function (tab){
        tabInfo.tabUrl = tab.url;
        tabInfo.tabTitle = tab.title;
        tabInfo.tabFavIconUrl = tab.favIconUrl;
        tabInfo.tabIndex = tab.index;
        tabInfo.tabTimeStampStr = formatDateTimeAMPM(new Date());
        storeObject(tabInfo);
    });

    chrome.tabs.remove(intTabId, function(){
        console.log("closing tab: " + intTabId);
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

function storeObject(tabInfo) { // key is intTabId
    console.log('Storing tabInfo:');
    console.log(tabInfo);

    closedTabsHistoryData.push(tabInfo);
    // After updating data --> send updated data to auto-closed-history page
    sendUpdatedDataIfHistoryPageIsOpen();
}

/*
  Send updated data to history page when:
  1) History page is first open or viewed (taken care of by getting messaged from auto-closed-history page)
  2) History page has been open and being viewed and a tab is being closed automatically

*/
function sendUpdatedDataIfHistoryPageIsOpen(){
    chrome.tabs.query({}, function (activeTabs) { // get all tabs
        for (var tab in activeTabs){
            if (activeTabs[tab].url.indexOf('auto-closed-history.html') > -1){
                // auto-closed-history is open --> send updated data
                chrome.runtime.sendMessage({action: 'sendUpdatedDataFromBg', updatedData: closedTabsHistoryData}, function(response) {
                    console.log(response.recieveStatus);
                });
                break;
            }
        }
        // if auto-closed-history is not open --> do nothing
        console.log('Stored a closed tab, but not sending updated data because historyPage is closed');
    });
}

/*
  Formating date time
*/
function addZero(num) {
    return (num >= 0 && num < 10) ? '0' + num : num + '';
}

// return String dateTime
function formatDateTimeAMPM(date) {
  var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var dayInWeek = weekday[date.getDay()];
  var dateSeparator = '/';
  var dateHour = date.getHours();
  var hour = (dateHour !== 0 ? dateHour : 12) - (dateHour > 12 ? 12 : 0);
  var period = dateHour >= 12 ? 'PM' : 'AM';

  var strDateTime = dayInWeek + ' ' + addZero(date.getDate()) + dateSeparator + addZero(date.getMonth() + 1) + dateSeparator + date.getFullYear()
                  + ' ' + hour + ':' + addZero(date.getMinutes()) + ' ' + period;

  return strDateTime;
}


function init() {
    // count tabs
    countOpenTabs();
    // will not set alarms for all tabs on init and start setting alarm for 1 tab when user switches tab
}

alert("background is running");
