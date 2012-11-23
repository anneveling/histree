

function getSizeForTree(tree) {

  var levelsWidth = []; // contains the total number of nodes on a level

  function widthCalculator(currentNode,currentLevel) {
    if (!currentNode.children || currentNode.children.length ==0 )
      return;

    if ( currentLevel >= levelsWidth.length ) levelsWidth.push(0); // add one, we need it.
    levelsWidth[currentLevel] += currentNode.children.length;
    $.each(currentNode.children,function (i,c) {
          widthCalculator(c,currentLevel+1);
        });

  }

  widthCalculator(tree,0);

  return { height: levelsWidth.length * (50+200), width: Math.max.apply(this,levelsWidth) * 30 };
}

function drawTree(container,rootNode) {
  var st = new $jit.ST({
          injectInto: container.attr("id"),
          orientation: "bottom" ,
          //set duration for the animation
          duration: 0,
          //set animation transition type
          transition: $jit.Trans.linear,
          //set distance between node and its children
          levelsToShow : 32000,
          levelDistance: 50,
          Node: {
              height: 20,
              width: 200,
              //node rendering function
              //type: 'nodeline',
              color:'inherit',
              lineWidth: 2,
              align:"center",
              overridable: true
//              autoWidth: true
          },

//          request: function(nodeId, level, onComplete) {
//
//            getWithChildren(nodeId,function (node) {
//                    onComplete.onComplete(nodeId, node);
//                });
//           },

          Edge: {
              type: 'bezier',
              lineWidth: 2,
              color:'#23A4FF',
              overridable: true
          },

          onCreateLabel: function(label, node){
              label.id = node.id;
              label.innerHTML = '<a href="'+node.url+'" target="_blank">'+node.id+'</a>'; // '<a target="_blank" href="http://google.com?q='+node.name+'">'+node.name+'</a>';
//            label.onclick = function(){
//                            st.onClick(node.id);
//                        };
              var style = label.style;
              style.width = 200 + 'px';
              style.height = 17 + 'px';
              style.cursor = 'pointer';
              style.color = '#000';
              style.backgroundColor = '#fff';
              style.fontSize = '0.8em';
              style.textAlign= 'center';
              style.textDecoration = 'underline';
              style.paddingTop = '3px';
          },

//          onAfterPlotNode: function(node) {
//            st.onClick(node.id);
//          }


      });
  st.loadJSON(rootNode);
  st.compute();
  st.select(st.root);

  function addNode(node) {
    getWithChildren(node.id,function (node) {
                       st.addSubtree(node,"animate");
                       $.each(node.children,function (i,child) { addNode(child);});
                   });
  }

  addNode(rootNode);
}