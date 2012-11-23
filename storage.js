// storage for history node.


// save to chrome.storage
// add an id if we don't have one.
// update if we have an id.
function save(obj) {
	console.log ("SAVING :" + obj.id);
	
	if (!obj.id) {
		// create a new id.
		console.log ("create new id");
		obj.id = new Date().getTime();
	}

	chrome.storage.set(obj.id, function() {
		if (chrome.runtime.lastError) {
			console.log("ERROR : " + chrome.runtime.lastError.message())
		}
		console.log("stored " + obj.id);
		return obj.id;
	})
	
}

function get(key) {
	chrome.storage.get(key, function(items) {
		console.log(items);
	})
}


function Hello() {
	console.log("hallo");
}