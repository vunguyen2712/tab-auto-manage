var portToBg = chrome.extension.connect({
       name: "CommunicationWithBg"
  });

var initMessage = {
    action: 'initPopUp'
};

var slider = $('.range-slider'),
    range = $('.range-slider__range'),
    value = $('.range-slider__value'),
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
        // tabSliderSpan.append(' tabs');
        minutesSlider.val(msg.closeInactiveTabsByMin);
        minutesSliderSpan.html(msg.closeInactiveTabsByMin + ' minutes');
        // minutesSliderSpan.append(' minutes');
        console.log(msg);
    } else if (msg.action === 'Recieved updated data from Popup'){
        console.log('BG successfully recieved updated data from popUp');
    }
});

var rangeSlider = function(){
  range.on('input', function(){
      $(this).next(value).html(this.value);
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
