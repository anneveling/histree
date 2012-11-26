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

//IndexedDB version
//this requires chrome 11+
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
//var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

var histreeDB;

function initDatabase(callback) {
	console.log("Initializing database");
	var req = indexedDB.open("histree");
	req.onsuccess = function (evt) {
		histreeDB = req.result;
		histreeDB.onerror = function(e) {
			console.log("***ERROR in IndexedDB***");
			console.dir(e.target);
		};
		//Chrome does not fire onupgradeneeded event correctly
		if (!histreeDB.objectStoreNames.contains("nodes")) {
			var versionReq = histreeDB.setVersion("1");
			versionReq.onsuccess = function (evt) {
				console.log("IndexedDB upgrading (chrome version)...")
				var objectStore = histreeDB.createObjectStore("nodes", {
					keyPath: "id",
					autoIncrement: false,
				});
				objectStore.createIndex("timestamp","timestamp",{unique: false});	
			}
		}
		if (callback) callback();
	};
	req.onerror = function (evt) {
		console.log("IndexedDB initialization error: "+evt.target.errorCode);
	};
	req.onupgradeneeded = function (evt) {
		console.log("IndexedDB upgrading...")
		var objectStore = evt.currentTarget.result.createObjectStore("nodes", {
			keyPath: "id",
			autoIncrement: false
		});
		objectStore.createIndex("timestamp","timestamp",{unique: false});
	};

}

function putObject(store, obj, callback) {
	if (!histreeDB) {
		console.log("storeObject failed; no histreeDB found!");
		return;
	}
	var transaction = histreeDB.transaction(store, "readwrite");
	var objectStore = transaction.objectStore(store);
	//put adds or updates
	var req = objectStore.put(obj);
	req.onerror = function(evt) {
		console.log("Error saving object!");
	};
	req.onsuccess = function(evt) {
		var theid = evt.target.result;
		console.log("Successfully stored: " + theid);
		if (callback) callback(theid);
	};
}

function getObject(store, key, callback) {
	if (!histreeDB) {
		console.log("getObject failed; no histreeDB found!");
		return;
	}
	var transaction = histreeDB.transaction(store, "readonly");
	var objectStore = transaction.objectStore(store);
	var req = objectStore.get(key);
	req.onerror = function(evt) {
		console.log("Error finding object with key "+key);
	}
	req.onsuccess = function(evt) {
		console.log("found a result for key: "+key);
		callback(req.result);
	}
}

function getObjects(store, callback) {
	if (!histreeDB) {
		console.log("getObjects failed; no histreeDB found!");
		return;
	}
	var transaction = histreeDB.transaction(store, "readonly");
	var objectStore = transaction.objectStore(store);
	var req = objectStore.openCursor();
	req.onsuccess = function (evt) {
		var cursor = evt.target.result;
		if (cursor) {
			var ok = callback(cursor.key, cursor.value);
			if (ok) {
				cursor.continue();
			} else {
				console.log("stopping cursor because the callback told me so");
			}
		} else {
			console.log("cursor: no more");
		}
	}	
}
function getObjectsByIndex(store, index, reverse, startValue, callback) {
	if (!histreeDB) {
		console.log("getObjects failed; no histreeDB found!");
		return;
	}
	var transaction = histreeDB.transaction(store, "readonly");
	var objectStore = transaction.objectStore(store);
	var idx = objectStore.index("timestamp");
	var keyRange = (startValue) ? IDBKeyRange.upperBound(startValue, true) : null;
	var req = (reverse) ? idx.openCursor(keyRange, "prev") : idx.openCursor(keyRange);
	req.onsuccess = function (evt) {
		var cursor = evt.target.result;
		if (cursor) {
			var ok = callback(cursor.key, cursor.value);
			if (ok) {
				cursor.continue();
			} else {
				console.log("stopping cursor because the callback told me so");
			}
		} else {
			console.log("cursor: no more");
		}
	}	
}

//helper accessors for Nodes specifically
function putNode(node, callback) {
	putObject("nodes", node, callback);
}
function getNode(id, callback) {
	getObject("nodes", id, callback);
}
function getLatestNodes(lastSeen, callback) {
	//mark we want latest first
	//if the callback returns false, the cursor stops
	getObjectsByIndex("nodes", "timestamp", true, lastSeen, callback);
}

/*setTimeout(function() {
	console.log("test enum");
	getObjectsByIndex("nodes","timestamp",true, function (key, value) {
		console.log("enumerated "+key + " with timestamp "+value.timestamp);
		return true;
	});
},500);*/