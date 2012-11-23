// STORAGE

function log(s) {
  console.log(s);
}


// EVENTS 

//tabstate
var tabStates = {};

function findTabState(windowId, tabId) {
	var tsid = createTabStateId(windowId, tabId);
	return tabStates[tsid];
}
function putTabState(ts) {
	tabStates[ts.id] = ts;
}
function createTabStateId(windowId, tabId) {
	return windowId + "-" + tabId;
}

// UTILITIES

function now() {
	return new Date().getTime();
}

function generateId() {
	return "h" + now();
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

	//see if another event has already handled this event
	var ts = findTabState(tab.windowId, tab.id);
	if (ts && ts.url == tab.url) {
		console.log("sorry, but this event was already handled. ignoring");
		return;
	}
	//mark we're handling this
	ts = {};
	ts.id = createTabStateId(tab.windowId, tab.id);
	ts.url = tab.url;

	putTabState(ts);

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

		//mark this tab now has this child
		ts.currentId = node.id;
		putTabState(ts);

		//maybe this tab already had something else open
		//we are going to assume that is this node's parent then
		var prev = findTabState(tab.windowId, tab.id);
		if (prev) {
			console.log("found previous tabstate for this tab: " + prev);
			if (prev.currentId) {
				setParent(node, prev.currentId);
			}
		}

		//only if node does not have a parent yet TODO

		//does this tab have an opener-tab-id?
		if (tab.openerTabId) {
			//assume same window?
			var opener = findTabState(tab.windowId, tab.id);
			if (opener) {
				console.log("found opener tabstate: " + opener);
				if (opener.currentId) {
					setParent(node, opener.currentId);
				}
			}
		}		
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

		handleUpdate(tab);
	}
		
	
});