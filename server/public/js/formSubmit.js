// submit listener on the form that will submit the tags
// and render a new job ad
$(function() {

  // global counter
  var taggedAdsCounter = 0;

  $( "#tagsform" ).on( "submit", function( event ) {
    event.preventDefault();
    var datastring = $("#tagsform").serialize();
    $.ajax({
      type: "POST",
      url: "http://" + window.location.hostname + ":8082/api/tags",
      data: datastring,

    }).done(function(data) {
      taggedAdsCounter += 1;
      console.log("Data sent.");
      getRandomJobAd();

      $('#message').hide();
      if (taggedAdsCounter == 1) {
        $.Mustache.load('./templates/thanks1.html')
        .done(function () {
          var data = {time: Date.now()}
          $('#message').mustache('thanks1', data, { method: 'html' });
          $('#hintsRow').hide();
          $('#exampleRow').hide();
          $('#error').hide();
          $('#message').show();
        });
      } else if (taggedAdsCounter <= 5) {
        $.Mustache.load('./templates/thanks2.html')
        .done(function () {
          var data = {time: Date.now()}
          $('#message').mustache('thanks2', data, { method: 'html' });
          $('#error').hide();
          $('#message').show();
        });
      } else if (taggedAdsCounter > 5) {
        $.Mustache.load('./templates/thanks3.html')
        .done(function () {
          var data = {time: Date.now()}
          $('#message').mustache('thanks3', data, { method: 'html' });
          $('#error').hide();
          $('#message').show();
        });
      }
      window.scrollTo(0, 0);
    }).fail(function(response) {
      $.Mustache.load('./templates/empty.html')
      .done(function () {
        var data = {time: Date.now()}
        $('#error').mustache('empty', data, { method: 'html' });
        $('#message').hide();
        $('#error').show();
        window.scrollTo(0, 0);
      })
    });
  });
});
