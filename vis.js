

var LABEL_WIDTH = 200;
var LABEL_HEIGHT = 40;
var LABEL_STEP = 50;

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
          levelDistance: 50,
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
              color:'#23A4FF',
              overridable: true
          },

          onCreateLabel: function(label, node){
              label.id = node.id;
              var v = $("<div/>");
              var favurl =node.data.favIconUrl;
              if (!favurl) favurl = "q42.ico";
              v.append($("<img/>").attr("src",favurl));
              v.append($("<span/>").text(node.data.title));
              v.addClass("node_label");




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