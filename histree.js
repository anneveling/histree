function showStorageContent() {
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

function create(tag) {
  return $(document.createElement(tag))
}

function buildNode(parent, node) {

  //n is the main node container, in the parent
  var n = create("span").addClass("node");

  var details = create("div").addClass("details").appendTo(n);

  var title = node.title;
  if (title == "") {
    title = "(no title)";
  }
  if (title.length > 20) {
    title = title.substr(0,20)+ "...";
  }
  create("a").text("n " + title).attr("href",node.url).appendTo(details);

  parent.append(n);

  //draw children too
  var celtid = "cs_"+node.id;
  var childrenElt = create("div").addClass("nodes").attr("id",celtid);

  //n.append(create("br"));
  n.append(childrenElt);

  for (var i=0; i < node.childrenIds.length; i++) {
    var childId = node.childrenIds[i];

    get(childId, function(child) {
      buildNode(childrenElt, child);
    });
  }
}

function buildHistoryTree() {
  $('#history').html('');

  getAllRootNodes(function(nodes) {
    $.each(nodes, function (i, node) {
      console.log("adding div for root node: " + node.id);
      console.log(node);

      var c = create("div").addClass("treecontainer");
      var cid = "c_"+node.id;
      c.attr("id", cid);
     $('#history').append(c);

      buildNode(c, node);

 
    });
  });  
}


function init() {
  buildHistoryTree();

  $('#showStorage').click(showStorageContent);
  $('#clearStorage').click(clearStorage);
}

$(document).ready(init);