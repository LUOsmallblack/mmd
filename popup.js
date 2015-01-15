console.log(location.href);
console.log($.fn.jquery);
$(function(){
  $("#buttonUrl").click(function(){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
      function(tabs) {
        console.log(tabs[0].url);
        $("#textUrl").text(tabs[0].url);
      }
    );
  });
});

// vim: set expandtab ts=2 sw=2:
