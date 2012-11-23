
function mockGetAll(callback) {
  callback([]
  )
}


function init() {
  var histRoot = $('#history');
  getall(function (items) {
    histRoot.html(items.length);
  });
}

$(document).ready(init);