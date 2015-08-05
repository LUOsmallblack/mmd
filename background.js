const exts=["flv","hlv","f4v","mp4","mp3","wma","swf"];
const regname = /filename[^;=\n]*=\s*((['"]).*?\2|[^;\n]*)/
medialist = {};
musicplayer = null;

chrome.runtime.onMessage.addListener(function(msg, sender) {
  console.log(msg);
  console.log(sender.tab.id, sender.tab.url);
  musicplayer = sender.tab.id;
})

function getHeaderValue(name, data){
  name = name.toLowerCase();
  for (var i = 0; i<data.responseHeaders.length; i++) {
    if (data.responseHeaders[i].name.toLowerCase() == name) {
      if (data.responseHeaders[i].value)
        return decodeURI(data.responseHeaders[i].value);
      if (data.responseHeaders[i].binaryValue) {
        console.log(cptable.utils.decode(936, data.responseHeaders[i].binaryValue));
        return cptable.utils.decode(936, data.responseHeaders[i].binaryValue);
      }
      return data.responseHeaders[i].binaryValue;
    }
  }
  return null;
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var ts = details.url.match(/^(https?):\/\/([^\/.]*)\.?5sing\.com(\/?[\S\s]*)$/);
    console.log(details.url);
    if (ts) {
      if (ts[1]) {
        ts[1] = ts[1] + "://"
      } else {
        ts[1] = "//"
      }
      if (!ts[2] || ts[2]=="www") {
        ts[2] = ts[3] || "";
      } else {
        ts[2] = "/" + ts[2] + ts[3]
      }
      console.log(ts[1] + "5sing.kugou.com" + ts[2])
      return {redirectUrl: ts[1] + "5sing.kugou.com" + ts[2]};
    } else {
      console.log("match:"+details.url+ts);
    }
    return {redirectUrl: "//5sing.kugou.com"};
  },
  {
    urls: [
      "*://*.5sing.com/*",
    ],
    types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
  },
  ["blocking"]
);

chrome.webRequest.onResponseStarted.addListener(
  function(data) {
    var type = getHeaderValue("Content-Type", data);
    var name = getHeaderValue("Content-Disposition", data);
    if (name && name!="") {
      //console.log(regname.exec(name));
      var regres = regname.exec(name);
      if (regres) {
        name = regres[1];
      } else {
        name = "";
      }
      if (/^(['"]).*\1$/.test(name)) {
        name = name.slice(1,-1);
      } else {
        name = name.split('"').last().split("'").last();
      }
    }
    if ((!name || name=="") && data.url) {
      name = data.url.split("/").last().split("?")[0];
    }
    if (type) {
      type = type.toLowerCase().split("/")[0];
    }
    var ext = name.split(".").last();
    if (type!="video" && type!="audio" && exts.indexOf(ext)==-1) {
      return;
    }
    if (!medialist[data.tabId]) {
      medialist[data.tabId] = LRUCache();
    }
    medialist[data.tabId].set(data.url, [name, data.url]);
  },
  {urls: ["<all_urls>"],types: ["object","other"]},
  ["responseHeaders"]
);
