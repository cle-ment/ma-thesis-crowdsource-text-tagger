// function to get a random job ad and render it
function getRandomJobAd() {
  $(function() {
    $.ajax({
      url: "http://" + window.location.hostname
           + ":8082/api/chunks/byAdId/random",
      cache: false // avoid caching
    })
    .done(function( result ) {
      result.counter = 0;
      result.count = function () {
        return function (text, render) {
          // note that counter is in the enclosing scope
          return result.counter++;
        }}
        $.Mustache.load('./templates/chunks.html')
        .done(function () {
          $('#jobad').mustache('chunklist', result, { method: 'html' });
          initAutoComplete();
        });
      });
  });
}
