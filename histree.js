
function mockGetAll(callback) {
  callback([]
  )
}


function init() {
  var histRoot = $('#history');
  console.log("hello!");
  getall(function (items) {
    histRoot.html(items.length);
  });
}

$(document).ready(init);