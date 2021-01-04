'use strict';

// A gotcha of sorts with chrome extensions involving clipboard actions is that
// only the content scripts can interact with the page that a user loads. This
// means that we can't put our calls to actually paste into the page in the
// background file, because the background scripts are not able to paste into
// the dom of the page. However, only background pages are able to access the
// system clipboard. Therefore we have to do a little trickery to move between
// the two. We're going to define the functions here to actually read from the
// clipboard into a textarea we've defined in our background html, and then
// we'll get that pasted data from the background page and do the actual
// insertion in our content script. The idea of this comes from:
// http://stackoverflow.com/questions/7144702/the-proper-use-of-execcommandpaste-in-a-chrome-extension
/**
 * Retrieve the current content of the system clipboard.
 */
function getContentFromClipboard() {
    var result = '';
    var sandbox = document.getElementById('sandbox');
    sandbox.value = '';
    sandbox.select();
    if (document.execCommand('paste')) {
        result = sandbox.value;
        console.log('got value from sandbox: ' + result);
    } else {
        console.log('got from clipboard failed')
    }
    sandbox.value = '';
    return result;
}

/**
 * Send the value that should be pasted to the content script.
 */
function sendPasteToContentScript(toBePasted) {
    // We first need to find the active tab and window and then send the data
    // along. This is based on:
    // https://developer.chrome.com/extensions/messaging
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {data: toBePasted});
    });
}

/**
 * The function that will handle our context menu clicks.
 */
function onClickHandler(info, tab) {
    var clipboardContent = getContentFromClipboard();
    console.log('clipboardContent: ' + clipboardContent);
    if (info.menuItemId === 'pasteDemo') {
        console.log('clicked paste demo');
        sendPasteToContentScript(clipboardContent);
    }
}

// // Register the click handler for our context menu.
// chrome.contextMenus.onClicked.addListener(onClickHandler);

// // Set up the single one item "paste"
// chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.contextMenus.create(
//         {
//             'title': 'Paste Demo',
//             'id': 'pasteDemo',
//             'contexts': ['editable']
//         });
// });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.greeting == "hello") {
        var clipboardContent = getContentFromClipboard();
        sendResponse({data: clipboardContent});
      }
    }
);
