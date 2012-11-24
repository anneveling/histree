
URL_BLACK_LIST = [
  new RegExp("^http.?://www\\.google\\.[^/]+/url")
]

function isUrlRelevantForHistree(url) {
  if (!url) return false;
  if (url.substring(0,4) != "http") return false; // we only care about http
  for (var i=0;i<URL_BLACK_LIST.length;i++) {
    if (URL_BLACK_LIST[i].test(url)) return false;
  }
  return true;
}

function isNewEmptyTabUrl(url) {
  return url == "chrome://newtab/"
}