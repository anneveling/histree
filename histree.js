
function mockGetAll(callback) {
  callback([HistoryNode("http://www.google.com/?q=yes","YES"),HistoryNode("http://www.google.com/?q=we","WE"),
            HistoryNode("http://www.google.com/?q=can","CAN")
           ]
  );
}


function showStorageContent() {
  var content = $('#localStorageView .content');

  content.html('');
  var ul = $(document.createElement("ul"));
  content.append(ul);
  getall(function(nodes) {
    $.each(nodes,function (i,node){
      console.log(node);
    });
  });
}

function clearStorage() {
  clear();
  showStorageContent();
}

function node2html(node,parent) {
  var li = $(document.createElement("li")),
      a =  $(document.createElement("a"));

  parent.append(li);

  a.attr("href",node.url);
  a.text(node.title);
  li.append(a);
  li.append($(' <span class="visited"> ('+ (new Date(node.timestamp)).toTimeString() +')</span> &nbsp; '));

  a = $(document.createElement("a"));
  li.append(a);
  a.text("+");
  a.attr("href","#");
  a.click(function (event) {
      buildSubTree(li,function (n) { return n.parentId == node.parentId; });
      return false;
  });



}

function buildSubTree(parent,filter) {
  var ul = $(document.createElement("ul"));
  parent.append(ul);
  getAllNodes(function (nodes) {
            $.each(nodes, function (i,node) {
              node2html(node,ul);
            })
           },
        filter
  );
}

function buildHistoryTree() {
  buildSubTree($('#history'),function (node) { return !node.parentId;  });
}

function init() {


  buildHistoryTree();

  $('#showStorage').click(showStorageContent);
  $('#clearStorage').click(clearStorage);
}

$(document).ready(init);