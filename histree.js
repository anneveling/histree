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

  var details = create("div").addClass("details");

  var title = node.title;
  if (title == "") {
    title = "(no title)";
  }
  if (title.length > 40) {
    title = title.substr(0,40)+ "...";
  }
  create("a").text(title).attr("href",node.url).appendTo(details);


  parent.append(details);
}

function buildHistoryTree() {
  $('#history').html('');

  getAllRootNodes(function(nodes) {
    $.each(nodes, function (i, node) {
      console.log("adding div for root node: " + node.id);
      console.log(node);

      var w = 400;
      var h = 800;

      var c = create("div").addClass("treecontainer");
      var cid = "c_"+node.id;
      c.attr("id", cid);
      c.width(w);
      c.height(h);

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