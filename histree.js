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

function buildHistoryTree() {
  $('#history').html('');

  getAllRootNodes(function(node) {
    console.log("adding div for root node: " + node.id);
    var dimensions = getSizeForTree(node);
    var c = $(document.createElement("div")).addClass("treecontainer");
    c.attr("id", node.id);
    c.width(dimensions.width);
    c.height(dimensions.height);

    $('#history').append(c);

  });  
}


function init() {
  buildHistoryTree();

  $('#showStorage').click(showStorageContent);
  $('#clearStorage').click(clearStorage);
}

$(document).ready(init);