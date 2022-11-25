chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get-bookmarks") {
        chrome.bookmarks.getTree((bookmarks) => {
            var bar;
            try {
                bar = getChildren(bookmarks[0], "Bookmarks bar");
            } catch (e) {
                bar = getChildren(bookmarks[0], "Bookmarks");
            }

            var current = bar;
            for (var folder of request.params.folder) {
                current = getChildren(current, folder);
            }

            sendResponse(current.children);
        });
    }
    return true;
});

function getChildren(bookmarks, title) {
    for (var bm of bookmarks.children) {
        if (bm.title === title) {
            return bm;
        }
    }

    throw new Error("Bookmark folder / item not found !");
}