console.log(location.href+" loaded");
console.log("with jQuery-"+$.fn.jquery);
var BG = chrome.extension.getBackgroundPage();
$(function(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function(tabs) {
      var url=tabs[0].url;
      var tabid=tabs[0].id;
      var urlarr=url.split("/");
      console.log("tabid:"+tabid+"->"+urlarr[2]);
      $("#textUrl").text(url);
      console.log(BG.medialist);
      if(urlarr[2]=="5sing.kugou.com") {
        $("#textMp3").text("Working...");
        chrome.tabs.sendMessage(tabid, {action: "getResource"}, function(resp) {
          console.log(chrome.runtime.lastError);
          console.log("url:"+resp.mp3);
          $("#textMp3").text(resp.mp3);
        });
      } else {
        $("#textMp3").text("Not found");
      }
      table = $("#mediaUrls");
      for (var i=0; i<BG.medialist[tabid].length; i++) {
        var row = $("<li id=url_"+i+"></li>").append($("<a>", {text: BG.medialist[tabid][i][0], href: BG.medialist[tabid][i][1]}));
        table.append(row);
      }
      $('a').click(function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
      });
    }
  );
});

// vim: set expandtab ts=2 sw=2:
