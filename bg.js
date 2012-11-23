// STORAGE

function log(s) {
  console.log(s);
}

// save to chrome.storage
// add an id if we don't have one.
// update if we have an id.
function saveAsync(obj) {
	console.log ("SAVING :" + obj.id);
	console.log(obj);
	

	var node = {};
	node[obj.id] = obj;

	chrome.storage.local.set(node, function() {
		if (chrome.runtime.lastError) {
			console.log("ERROR : " + chrome.runtime.lastError.message())
		}
		console.log("stored " + obj.id);
	})
	
}

function save(obj) {
	console.log("SAVING: "+obj.id);
	localStorage[obj.id] = obj;

}

function getAsync(id, callback) {
	console.log("GET-ASYNC: " + id);
	chrome.storage.local.get(id, function(items) {
		console.log("groetjes:" + items);
		console.log(items);
		callback(items[id]);
	})
}

function get(id) {
	console.log("GET: " + id);
	var item = localStorage[id];
	console.log(" returns: " + item);
	console.log(item);
	return item;
}

function getall(callback) {
	for (var i=0; i<chrome.storage.local.length; i++) {
		console.log('key: ' + chrome.storage.local.getKey(i));
		console.log(chrome.storage.local[chrome.storage.local.getKey(i)]);
		callback(chrome.storage.local);
	}
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

		//find the parent node if we have one

		//does this tab have an opener-tab-id?
		if (tab.openerTabId) {
			//assume same window?
			var opener = findTabState(tab.windowId, tab.openerTabId);
			if (opener) {
				console.log("found opener tabstate: " + opener);
				if (opener.currentId) {
					node.parentId = opener.currentId;

					var c = get(opener.currentId);
					c.childrenIds.push(node.id);
					save(c);
				}
			}
		}
		//TODO check if this order is ok
		if (!node.parentId) {
			//maybe this tab already had something else open
			//we are going to assume that is this node's parent then
			var prev = findTabState(tab.windowId, tab.id);
			if (prev) {
				console.log("found previous tabstate for this tab: " + prev);
				if (prev.currentId) {
					node.parentId = prev.currentId;

					var c = get(prev.currentId);
					c.childrenIds.push(node.id);
					save(c);
				}
			}
		}

		save(node);

		//update the TabState for this window and tab
		var thisState = findTabState(tab.windowId, tab.id);
		thisState.currentId = node.id;
		save(thisState);

	}
		
	
});