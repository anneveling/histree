// STORAGE

function log(s) {
  console.log(s);
}


// EVENTS 

function now() {
	return new Date().getTime();
}

function generateId() {
	return "h" + now();
}

function createTabStateId(windowId, tabId) {
	return windowId + "-" + tabId;
}

function findTabState(windowId, tabId, callback) {
	var ts = {};
	ts.id = createTabStateId(windowId, tabId);
	ts.windowId = windowId;
	ts.tabId = tabId;

	getOrCreate(ts.id, ts, callback);
}

function setParent(node, parentId) {
	node.parentId = parentId;

	save(node, function() {
		get(parentId, function(c) {
			c.childrenIds.push(node.id);
			save(c);
		});
	});	
}

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('histree.html')}, function(tab) {
    // Tab opened.
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("tab.onUpdated for tab-id: " + tabId);
	//console.log(changeInfo);
	//console.log(tab);

	if (changeInfo.status == "complete") {
		console.log("tab.onUpdated COMPLETE");

		var node = {};
		node.id = generateId();
		node.timestamp = now();
		
		node.windowId = tab.windowId;
		node.tabId = tab.id;
		
		node.url = tab.url;
		node.title = tab.title;

		node.childrenIds = new Array();

		save(node, function() {
			//find the parent node if we have one

			//maybe this tab already had something else open
			//we are going to assume that is this node's parent then
			findTabState(tab.windowId, tab.id, function(prev) {
				console.log("found previous tabstate for this tab: " + prev);
				if (prev.currentId) {
					setParent(node, prev.currentId);
				}
			});

			//only if node does not have a parent yet TODO

			//does this tab have an opener-tab-id?
			if (tab.openerTabId) {
				//assume same window?
				findTabState(tab.windowId, tab.openerTabId, function(opener) {
					console.log("found opener tabstate: " + opener);
					if (opener.currentId) {
						setParent(node, opener.currentId);
					}
				});
			}
		});

		//update the TabState for this window and tab
		//TODO only after the other is ready
		findTabState(tab.windowId, tab.id, function(thisState) {
			thisState.currentId = node.id;
			save(thisState);
		});

	}
		
	
});