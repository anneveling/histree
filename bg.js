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
function addChild(parent, child) {
	parent.children.push(child);
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
	//console.log(tab);


	//we are here, so we will be handling this
	var tsAfter = TabState(tab.windowId, tab.id);
	tsAfter.url = tab.url;
	putTabState(tsAfter);
	//marked as handled

	var node = makeHistoryNodeFromTab(tab);

	//where do we need to add this as a child?
	
	//maybe this tab already had something else open
	var newRoot = node; //until we find something else

	var foundParent = false;
	if (tsBefore) {
		if (tsBefore.currentNode && (tsBefore.currentNode.id != node.id)) {
			foundParent = true;
			addChild(tsBefore.currentNode, node);
			//save the entire tree from the root
			newRoot = tsBefore.currentRoot;
			save(tsBefore.currentRoot);
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
			if (opener.currentNode && (opener.currentNode.id != node.id)) {
				foundParent = true;
				addChild(opener.currentNode, node);
				newRoot = opener.currentRoot;
			}
		}	
	}
	//console.log("node favicon is now: "+node.favIconUrl);
	//chrome.tabs.get(tab.id, function (ctab) {
//		console.log("and now the favicon is: "+ctab.favIconUrl);
//	});
	//console.log("node is: ");
	//console.log(node);

	save(newRoot);

	//always set these two things together
	tsAfter.currentRoot = newRoot;
	tsAfter.currentNode = node;
	putTabState(tsAfter); 

	setTimeout(function() {
		chrome.tabs.get(tab.id, function(t) {
			if (t.favIconUrl) {
				if (t.favIconUrl != tab.favIconUrl) {
					//now updated
					//chrome does this lazily...
					node.favIconUrl = t.favIconUrl;
					save(newRoot);
				}
			}
			//console.log("favicon now is: "+ t.favIconUrl);
		});
	},200);

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