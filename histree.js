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
    last = Math.max(last, lastTimeStamp(node.children[i]));
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
    //sort by lastTimeStamp
    //store lastTimeStamp on each node for sorting
    for (var i=0; i < nodes.length; i++) {
      var node = nodes[i];
      node.lastTimeStamp = lastTimeStamp(node);
      node.lastHour = Math.floor(node.lastTimeStamp / (60 * 1000));
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
        var prettyHour = showTime(node.lastTimeStamp);
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