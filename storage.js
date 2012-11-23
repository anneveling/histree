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
		if (callback) callback();
		console.log("stored " + obj.id);
	})
	
}

function get(id, callback) {
	console.log("GET-ASYNC: " + id);
	chrome.storage.local.get(id, function(items) {
		console.log("groetjes:" + items);
		console.log(items);
		if (callback) callback(items[id]);
	})
}

function getall(callback) {
	console.log("GET ALL");

	ret = [];

	chrome.storage.local.get(null, function (items) {
		console.log(Items)
		var ret = new Array(items.length);
		i = 0;
		for (key in items) {
			ret[i] = items[key];
			i++;
		}
		callback(ret);

	});

}
