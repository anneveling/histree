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

function findChildPath(parent, child, thisLevel) {
  //returns an array of the path from parent to child, or an empty list if cannot be found

  if (thisLevel > 100) return [];

  if (parent === child) return [child];
  if (parent.children.length == 0) return [];
  for (var i=0; i < parent.children.length; i++) {
    var c = parent.children[i];
    var cpath = findChildPath(c, child, thisLevel + 1);
    if (cpath.length == 0) {
      //no, not here
      //continue searching
    } else {
      //yes! it was found in this child
      return [parent].concat(cpath);
    }
  }
  //if we get here, then we could not find it
  return [];
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
	} else {
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
    //maybe this url is actually a parent of that node and we are going back
    //find the currentNode in the tree, and keep track of the parents
    var cpath = findChildPath(curTabState.currentRoot, curTabState.currentNode, 1);
    var foundtwin = null;
    for (var i = cpath.length - 1; i >= 0; i--) {
      if (cpath[i].url == node.url) {
        //this is the twin brother
        foundtwin = cpath[i];
        break;
      }
    }
    if (foundtwin) {
      console.log("Found that url in this node's history, moving back up the tree");

      foundtwin.timestamp = now();
      curTabState.currentNode = foundtwin;
      //and we are going to ignore the newly created 'node'
      node = foundtwin;
    } else {
      console.log("Adding as child.");
      addChild(curTabState.currentNode,node);
      curTabState.currentNode = node;
    }
  } else {
    console.log("Starting a new root");
    curTabState.currentNode = node;
    curTabState.currentRoot = node;
  }

  putTabState(curTabState);
  //save(curTabState.currentRoot);

  curTabState.currentRoot.timestamp = now();
  putNode(curTabState.currentRoot);

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
 						//save(rootToStore);

            rootToStore.timestap = now();
            putNode(rootToStore);
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
        node.timestamp = now(); //mark this tab to be seen now so it shows up higher
        //save(rootToStore);

        rootToStore.timestamp = now();
        putNode(rootToStore);
      });
    }
  });
}

//no callback here yet
initDatabase();

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