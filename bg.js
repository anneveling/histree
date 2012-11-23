function now() {
	return new Date().getTime();
}

function generateId() {
	return "h" + now();
}

function get(id) {
	return null;
}

function save(obj) {
	console.log("SAVING " + obj);
	console.log(obj);
	return obj;
}

function createTabStateId(windowId, tabId) {
	return windowId + "-" + tabId;
}

function findTabState(windowId, tabId) {
	var tsi = createTabStateId(windowId, tabId);
	var found = get(tsi);
	if (!found) {
		found = new Object();
		found.id = tsi;
		found.windowId = windowId;
		found.tabId = tabId;
	}
	return found;
}

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('histree.html')}, function(tab) {
    // Tab opened.
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("tab.onUpdated for tab-id: " + tabId);
	console.log(changeInfo);
	console.log(tab);

	if (changeInfo.status == "complete") {
		console.log("tab.onUpdated COMPLETE");

		var node = {};
		node.id = generateId();
		node.timestamp = now();
		
		node.windowId = tab.windowId;
		node.tabId = tab.id;
		
		node.url = tab.url;
		node.title = tab.title;

		//find the parent node if we have one

		//does this tab have an opener-tab-id?
		if (tab.openerTabId) {
			//assume same window?
			var opener = findTabState(tab.windowId, tab.openerTabId);
			if (opener) {
				console.log("found opener tabstate: " + opener);
				node.parentId = opener.id;
				//TODO do children too
			}
		}

		save(node);

		//update the TabState for this window and tab
		var thisState = findTabState(tab.windowId, tab.id);
		thisState.currentId = node.id;
		save(thisState);

	}
		
	
});