var portToBg = chrome.extension.connect({
       name: "CommunicationWithBg"
  });

var initMessage = {
    action: 'initPopUp'
};

var slider = $('.range-slider'),
    range = $('.range-slider__range'),
    value = $('.range-slider__value'),
    tabNum = $('#tab-num'),
    minNumTabSlider = $('#min-num-tab-slider'),
    minutesSlider = $('#minutes-to-close-inactive-tabs-slider'),
    tabSliderSpan = $('#min-num-tab-slider-span'),
    minutesSliderSpan = $('#minutes-to-close-inactive-tabs-slider-span');

portToBg.postMessage(initMessage); // send to bg

portToBg.onMessage.addListener(function(msg) {
    // update popUp ui
    if(msg.action === 'sendInitDataFromBgToPopup'){
        minNumTabSlider.val(msg.tabsKept);
        tabSliderSpan.html(msg.tabsKept + ' tabs');
        tabNum.html(msg.tabsKept);
        minutesSlider.val(msg.closeInactiveTabsByMin);
        minutesSliderSpan.html(msg.closeInactiveTabsByMin + ' minutes');
    } else if (msg.action === 'Recieved updated data from Popup'){

    }
});

$('#sort-tabs').click(function(){
    var sortTabsMessage = {
        action: 'sortTabs'
    };
    portToBg.postMessage(sortTabsMessage); // send to bg
});

$("#sort-all-tabs-button").click(function(){
    var sortTabsMessage = {
        action: 'sortTabs'
    };
    portToBg.postMessage(sortTabsMessage); // send to bg
    $(this).addClass("done");
    $("#sort-button-text-span").text("Sorted!");

});

// Reset
$("#sort-all-tabs-button").on('mouseout', function(){
  	if($(this).hasClass("done")){
    		setTimeout(function(){
    			$("#sort-all-tabs-button").removeClass("done");
    			$("#sort-button-text-span").text("Sort Tabs");
    		}, 1500);
  	}
});

var rangeSlider = function(){
  range.on('input', function(){
      $(this).next(value).html(this.value);
      tabNum.html(minNumTabSlider.val());
      tabSliderSpan.html(minNumTabSlider.val() + ' tabs');
      minutesSliderSpan.html(minutesSlider.val() + ' minutes');
      var settingData = {
          action: 'sendUpdatedSettingData',
          minTabsKept : minNumTabSlider.val(),
          keepInactiveTabsForMinutes : minutesSlider.val()
      }
      // Send updated Data to bg
      portToBg.postMessage(settingData); // send to bg
  });

  slider.each(function(){
      value.each(function(){
          var value = $(this).prev().attr('value');
          $(this).html(value);
      });
  });
};

rangeSlider();
