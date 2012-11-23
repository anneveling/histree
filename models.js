

function HistoryNode(url,title) {
  var n = now();
  return { _mv: 0, id: "h" + n, timestamp: n, "url":url, "title": title, childrenIds: [] };
}