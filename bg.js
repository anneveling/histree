// STORAGE

function log(s) {
  console.log(s);
}


// EVENTS 

//tabstate
var GLOBAL_TAB_STATE_REGISTRY_WITH_FANCY_PERSISTENT_OBJECT_IDENTITY = {};

function findTabState(windowId, tabId) {
	var tsid = makeTabStateId(windowId, tabId);
	return GLOBAL_TAB_STATE_REGISTRY_WITH_FANCY_PERSISTENT_OBJECT_IDENTITY[tsid];
}
function putTabState(ts) {
  GLOBAL_TAB_STATE_REGISTRY_WITH_FANCY_PERSISTENT_OBJECT_IDENTITY[ts.id] = ts;
}

// UTILITIES
function addChild(parent, child) {
	parent.children.push(child);
}

function handleUpdate(tab) {

	//see if another event has already handled this event
	console.log("handlingUpdate for tab: "+tab.id+" and url: "+tab.url);


	var curTabState = findTabState(tab.windowId, tab.id);
	if (curTabState) {
		if (curTabState.url == tab.url) {
			console.log("sorry, but this event was already handled. ignoring :" + tab.url);
			return;
		}
    curTabState.url = tab.url;
    putTabState(curTabState); // store asap to avoid duplicates.
	}
  else {
    curTabState =TabState(tab);
    putTabState(curTabState); // save as quickly as possible so block duplicate events.
    // do we need to link with root of original tab?
    if (isNewEmptyTabUrl(tab.url)) {
        console.log("New tab detected. Breaking cluster: " + tab.url);
        return;
    }

    if (tab.openerTabId) {
    	var opener = findTabState(tab.windowId, tab.openerTabId);
      if (!opener) {
        console.log("We don't know the opener id. Ignoring.")
      }
      else {
        curTabState.currentRoot = opener.currentRoot;
        curTabState.currentNode = opener.currentNode;
        console.log("linked new tab to root: " + curTabState.currentRoot.url);
        putTabState(curTabState);
      }
    }
  }

  if (!isUrlRelevantForHistree(tab.url)) {
    console.log("Url not relevant for us: " + tab.url);
    return;
  }

  var node = makeHistoryNodeFromTab(tab);

  if (curTabState.currentNode) {
    console.log("Adding as child.");
    addChild(curTabState.currentNode,node);
    curTabState.currentNode = node;
  }
  else {
    console.log("Starting a new root");
    curTabState.currentNode = node;
    curTabState.currentRoot = node;
  }

  putTabState(curTabState);
  save(curTabState.currentRoot);

  var rootToStore = curTabState.currentRoot; // capture root to avoid multi-threading bugs.

  // if active, go get us an image.
  if (tab.active) {
    storeWindowThumbnailToNode(node,rootToStore,tab.id);
    setTimeout(function () {
      storeWindowThumbnailToNode(node,rootToStore,tab.id);
    },1000); // give the page a second to re-arrange do ajax and brush teeth.
  }

  // schedule fav icon retrieval
  setTimeout(function() {
 		chrome.tabs.get(tab.id, function(t) {
 			//if no change since
 			if (t.url == node.url) {
 				if (t.favIconUrl) {
 					if (t.favIconUrl != node.favIconUrl) {
 						//now updated
 						//chrome does this lazily...
 						node.favIconUrl = t.favIconUrl;
 						save(rootToStore);
            // console.log("Saved favicon for : " + node.url);
 					}
 				}
 			}
 		});
 	},500);


}

function  storeWindowThumbnailToNode(node,rootToStore,tabId) {
  // verify tab is still active (allows for delayed snapshotting)
  chrome.tabs.get(tabId,function (tab) {
    if (tab.active) {
      chrome.tabs.captureVisibleTab(tab.windowId, function (dataUrl) {
        console.log("Adding thumbnail to " + node.url);
        node.thumbnailUrl = dataUrl;
        save(rootToStore);
      });
    }
  });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
      console.log("Tab activate! " + activeInfo.tabId);
      var curTabState = findTabState(activeInfo.windowId, activeInfo.tabId);
      	if (curTabState) {
          console.log("Tab found! " + curTabState.url)
          if (curTabState.currentNode) {
            console.log("It has a node, scheduling an image thumbnail " + curTabState.url);
            storeWindowThumbnailToNode(curTabState.currentNode,curTabState.currentRoot,activeInfo.tabId);
          }

      	}
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//	console.log("tab.onUpdated for tab-id: " + tabId);
//	console.log(changeInfo);
//	console.log(tab);

	if (changeInfo.status == "complete") {
//		console.log("tab.onUpdated COMPLETE");
//    console.log(tab);
		handleUpdate(tab);
	}
		
	
});