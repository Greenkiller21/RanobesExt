/* Callbacks */

/**
 * This callback is for the bookmarks callback
 * @callback BookmarksAction
 * @param {HTMLAnchorElement} anchor The \<a> element
 * @returns {void}
 */

/* Constants */
const ROOT_FOLDER = "Reading";
const BASE_FOLDERS = ["novel", "fanfic"];

const Websites = {
    Ranobes: {
        name: "Ranobes",
        regexWebsite: /https:\/\/ranobes\..{3}\/.*/gm,
        regexChapter: /Chapter (?<chapter>[0-9]+):.* \| (?<title>.*)/gm
    },
    FFNet: {
        name: "Fanfiction.net",
        regexWebsite: /https:\/\/fanfiction\.net\/.*/gm,
        regexChapter: ""
    },
    WebNovel: {
        name: "WebNovel",
        regexWebsite: /https:\/\/webnovel\.com\/.*/gm,
        regexChapter: ""
    },
    NovelHall: {
        name: "NovelHall",
        regexWebsite: /https:\/\/novelhall\.com\/.*/gm,
        regexChapter: ""
    },
    RoyalRoad: {
        name: "RoyalRoad",
        regexWebsite: /https:\/\/royalroad\.com\/.*/gm,
        regexChapter: ""
    }
}

/**
 * Checks the node and add text if necessary
 * @param {Node} nodeAdded 
 */
function checkNode(nodeAdded) {
    const href = nodeAdded.getAttribute("href");
    if (href === undefined || href === null) {
        return;
    }
    var aId = getChapterFrom(href, nodeAdded.textContent);
    console.log(href + " /// " + nodeAdded.textContent);
    if (aId == undefined) {
        return;
    }
    
    var value = allBoomkmarks.find(bm => bm.title === aId.title);
    if (value !== undefined) {
        console.log(value);
        if (value.subFolder === "to_read") {
            nodeAdded.textContent = "TR " + nodeAdded.textContent;
        } else if (value.subFolder === "not_finished") {
            nodeAdded.textContent = "NF " + nodeAdded.textContent;
        } else if (value.subFolder === "finished") {
            nodeAdded.textContent = "F " + nodeAdded.textContent;
        }
    }
}

/**
 * All bookmarks
 * @type {{chapter: string;title: string; baseFolder: string; subFolder: string;}[]}
 */
const allBoomkmarks = [];

Promise.all(BASE_FOLDERS.map(async baseFolder => {
    console.log(await getRelevantBookmarks(baseFolder, "not_finished"));
    allBoomkmarks.push(await getRelevantBookmarks(baseFolder, "not_finished"));
    allBoomkmarks.push(await getRelevantBookmarks(baseFolder, "to_read"));
    allBoomkmarks.push(await getRelevantBookmarks(baseFolder, "finished"));
    console.log(allBoomkmarks);

    // modifyBookmarks(baseFolder, "not_finished", (a) => {
    //     a.style.setProperty('color', 'black', 'important');
    //     if (a.parentElement.className === "title") {
    //         a.textContent = "❌ " + a.textContent;
    //     }
    // });
    
    // modifyBookmarks(baseFolder, "to_read", (a) => {
    //     a.style.setProperty('color', 'black', 'important');
    //     if (a.parentElement.className === "title") {
    //         a.textContent = "⌛ "  + a.textContent;
    //     }
    // });
    
    // modifyBookmarks(baseFolder, "finished", (a) => {
    //     a.style.setProperty('color', 'black', 'important');
    //     if (a.parentElement.className === "title") {
    //         a.textContent = "✅ " + a.textContent;
    //     }
    // });
})).then(() => {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(m => {
            for (const nodeAdded of m.addedNodes) {
                if (nodeAdded.nodeName !== "A") {
                    continue;
                }

                checkNode(nodeAdded);
            }
        });
    });
    
    observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});

    for (var a of document.getElementsByTagName("a")) {
        checkNode(a);
    }
});


/* Remove all ads */
removeAllAds();

/**
 * Removes all ads on the current page
 */
function removeAllAds() {
    if (Websites.Ranobes.regexWebsite.exec(document.location.href) === null) {
        return;
    }

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
 * @param {String} baseFolder The base folder to search in
 * @param {String} subFolder The subfolder to search in
 * @returns {Promise<{chapter: string;title: string; baseFolder: string; subFolder: string;}[]>}
 */
function getRelevantBookmarks(baseFolder, subFolder) {
    return new Promise((acc, rej) => {
            sendMessage("get-bookmarks", {folder: [ROOT_FOLDER, baseFolder, subFolder]}, 
            /**
             * Callback from the send message
             * @param {{url: String, title: String}[]} bookmarks 
             */
            (bookmarks) => {
                var okBM = [];

                for (var bookmark of bookmarks) {
                    if (!bookmark.title) {
                        continue;
                    }
                    
                    var bmId = getChapterFrom(bookmark.url, bookmark.title);
                    if (bmId == undefined) {
                        continue;
                    }
            
                    okBM.push({
                        chapter: bmId.chapter,
                        title: bmId.title,
                        baseFolder: baseFolder,
                        subFolder: subFolder
                    });

                    // for (var aObj of allIds) {
                    //     if (bmId == aObj.id) {
                    //         action(aObj.item);
                    //     }
                    // }
                }

                acc(okBM);
            }
        );
    })

    
}

/**
 * Returns the website
 * @param {String} link The link
 * @returns {{name: string; regexWebsite: RegExp; regexChapter: RegExp;}}
 */
function getWebsiteFromLink(link) {
    return Object.keys(Websites).find(website => {
        const regEx = Websites[website].regexWebsite;
        return regEx.exec(link) !== null;
    });
}

/**
 * Returns the chapter number found from the string (url)
 * @param {String} link The link
 * @param {String} text The text to check
 * @returns {{chapter: String; title: String;} | undefined} Returns the chapter number and the title if found, undefined otherwise
 */
function getChapterFrom(link, text) {
    const website = getWebsiteFromLink(link);
    console.log(website.name);
    const regEx = website?.regexChapter;
    var groups = regEx?.exec(text);
    
    if (groups === null || groups === undefined) {
        return undefined;
    }
    
    if (groups["chapter"] !== undefined && groups["title"] !== undefined) {
        return {
            chapter: groups["chapter"],
            title: groups["title"]
        };
    }
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