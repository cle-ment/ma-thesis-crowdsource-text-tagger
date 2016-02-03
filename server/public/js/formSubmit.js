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
        success: function(data) {
          taggedAdsCounter += 1;
          console.log("Data sent.");
          getRandomJobAd();

          $('#message').hide();
          if (taggedAdsCounter == 1) {
            $('#message').html("<p><strong>Thanks!!! &hearts;</strong>"
              + " Your tags were saved. </p><p>Want to tag another job ad?"
              + " That would be great! There's a new one ready "
              + "for you below.</p>");
            $('#message').show();
          } else if (taggedAdsCounter <= 5) {
            $('#message').html("<p><strong>Thanks again! &hearts;</strong>"
              + " Your tags were saved. </p><p>Another one? It's ready "
              + "for you below.</p>");
            $('#message').show();
          } else if (taggedAdsCounter > 5) {
            $('#message').html("<p><strong>Wow you're awesome!!!</strong>"
              + " Everything is saved. </p><p>Still Another one? "
              + "As always ready for you below.</p>");
            $('#message').show();
          }
          window.scrollTo(0, 0);
        }
    });
  });
});
