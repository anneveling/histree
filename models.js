var HistoryNode = function (tab) {
  var n = now();

  this.id = "h" + n;
  this._mv = 0;
  this._type = "hnode";

  this.timestamp = n;
  this.url = tab.url;
  this.title = tab.title;

  this.windowId = tab.windowId;
  this.tabId = tab.id;

  this.childrenIds = new Array();

  this.hello = function() {
  	console.log("hello from " + this.id);
  };
}

