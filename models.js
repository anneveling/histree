//not really object oriented because we get basic objects back from the storage
function HistoryNode(url,title) {
  var n = now();

  return {
  	id : "h" + n,
  	_mv : 0,
  	_type : "hnode",
  	timestamp : n,
  	"url" : url,
  	"title" : title,
  	childrenIds : []
  };
}

function makeHistoryNodeFromTab(tab) {
  var node = HistoryNode(tab.url,tab.title);
  node.windowId = tab.windowId;
  node.tabId = tab.id;
  return node;
}

//TabState
function makeTabStateId(windowId, tabId) {
	return windowId + "-" + tabId;
}
function TabState(windowId, tabId) {
	return {
		id: makeTabStateId(windowId, tabId),
		windowId: windowId,
		tabId: tabId
	};
}




