// STORAGE

function log(s) {
  console.log(s);
}


// EVENTS 

//tabstate
var tabStates = {};

function findTabState(windowId, tabId) {
	var tsid = makeTabStateId(windowId, tabId);
	return tabStates[tsid];
}
function putTabState(ts) {
	tabStates[ts.id] = ts;
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
	//console.log("handlingUpdate for tab: "+tab.id+" and url: "+tab.url);
	var tsBefore = findTabState(tab.windowId, tab.id);
	if (tsBefore) {
		if (tsBefore.url == tab.url) {
			//console.log("sorry, but this event was already handled. ignoring");
			return;
		}
	}

	console.log("handlingUpdate for tab: "+tab.id+" and url: "+tab.url);


	//we are here, so we will be handling this
	var tsAfter = TabState(tab.windowId, tab.id);
	tsAfter.url = tab.url;
	putTabState(tsAfter);
	//marked as handled


	var node = makeHistoryNodeFromTab(tab);

	save(node, function() {

		//find the parent node if we have one

		//mark this tab now has this child
		tsAfter.currentId = node.id;
		putTabState(tsAfter);

		//maybe this tab already had something else open
		var foundParent = false;
		if (tsBefore) {
			if (tsBefore.currentId && (tsBefore.currentId != node.id)) {
				foundParent = true;
				setParent(node, tsBefore.currentId);
			}
		}
		if (!foundParent) {
			//this was a new tab
			//does this tab have an opener-tab-id?
			if (tab.openerTabId) {
				//assume same window?
				//do we already know that tab?
				var opener = findTabState(tab.windowId, tab.openerTabId);
				if (!opener) {
					opener = TabState(tab.windowId, tab.openerTabId);
					putTabState(opener);
				}
				console.log("found opener tabstate: " + opener);
				//if we already have a Node in that tab, use that one
				if (opener.currentId && (opener.currentId != node.id)) {
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
	//console.log("tab.onUpdated for tab-id: " + tabId);
	//console.log(changeInfo);
	//console.log(tab);

	if (changeInfo.status == "complete") {
		//console.log("tab.onUpdated COMPLETE");

		handleUpdate(tab);
	}
		
	
});