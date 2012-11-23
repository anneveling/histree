//not really object oriented because we get basic objects back from the storage
function HistoryNode(tab) {
  var n = now();

  return {
  	id : "h" + n,
  	_mv : 0,
  	_type : "hnode",
  	timestamp : n,
  	url : tab.url,
  	title : tab.title,
  	windowId : tab.windowId,
  	tabId : tab.id,
  	childrenIds : new Array()
  };
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




