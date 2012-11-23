
function mockGetAll(callback) {
  callback([HistoryNode("http://www.google.com/?q=yes","YES"),HistoryNode("http://www.google.com/?q=we","WE"),
            HistoryNode("http://www.google.com/?q=can","CAN")
           ]
  );
}

function showStorageContent() {
  var content = $('#localStorageView .content');

  content.html('');
  var ul = $(document.createElement("ul"));
  content.append(ul);
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



function init() {

  $('#drawRoot').click(function (event) {
    var rootid =$('#rootId').val();
    getWithChildren(rootid,function (root) {
            drawTree($('#history'),root);
        });
    return false;
  });
 //console.log(getSizeForTree(tree));



  $('#showStorage').click(showStorageContent);
  $('#clearStorage').click(clearStorage);
}

$(document).ready(init);