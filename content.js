if (/player\.html/.test(location.href)) {
  if (document.getElementById("clouds-music-movement-door-player")) {
    console.log("found player in content");
    chrome.runtime.sendMessage("Found");
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log("Adding music...")
        if (request.action == "addMusic") {
          document.getElementById("tmp-title").setAttribute("value", request.music.title);
          document.getElementById("tmp-artist").setAttribute("value", request.music.artist);
          document.getElementById("tmp-uri").setAttribute("value", request.music.uri);
          document.getElementById("tmp-submit").click();
          //document.getElementById("clouds-music-movement-door-player").click();
        }
        return true;
      }
    );
  }
}

if (/5sing\.kugou\.com\/(yc|fc)\/\d+.html/.test(location.href)) {
  console.log("5sing detail");

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "getResource") {
        var title = document.getElementsByClassName("song_title")[0].innerHTML;
        var artist = document.getElementsByClassName("view_info")[0].children[0].children[0].children[1].innerHTML;
        var uri = /file=([^&]*)&?/.exec(document.getElementsByTagName("embed")[0].attributes.getNamedItem("flashvars").nodeValue)[1];
        sendResponse({'title': title, 'artist': artist, 'uri': uri});
      } else {
        sendResponse({});
      }
      return true;
    }
  );
}

// vim: set expandtab ts=2 sw=2:
