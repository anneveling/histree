// save to chrome.storage
// add an id if we don't have one.
// update if we have an id.
function save(obj,callback) {
	console.log ("SAVING :" + obj.id);
	console.log(obj);

	var node = {};
	node[obj.id] = obj;

	chrome.storage.local.set(node, function() {
		if (chrome.runtime.lastError) {
			console.log("ERROR : " + chrome.runtime.lastError.message())
		}
    	console.log("stored " + obj.id + ", calling callback");
		if (callback) callback();
	})
	
}

function get(id, callback) {
	//console.log("GET-ASYNC: " + id);
	chrome.storage.local.get(id, function(items) {
		//console.log("groetjes:" + items);
		//console.log(items);
		if (items[id]) {
			if (callback) callback(items[id]);
		}
	})
}

function clear() {
	chrome.storage.local.clear();
}

function getall(callback,filter) {
	console.log("GET ALL");

	var ret = [];

	chrome.storage.local.get(null, function (items) {
		var ret = [];
		for (var key in items) {
			var o = items[key];
			if (!filter || filter(o)) {
        		ret.push(o);
      		}	
		}
		console.log("GET-all returns " + ret.length + " items");
		callback(ret);

	});

}

function getAllNodes(callback,filter) {
  return getall(callback,function (node) {
    if (node._type != "hnode") return false;
    return filter(node);
  })
}

function getAllRootNodes(callback) {
	return getAllNodes(callback, function(node) {
		return (!node.parentId);
	});	
}




