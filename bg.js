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

function findTabStateMaybe(windowId, tabId, callbackFound, callbackNotFound) {
	var tsid = createTabStateId(windowId, tabId);

	getMaybe(tsid, callbackFound, callbackNotFound);
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

function handleUpdate(tab) {
	//
	var node = {};
	node.id = generateId();
	node.timestamp = now();
  node._type = "hnode";
		
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
	//TODO only after the other is read
	findTabState(tab.windowId, tab.id, function(thisState) {
		thisState.currentId = node.id;
		thisState.url = tab.url;
		save(thisState);
	});	
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

		//we actually get the oncomplete event multiple times
		//did we already handle this event?
		findTabStateMaybe(tab.windowId, tab.id, function(ts) {
			//if it is found, check if the current has that url
			if (ts.url != tab.url) {
				//something new
				handleUpdate(tab);
	
			} else {
				console.log("duplicate onComplete event found, ignoring");
			}
		}, function() {
			//no such tab state found
			//new
			var ts = {};
			ts.id = createTabStateId(tab.windowId, tab.id);
			ts.url = tab.url;
			ts.window = tab.windowId;
			ts.tabId = tab.id;
			save(ts, function() {
				handleUpdate(tab);
			});
		});

		

	}
		
	
});