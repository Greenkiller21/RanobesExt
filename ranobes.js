/* Callbacks */

/**
 * This callback is for the bookmarks callback
 * @callback BookmarksAction
 * @param {HTMLAnchorElement} anchor The \<a> element
 * @returns {void}
 */

/* Constants */
const BASE_FOLDER = "Novel";

/* Already seen novels */
//var allIds = getAllIds();
removeAllAds();

/*modifyBookmarks("not_finished", (a) => {
    a.style.setProperty('color', 'black', 'important');
    if (a.parentElement.className === "title") {
        a.textContent = "❌ " + a.textContent;
    }
});

modifyBookmarks("to_read", (a) => {
    a.style.setProperty('color', 'black', 'important');
    if (a.parentElement.className === "title") {
        a.textContent = "⌛ "  + a.textContent;
    }
});

modifyBookmarks("finished", (a) => {
    a.style.setProperty('color', 'black', 'important');
    if (a.parentElement.className === "title") {
        a.textContent = "✅ " + a.textContent;
    }
});*/

/**
 * Removes all ads on the current page
 */
function removeAllAds() {
	var removeAllAdsOnPage = () => {
		var divs = document.getElementsByTagName("div");
		for (var div of divs) {
			if (div.hasAttribute("align") && div.children.length >= 2 && div.children[1].tagName.toLowerCase() == "script") {
				div.remove();
			}
		}
		
		var inses = document.getElementsByTagName("ins");
		for (var ins of inses) {
			ins.remove();
		}
	}
	
	var observer = new MutationObserver(function(mutations) {
		removeAllAdsOnPage();
	});
  
	observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});
	removeAllAdsOnPage();
}

/**
 * Modifies the style of all the <a> with a href contained in the bookmarks
 * @param {String} subFolder The subfolder to search in
 * @param {BookmarksAction} action The action to execute on a \<a> element
 */
function modifyBookmarks(subFolder, action) {
    sendMessage("get-bookmarks", {folder: [BASE_FOLDER, subFolder]}, 
    /**
     * Callback from the send message
     * @param {{url: String, title: String}[]} bookmarks 
     */
    (bookmarks) => {
        for (var bookmark of bookmarks) {
            if (!bookmark.url) {
                continue;
            }
            
            var bmId = getIdFrom(bookmark.url);
            if (bmId == undefined) {
                continue;
            }
    
            for (var aObj of allIds) {
                if (bmId === aObj.id) {
                    action(aObj.item);
                }
            }
        }
    });
}

/**
 * Returns all the novel ids found on the current page
 * @returns {{id: String, item: HTMLAnchorElement}[]} The ids of all the novels
 */
function getAllIds() {
    var ids = [];
    for (var a of document.getElementsByTagName("a")) {
        var aId = getIdFrom(a.getAttribute("href"));
        if (aId == undefined) {
            continue;
        }
        ids.push({id: aId, item: a});
    }
    return ids;
}

/**
 * Returns the novel id found from the string (url)
 * @param {String} text The text to check
 * @returns {String | undefined} Returns the string id if found, undefined otherwise
 */
function getIdFrom(text) {
    const regEx = new RegExp("\/([0-9]+)-[A-Za-z0-9-]+\.html(?!#)|\/[A-Za-z0-9-]+-([0-9]+)\/[0-9]+\.html(?!#)", "gm");
    var groups = regEx.exec(text);

    if (groups === null) {
        return undefined;
    }
    
    if (groups[1] !== undefined) {
        return groups[1];
    }

    return groups[2];
}

/**
 * Sends a message to the background.js
 * @param {String} action     The action to execute
 * @param {String} params     The parameters
 * @param {Function} callback The callback to call
 */
function sendMessage(action, params, callback) {
    chrome.runtime.sendMessage({action: action, params: params}, (response) => {
        if (!response) {
            console.error("Error :", chrome.runtime.lastError.message);
            return;
        }
        callback(response);
    });
};