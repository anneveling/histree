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
  buildHistoryTree();
}

function create(tag) {
  return $(document.createElement(tag))
}

function lastTimeStamp(node, thisLevel) {
  var last = node.timestamp;
  if (thisLevel > 100) return last;
  for (var i=0; i < node.children.length; i++) {
    last = Math.max(last, lastTimeStamp(node.children[i], thisLevel + 1));
  }
  return last;
}

function buildNode(parent, node) {

  var details = create("div").addClass("details").attr("id","container_"+node.id);
  var dims = getSizeForTree(node);

  console.log("Size for tree with id "+node.id+": "+JSON.stringify(dims));

 // details.width(dims.width < 200 ? dims.width: 1000);
  details.width(dims.width);
  details.height(dims.height);

  parent.append(details);

  drawTree(details,node);

}

function buildHistoryTree() {
  $('#history').html('');

  getAllRootNodes(function(nodes) {
    //sort by lastTimeStamp
    //store lastTimeStamp on each node for sorting
    for (var i=0; i < nodes.length; i++) {
      var node = nodes[i];
      node.lastTimeStamp = lastTimeStamp(node, 1);
      node.lastHour = Math.floor(node.lastTimeStamp / (60 * 60 * 1000));
    }
    nodes.sort(function(a,b) {
      return b.lastTimeStamp - a.lastTimeStamp;
    });

    //group by hour
    var thisHour = 0;
    var thisHourDiv = null;
    var thisRow = 0;

    $.each(nodes, function (i, node) {
      console.log("adding div for root node: " + node.id);
      console.log(node);

      //is this a new hour?
      if (node.lastHour != thisHour) {
        //next
        if (thisHourDiv) {
          $("<div/>").addClass("clear").appendTo(thisHourDiv);
        }
        thisHourDiv = $("<div/>").addClass("hour").addClass("row"+thisRow).appendTo('#history');
        var prettyHour = showTime(node.lastHour * 60 * 60 * 1000);
        $("<div/>").append($("<span/>").addClass("hourlabel").text(prettyHour)).appendTo(thisHourDiv);

        thisHour = node.lastHour;
        thisRow = (thisRow + 1) % 2;
      }

      var c = create("div").addClass("treecontainer");
      var cid = "c_"+node.id;
      c.attr("id", cid);
 
      thisHourDiv.append(c);

      buildNode(c, node);

 
    });
    if (thisHourDiv) {
          $("<div/>").addClass("clear").appendTo(thisHourDiv);
    }
  });  
}


function init() {
  buildHistoryTree();

  $('#showStorage').click(showStorageContent);
  $('#clearStorage').click(clearStorage);
}

$(document).ready(init);