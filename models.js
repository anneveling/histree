

function HistoryNode(url,title) {
  var n = now();
  return { id: "h" + n, timestamp: n, "url":url, "title": title, childrenIds: [] };
}