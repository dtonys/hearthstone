window.docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    sPath = sPath || '/';
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    sPath = sPath || '/';
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  },
};

var DB = setupDatabase();
getData();

$(document).ready(function(e){
  FastClick.attach(document.body);

  $('table').on('change', 'select[name="prize_type[]"]', function( e ){
    var $target = $(e.currentTarget);
    var $tr = $target.closest('tr');
    
    if( $target.val() === 'Card' ){
      $tr.find('.amount').hide();
      $tr.find('.card_select').show();      
    }
    else{
      $tr.find('.card_select').hide(); 
      $tr.find('.amount').show();        
    }

  });

  $('.submit-btn').click(function( e ){

    var data = $('#main-form').serializeJSON();
    submitForm( data );

  });

});

function submitForm( data ){
  var valid = runValidation( data );
  if( valid ){
    docCookies.setItem('submitted', '1');
    saveData( data );
    window.location.href = '/success';
  }
}

// validate form
function runValidation( form_data ){
  var min_items = 2;
  var valid = false;
  var valid_indexes = [];

  if( !form_data.rank || !form_data.prize_type || form_data.prize_type.length < 2 ){
    error("Please select a rank and at least "+min_items+" items");
    return false;
  }
  for( var i = 0; i < form_data.prize_type.length; i++ ){
    var item = form_data.prize_type[i];
    if( !!item ) valid_indexes.push( i );
  }
  for( var i = 0;  i < valid_indexes.length; i++ ){
    var item = valid_indexes[i];
    if ( !form_data.card_name[item] && !form_data.amount[item] ){
      error("Please specify an amount or card name next to each item");
      return false;
    }
  }
  return true;
};

function error( err_msg ){
  alert( err_msg );
};

function saveData( data ){
  data.timestamp = (new Date).getTime();
  var post = DB.push( data );

};

function setupDatabase(){
  var db = new Firebase('https://brilliant-torch-6200.firebaseio.com/');
  var entries = db.child("entries");
  return db;

};

function getData(){
  DB.on("value", function(data) {
    console.log( data );
    console.log( data.val() );
  });
}