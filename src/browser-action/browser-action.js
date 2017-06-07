var portToBg = chrome.extension.connect({
       name: "CommunicationWithBg"
  });

var initMessage = {
    action: 'initPopUp'
};
portToBg.postMessage(initMessage); // send to bg

portToBg.onMessage.addListener(function(msg) {
    // update popUp ui
    if(msg.action === 'sendInitDataFromBgToPopup'){
        $('#min-num-tab-slider').val(msg.tabsKept);
        $('#min-num-tab-slider-span').html(msg.tabsKept);
        $('#minutes-to-close-inactive-tabs-slider').val(msg.closeInactiveTabsByMin);
        $('#minutes-to-close-inactive-tabs-slider-span').html(msg.closeInactiveTabsByMin);
        console.log(msg);
    } else if (msg.action === 'Recieved updated data from Popup'){
        console.log('BG successfully recieved updated data from popUp');
    }
});

var rangeSlider = function(){
  var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');

  range.on('input', function(){
      $(this).next(value).html(this.value);
      var settingData = {
          action: 'sendUpdatedSettingData',
          minTabsKept : $('#min-num-tab-slider').val(),
          keepInactiveTabsForMinutes : $('#minutes-to-close-inactive-tabs-slider').val()
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
