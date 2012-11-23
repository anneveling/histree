

function HistoryNode(url,title) {
  var n = now();
  return { id: "h" + n, now: n, "url":url, "title": title, childrenIds: [] };
}