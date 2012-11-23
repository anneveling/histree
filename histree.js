
function mockGetAll(callback) {
  callback([HistoryNode("http://www.google.com/?q=yes","YES"),HistoryNode("http://www.google.com/?q=we","WE"),
            HistoryNode("http://www.google.com/?q=can","CAN")
           ]
  );
}


function showStorageContent() {
  var content = $('#localStorageView .content');

  content.html();
  var ul = $(document.createElement("ul"));
  content.append(ul);
  mockGetAll(function(nodes) {
    $.each(nodes,function (i,node){
      var li = $(document.createElement("li"));
      li.text(JSON.stringify(node));
      ul.append(li);
    });
  });
}

function init() {
  var histRoot = $('#history');

  $('#localStorageView button').click(showStorageContent);
}

$(document).ready(init);