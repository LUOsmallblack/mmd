const exts=["flv","hlv","f4v","mp4","mp3","wma","swf"];
const regname = /filename[^;=\n]*=\s*((['"]).*?\2|[^;\n]*)/
medialist = {};

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

console.log(chrome.webRequest);
chrome.webRequest.onResponseStarted.addListener(
  function(data) {
    console.log(data);
    var type = getHeaderValue("Content-Type", data);
    var name = getHeaderValue("Content-Disposition", data);
    if (name && regname.test(name)) {
      console.log(regname.exec(name));
      name = regname.exec(name)[1];
    }
    if (type) {
      type = type.toLowerCase().split("/")[0];
    }
    if (type!="video" && type!="audio" && exts.indexOf("")==-1) {
      return;
    }
    if (!medialist[data.tabId]) {
      medialist[data.tabId] = [];
    }
    medialist[data.tabId].push([name, data.url]);
  },
  {urls: ["<all_urls>"],types: ["object","other"]},
  ["responseHeaders"]
);
