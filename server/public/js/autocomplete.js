// inits jquery-ui autocomplete
function initAutoComplete () {
  $(function() {

    var cache = {};

    function split( val ) {
      return val.split( /,\s*/ );
    }
    function extractLast( term ) {
     return split( term ).pop();
    }

    $( ".form-control.tagsinput" )
    // don't navigate away from the field on tab when selecting an item
    .bind( "keydown", function( event ) {
      if ( event.keyCode === $.ui.keyCode.TAB &&
        $( this ).autocomplete( "instance" ).menu.active ) {
          event.preventDefault();
      }
    })

    $( ".form-control.tagsinput" ).autocomplete({
      autoFocus: true,
      minLength: 3,
      source: function( request, response ) {
        // take the last term
        var term = extractLast( request.term );
        if ( term in cache ) {
          response( cache[ term ] );
          return;
        } else {
          $.getJSON( "http://" + window.location.hostname
            + ":8082/api/tags/byContent/" + term,
          request, function( data, status, xhr ) {
            cache[ term ] = data;
            response( data );
          });
        }
      },
      search: function() {
        // custom minLength
        var term = extractLast( this.value );
        if ( term.length < 3 ) {
          return false;
        }
      },
      focus: function() {
        // prevent value inserted on focus
        return false;
      },
      select: function( event, ui ) {
        var terms = split( this.value );
        // remove the current input
        terms.pop();
        // add the selected item
        terms.push( ui.item.value );
        // add placeholder to get the comma-and-space at the end
        terms.push( "" );
        this.value = terms.join( ", " );
        return false;
      }
    });
  });
}
