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
          $('#hintsRow').hide();
          $('#exampleRow').hide();
          $('#message').html("<p><strong>Thanks!!! &hearts;</strong>"
            + " Your tags were saved. </p><p>I'm trying to collect as many tags"
            + " as possible to better understand how people interpret these"
            + " texts. So <strong>would be awesome if you could do another"
            + " one ;)</strong>. Below there's a new job ad already prepared"
            + " in case</p>");
          $('#message').show();
        } else if (taggedAdsCounter <= 5) {
          $('#message').html("<p><strong>Thanks again for the help! "
            + "&hearts;</strong></p>"
            + "<p>Ready for another one? There's a new ad "
            + "for you below.</p>");
          $('#message').show();
        } else if (taggedAdsCounter > 5) {
          $('#message').html("<p><strong>Wow so many job ads tagged already!!!"
            + "</strong>Thanks so much, I really appreciate your help!</p>"
            + "<p>As always there's a new job ad below.</p>");
          $('#message').show();
        }
        window.scrollTo(0, 0);
      }
    });
  });
});
