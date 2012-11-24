

var LABEL_WIDTH = 200;
var LABEL_HEIGHT = 40;
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

function getSizeForTree(tree) {

  var levelsWidth = [1]; // contains the total number of nodes on a level

  function widthCalculator(currentNode,currentLevel) {
    if (!currentNode.children || currentNode.children.length ==0 )
      return;

    if ( currentLevel >= levelsWidth.length ) levelsWidth.push(0); // add one, we need it.
    levelsWidth[currentLevel] += currentNode.children.length;
    $.each(currentNode.children,function (i,c) {
          widthCalculator(c,currentLevel+1);
        });

  }

  widthCalculator(tree,1);

  tree._dims = { depth: levelsWidth.length , breadth : Math.max.apply(this,levelsWidth)  };

  return { height: tree._dims.depth * LABEL_HEIGHT + (tree._dims.depth-1)*LABEL_STEP,
           width:  (tree._dims.breadth * LABEL_WIDTH) + 50 }; // add 50 for safty measure
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
              col3or:'#23A4FF',
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
              header.append($("<a/>").attr("href",node.data.url).attr("title",node.data.title).text(node.data.title));

              var details = $("<div/>").addClass("time").appendTo(header);
              details.text(showTime(node.data.timestamp));



              label.innerHTML = v.html(); // '<a target="_blank" href="http://google.com?q='+node.name+'">'+node.name+'</a>';
              var style = label.style;
              style.width = LABEL_WIDTH + 'px';
              style.height = (LABEL_HEIGHT -3) + 'px';
              style.cursor = 'pointer';
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