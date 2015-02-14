console.log("CONTENT.JS");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("handle");
    console.log("Now in "+location.href);
    if (request.action == "getResource") {
      sendResponse({mp3: "xxx.mp3"});
    } else {
      sendResponse({});
    }
    return true;
  }
);

// vim: set expandtab ts=2 sw=2:
