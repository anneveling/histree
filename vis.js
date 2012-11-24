

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

  return { height: levelsWidth.length * (50+20), width: Math.max.apply(this,levelsWidth) * 200 };
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
          levelsToShow : 4,
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

          Edge: {
              type: 'bezier',
              lineWidth: 2,
              color:'#23A4FF',
              overridable: true
          },

          onCreateLabel: function(label, node){
              label.id = node.id;
              label.innerHTML = node.id; // '<a target="_blank" href="http://google.com?q='+node.name+'">'+node.name+'</a>';
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
          }


      });
  st.loadJSON(tree);
  st.compute();
  st.select(st.root);

}