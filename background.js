const exts=["flv","hlv","f4v","mp4","mp3","wma","swf"];
medialist = {};

function getHeaderValue(name, data){
  name = name.toLowerCase();
  for (var i = 0; i<data.responseHeaders.length; i++) {
    if (data.responseHeaders[i].name.toLowerCase() == name) {
      return data.responseHeaders[i].value;
    }
  }
  return null;
}

console.log(chrome.webRequest);
chrome.webRequest.onResponseStarted.addListener(
  function(data) {
    console.log(data);
    var type = getHeaderValue("Content-Type", data);
    var name = getHeaderValue("Content-Disposition", data);
    if (type) {
      type = type.toLowerCase().split("/")[0];
    }
    if (type!="video" && type!="audio" && exts.indexOf("")==-1) {
      return;
    }
    if (!medialist[data.tabId]) {
      medialist[data.tabId] = [];
    }
    medialist[data.tabId].push([data.url]);
  },
  {urls: ["<all_urls>"],types: ["object","other"]},
  ["responseHeaders"]
);
