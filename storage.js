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
		callback();
		console.log("stored " + obj.id);
	})
	
}

function get(id, callback) {
	console.log("GET-ASYNC: " + id);
	chrome.storage.local.get(id, function(items) {
		console.log("groetjes:" + items);
		console.log(items);
		callback(items[id]);
	})
}

function getall(callback) {
	for (var i=0; i<chrome.storage.local.length; i++) {
		console.log('key: ' + chrome.storage.local.getKey(i));
		console.log(chrome.storage.local[chrome.storage.local.getKey(i)]);
		callback(chrome.storage.local);
	}
}
