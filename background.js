chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get-bookmarks") {
        chrome.bookmarks.getTree((bookmarks) => {

            console.log(bookmarks[0]);
            var bar = getChildren(bookmarks[0], "Bookmarks bar");
            console.log(bar);

            var current = bar;
            for (var folder of request.params.folder) {
                current = getChildren(current, folder);
            }

            console.log(current.children);

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