'use strict';
/*
  -- Extension setting --
*/
var timeToKeepInMinutes = 10; // double
var minTabsKept = 15; // min number of tabs user want to keep

var currentTabIdStr = "";
var totalOpenTabs = 0;
var totalActiveAlarms = 0;
var closedTabsHistoryData = [];


/*
  --- Event Listeners ---
*/

chrome.tabs.onCreated.addListener(function(tab) {
    ++totalOpenTabs;
});

// handle init data request to auto-closed-history page
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === 'getInitData')
            sendResponse({data: closedTabsHistoryData});
});

// Connection with popUpjs for data sending
chrome.extension.onConnect.addListener(function(port) {
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
    if (totalOpenTabs <= minTabsKept) {
        if(totalActiveAlarms > 0) {
            clearAllAlarms();
        }
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    clearAlarm(alarm.name);
    closeTabOnAlarm(alarm.name); // disable for debugging
});

// Listen when switching to a new tab
chrome.tabs.onActivated.addListener(function (activeInfoObj) {
    // Create an alarm for the previously active tab to CLOSE tab at timeToKeepInMinutes
    if (currentTabIdStr && totalOpenTabs > minTabsKept){
        chrome.alarms.create(currentTabIdStr, {delayInMinutes: timeToKeepInMinutes});
        ++totalActiveAlarms;
    }
    // clear the alarm for the active tab to KEEP it OPEN
    var tabIdStr = activeInfoObj.tabId.toString();  // alarmName (string) is same as tabId (int) but diff types
    if (totalActiveAlarms > 0) {
        clearAlarm(tabIdStr);
    }
    // Make currentTab become previous active tab var
    currentTabIdStr = tabIdStr;
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
        tabInfo.tabDomain = extractHostname(tab.url);
        storeObject(tabInfo);
    });

    chrome.tabs.remove(intTabId, function(){
    });
}

function clearAlarm(alarmName) {
    chrome.alarms.clear(alarmName, function(wasCleared){
    });
}

function countOpenTabs() {
    chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
            ++totalOpenTabs;
        }
    });
}

function clearAllAlarms(){
    chrome.alarms.clearAll(function (wasCleared){
        totalActiveAlarms = 0;
    });
}

function storeObject(tabInfo) { // key is intTabId
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
                });
                break;
            }
        }
        // if auto-closed-history is not open --> do nothing
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

/*
    Extract hostname of an url
*/
function extractHostname(url) {
    if (!url)
        return;
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    // remove 'www.'
    if (url.indexOf('www.') > -1) {
    	hostname = hostname.split('www.')[1];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

function init() {
    // count tabs
    countOpenTabs();
    // will not set alarms for all tabs on init and start setting alarm for 1 tab when user switches tab
}

alert("background is running");
