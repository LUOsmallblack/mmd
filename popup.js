if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

console.log(location.href+" loaded");
console.log("with jQuery-"+$.fn.jquery);
var BG = chrome.extension.getBackgroundPage();
$(function(){
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function(tabs) {
      var url=tabs[0].url;
      var tabid=tabs[0].id;
      var urlarr=url.split("/");
      var music=null;
      console.log("tabid:"+tabid+"->"+urlarr[2]);
      if(urlarr[2]=="5sing.kugou.com") {
        $("#textMp3").text("Working...");
        chrome.tabs.sendMessage(tabid, {action: "getResource"}, function(resp) {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            console.log("url:"+resp.uri);
          }
          music=resp;
          $("#songList > tbody:last").append(
            ("<tr>"+
              "<td nowrap>{0}</td>"+
              "<td>{1}</td>"+
              "<td><a href=\"{2}\">{2}</a></td>"+
              "<td><button class=\"btn btn-primary btn-add\">Add</button></td>"+
            "</tr>").format(resp.title, resp.artist, resp.uri));
          $('.btn-add').on("click", function() {
            console.log("sending")
            if (BG.musicplayer) {
              console.log("sent")
              chrome.tabs.sendMessage(BG.musicplayer, {'action': "addMusic", 'music': music})
            }
            return false;
          });
          $('a').off("click.href");
          $('a').on("click.href", function() {
            chrome.tabs.create({url: $(this).attr('href')});
            return false;
          });
        });
      } else {
        $("#textMp3").text("Not found");
      }
      console.log("mp:"+BG.musicplayer);

      $("#showMore").click(function() {
        var table = $("#mediaUrls");
        var medialist = BG.medialist[tabid].values();
        table.children().remove();
        for (var i=0; i<medialist.length; i++) {
          var row = $("<li id=url_"+i+"></li>").append($("<a>", {text: medialist[i][0], href: medialist[i][1]}));
          table.append(row);
        }
        $('a').off("click.href");
        $('a').on("click.href", function() {
          chrome.tabs.create({url: $(this).attr('href')});
          return false;
        });
      })
    }
  );
});

// vim: set expandtab ts=2 sw=2:
