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

function lastTimeStamp(node) {
  var last = node.timestamp;
  for (var i=0; i < node.children.length; i++) {
    last = Math.max(last, lastTimestamp(node));
  }
  return last;
}

function buildNode(parent, node) {

  var details = create("div").addClass("details").attr("id","container_"+node.id);
  var dims = getSizeForTree(node);

  details.width(dims.width);
  details.height(dims.height);

  parent.append(details);

  drawTree(details,node);

//  var title = node.title;
//  if (title == "") {
//    title = "(no title)";
//  }
//  if (title.length > 40) {
//    title = title.substr(0,40)+ "...";
//  }
//  create("a").text(title).attr("href",node.url).appendTo(details);



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
      //c.width(dims.width);
      //c.height(dims.height);

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