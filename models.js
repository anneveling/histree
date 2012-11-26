

function now() {
	return new Date().getTime();
}

function hashCode(s){
    var hash = 0, i, c;
    if (s.length == 0) return hash;
    for (i = 0; i < s.length; i++) {
        c = s.charCodeAt(i);
        hash = ((hash<<5)-hash)+c;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

//not really object oriented because we get basic objects back from the storage
function HistoryNode(url,title) {
  var n = now();

  return {
  	id : "h" + now() + "_"+ hashCode(url),
  	_mv : 0,
  	_type : "hnode",
  	timestamp : n,
    created : n,
  	"url" : url,
  	"title" : title,
  	children : []
  };
}

function makeHistoryNodeFromTab(tab) {
  var node = HistoryNode(tab.url,tab.title);
  node.windowId = tab.windowId;
  node.tabId = tab.id;
  if (tab.favIconUrl) {
  	node.favIconUrl = tab.favIconUrl;
  }
  return node;
}

//TabState
function makeTabStateId(windowId, tabId) {
	return windowId + "-" + tabId;
}
function TabState(tab) {
	return {
		id: makeTabStateId(tab.windowId, tab.id),
		windowId: tab.windowId,
		tabId: tab.id,
    url : tab.url
	};
}




