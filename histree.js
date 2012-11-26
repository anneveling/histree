
function clearStorage() {
  clear();
  $('#history').html('');
  buildHistoryTree();
}

function create(tag) {
  return $(document.createElement(tag))
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

function extractHour(t) {
  return Math.ceil(t / (60 * 60 * 1000));
}

function buildHistoryTree(startTimestamp) {

  console.log("building history tree, starting at: "+startTimestamp);
  //group by hour
  var thisHour = 0;
  var thisHourDiv = null;
  var thisRow = 0;

  var nodesShown = 0;
  var timestampOfFirstNode = 0;

  var section = $("<div/>").addClass("hour-section").appendTo("#history");

  getLatestNodes(startTimestamp, function(key, node) {
    console.log("adding div for root node: " + node.id);
      console.log(node);

      nodesShown++;
      if (!timestampOfFirstNode) timestampOfFirstNode = node.timestamp;

      //is this a new hour?
      var nodeHour = extractHour(node.timestamp);
      if (nodeHour != thisHour) {
        //is this exactly the next hour, or is there some time in between?
        //if so, mark with a new hoursection
        if ((thisHour) && (nodeHour != thisHour - 1)) {
          section = $("<div/>").addClass("hour-section").appendTo("#history");
        }

        //make new hourdiv
        var hourContainer = $("<div/>").addClass("hour").addClass("row"+thisRow).addClass("float-container").appendTo(section);
        thisHourDiv = $("<div/>").appendTo(hourContainer);
        $("<div/>").addClass("clear").appendTo(hourContainer);

        var prettyHour = showTime(nodeHour * 60 * 60 * 1000);
        $("<div/>").append($("<span/>").addClass("hourlabel").text(prettyHour)).appendTo(thisHourDiv);

        thisHour = nodeHour;
        thisRow = (thisRow + 1) % 2;
      }

      var c = create("div").addClass("treecontainer");
      var cid = "c_"+node.id;
      c.attr("id", cid);
 
      thisHourDiv.append(c);

      buildNode(c, node);

    //mark that we want more
    //show only last 42 trees, and no more than one day at a time
    if ((nodesShown >= 42) || ((timestampOfFirstNode) && (node.timestamp < timestampOfFirstNode - 24 * 60 * 60 * 1000))) {
      //$("<div/>").addClass("hour-end").appendTo(section);
      var p = $("<p/>").appendTo("#history");
      $("<button/>").attr("id","more_"+node.id).addClass("btn").addClass("btn-info").text("more...").appendTo(p);

      $("#more_"+node.id).click(function() {
        //todo there could be duplicates? we'll just enumerate just after this one
        buildHistoryTree(node.timestamp);
      });

      return false; //stop, i've had enough
    } else {
      return true;
    }
  });

}


function init() {
  initDatabase(function() {
    $('#history').html('');

    buildHistoryTree();
  });

  $('#clearStorage').click(clearStorage);

  //just view-history tracking, to get an idea how many people are actually using the page, secure
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-36585235-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

}

$(document).ready(init);