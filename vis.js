

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

function nodeBreadth(node, thisLevel) {
	var b = 0;
	if (thisLevel > 100) return b;

	for (var i=0; i < node.children.length; i++) {
		var child = node.children[i];
		b += nodeBreadth(child, thisLevel + 1);
	}
	if (b == 0) b = 1;
	return b;
}
function nodeDepth(node, thisLevel) {
	var d = 0;
	if (thisLevel > 100) return d;

	for (var i=0; i < node.children.length; i++) {
		var child = node.children[i];
		d = Math.max(d, nodeDepth(child, thisLevel + 1));
	}

	return 1 + d;
}

function getSizeForTree(tree) {
  tree._dims = {
  	depth: nodeDepth(tree, 1),
  	breadth: nodeBreadth(tree, 1)
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
              var node_label = $("<div/>").addClass("node_label");

              var node_tab_outer = $("<div/>").addClass("node_tab").appendTo(node_label);
              var node_tab = $("<div/>").addClass("wrapper").appendTo(node_tab_outer);
               

              var node_content = $("<div/>").addClass("node_content").appendTo(node_label);

              var node_wrapper =  $("<div/>").addClass("wrapper").appendTo(node_content);

              //var header = $("<div/>").addClass("header").appendTo(node_wrapper);

              var title = node.data.title;
              //recognize google query
              var url = node.data.url;
              var isSpecial = false;
              if (url.indexOf("google.") != -1) {
              	//see if there is a 'q' parameter
              	var q = findQueryParameter(url, "q");
              	if (q) {
              		title = decodeURIComponent(q.replace(/\+/g, ' '));
              		node_label.addClass("query");
              		isSpecial = true;
              	}
              }
              $("<a/>").attr("href",node.data.url).attr("title",title).text(title).appendTo(node_tab);


              var body = $("<div/>").addClass("body").appendTo(node_wrapper);
              var imgIcon = null;
              if (node.data.favIconUrl) {
                imgIcon = $("<img/>").appendTo(body);
                imgIcon.addClass("favicon").attr("src", node.data.favIconUrl);
              }

              if (node.data.thumbnailUrl) {
                setTimeout(function () {
                    var imgThumb = $("<img/>").appendTo(body);
                    if (imgIcon) imgIcon.hide();
                    imgThumb.addClass("thumb").attr("src", node.data.thumbnailUrl);
                },200);
              }


              var details = $("<div/>").addClass("time").appendTo(body);
              details.text(showTime(node.data.timestamp));


              $(label).append(node_label); // '<a target="_blank" href="http://google.com?q='+node.name+'">'+node.name+'</a>';
              
              var style = label.style;
              style.width = LABEL_WIDTH + 'px';
              style.height = (LABEL_HEIGHT -3) + 'px';
              //style.backgroundColor = '#fff';
              //style.fontSize = '0.8em';
              //style.textAlign= 'center';
              //style.textDecoration = 'underline';
              //style.paddingTop = '3px';
          }


      });

  function normalizeForDisplay(i,node) {
    node.data = { title: node.title , url: node.url , timestamp: node.timestamp , favIconUrl : node.favIconUrl, thumbnailUrl: node.thumbnailUrl};
    $.each(node.children,normalizeForDisplay)
  }
  normalizeForDisplay(0,tree);

  st.loadJSON(tree);
  st.compute();
  st.select(st.root);

}