'use strict';

/**
 * Insert the text at the cursor into the active element. Note that we're
 * intentionally not appending or simply replacing the value of the editable
 * field, as we want to allow normal pasting conventions. If you paste at the
 * beginning, you shouldn't see all your text be replaced.
 * Taken from:
 * http://stackoverflow.com/questions/7404366/how-do-i-insert-some-text-where-the-cursor-is
 */
var debug = false
function debugPrint(text) {
    if (debug) {
        console.log(text)
    }
}


function insertTextAtCursor(text) {
    var el = document.querySelector("input.frm-battle-key");
    if (el) {
        el.value = text
        debugPrint("paste element")
    } else {
        debugPrint("no such element")
    }
}

function askBackground() {
    debugPrint('sending message')
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        debugPrint(response);
        insertTextAtCursor(response.data)
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.data) {
        insertTextAtCursor(request.data);
    }
});

function addInputPasteEvent() {
    var el = document.querySelector("input.frm-battle-key");
    debugPrint('on body handler');
    if (el) {
        debugPrint('register onload handler');
        el.addEventListener("click", askBackground);
    }
}

// window.onload = function() {
window.onload = function() {
    debugPrint('plugin started')
    var obs = new MutationObserver(addInputPasteEvent)
    // var body = document.body;
    // var body = document.querySelector("div.mobage-game-container")
    var options = {
        'childList': true,
        'attributes':true,
        'characterData': true,
    };
    obs.observe(document.body, options)
    obs.observe(document.head, options)
};
