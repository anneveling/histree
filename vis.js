

var LABEL_WIDTH = 200;
var LABEL_HEIGHT = 200;
var LABEL_STEP = 50;

//helpers

var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function padNumber(n, len) {
	var result = "" + n;
	while (result.length < len) {
		result = "0" + result;
	}
	return result;
}
function showTime(timestamp) {
	var now = new Date();

	var d = new Date(timestamp);

	var result = "";

	//add date parte
	if ((d.getFullYear() == now.getFullYear()) && (d.getMonth() == now.getMonth()) && (d.getDate() == now.getDate()) ) {
		//today
	} else {
		result += dayOfWeek[d.getDay()] + " " + months[d.getMonth()]+ " " + d.getDate();
		if (d.getFullYear() != now.getFullYear()) {
			result += ", "+d.getFullYear();
		}
	}

	//add time part
	if (result != "") result += " ";
	result += padNumber(d.getHours(),2)+":"+padNumber(d.getMinutes(),2);

	return result;
}
function findQueryParameter(url, name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results)
    { 
        return 0; 
    }
    return results[1] || 0;
}

function nodeBreadth(node) {
	var b = 0;

	for (var i=0; i < node.children.length; i++) {
		var child = node.children[i];
		b += nodeBreadth(child);
	}
	if (b == 0) b = 1;
	return b;
}
function nodeDepth(node) {
	var d = 0;

	for (var i=0; i < node.children.length; i++) {
		var child = node.children[i];
		d = Math.max(d, nodeDepth(child));
	}

	return 1 + d;
}

function getSizeForTree(tree) {
  tree._dims = {
  	depth: nodeDepth(tree),
  	breadth: nodeBreadth(tree)
  };

  console.log("node depth: " + tree._dims.depth + " , breadth: "+tree._dims.breadth);

  return { height: tree._dims.depth * LABEL_HEIGHT + (tree._dims.depth - 1) * LABEL_STEP,
           width:  (tree._dims.breadth * LABEL_WIDTH) + 50  }; // add 50 for safety measure
}

function drawTree(container,tree) {
  var st = new $jit.ST({
          injectInto: container.attr("id"),
          orientation: "bottom" ,
          //set duration for the animation
          duration: 0,
          //set animation transition type
          transition: $jit.Trans.linear,
          //set distance between node and its children
          constrained: false,
          levelsToShow: 50,
          levelDistance: LABEL_STEP,
          offsetY: -(tree._dims.depth-1)*(LABEL_HEIGHT+LABEL_STEP)/2,
          Node: {
              height: LABEL_HEIGHT,
              width: LABEL_WIDTH,
              //node rendering function
              //type: 'nodeline',
              color:'inherit',
              backgroundColor: null,
              textDecoration: null,
              lineWidth: 2,
              align:"center",
              overridable: true
//              autoWidth: true
          },

          Edge: {
              type: 'bezier',
              lineWidth: 2,
              color: '#c6c6c6',
              overridable: true
          },

          onCreateLabel: function(label, node){
              label.id = node.id;
              var v = $("<div/>").addClass("node_label");

              var header = $("<div/>").addClass("header").appendTo(v);

              if (node.data.favIconUrl) {
	              header.append($("<img/>").attr("src",node.data.favIconUrl));
              }

              var title = node.data.title;
              //recognize google query
              var url = node.data.url;
              var isSpecial = false;
              if (url.indexOf("google.") != -1) {
              	//see if there is a 'q' parameter
              	var q = findQueryParameter(url, "q");
              	if (q) {
              		title = decodeURIComponent(q.replace(/\+/g, ' '));
              		header.addClass("query");
              		isSpecial = true;
              	}
              }
              header.append($("<a/>").attr("href",node.data.url).attr("title",title).text(title));

              var details = $("<div/>").addClass("time").appendTo(header);
              details.text(showTime(node.data.timestamp));

              var body = $("<div/>").addClass("body").appendTo(header);

              label.innerHTML = v.html(); // '<a target="_blank" href="http://google.com?q='+node.name+'">'+node.name+'</a>';
              
              var style = label.style;
              style.width = LABEL_WIDTH + 'px';
              style.height = (LABEL_HEIGHT -3) + 'px';
              style.color = '#000';
              //style.backgroundColor = '#fff';
              //style.fontSize = '0.8em';
              //style.textAlign= 'center';
              //style.textDecoration = 'underline';
              //style.paddingTop = '3px';
          }


      });

  function normalizeForDisplay(i,node) {
    node.data = { title: node.title , url: node.url , timestamp: node.timestamp , favIconUrl : node.favIconUrl };
    $.each(node.children,normalizeForDisplay)
  }
  normalizeForDisplay(0,tree);

  st.loadJSON(tree);
  st.compute();
  st.select(st.root);

}