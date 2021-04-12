let wedeoPlayer = false;
let wedeoBgPlayer = false;
let nextPageIsLoading = false;

function htmlLoaded() {
  if( window.matchMedia("(pointer: coarse)").matches ) {
    $(document.body).addClass('touch');
  }

  activateSamePageNavigation();
  activateSamePageLinks();
}

function activateSamePageNavigation() {
  window.onpopstate = function() {
    var url = document.location.pathname + document.location.search;
    goToPage(url, true);
  }
}

function activateSamePageLinks() {
  $('a').unbind("click").click( function(e) {
    if(
      $(this).attr('target') != "_blank" && $(this).attr('load') != 'new' && !nextPageIsLoading
      && !e.ctrlKey && !e.shiftKey && e.which != 2 && e.button != 4
    ) {
      nextPageIsLoading = true;

      const url = $(this).attr('href');
      goToPage(url);

      return false;
    }
  });
}

function goToPage( url, fromNavigation = false ) {
  if( !fromNavigation ) { window.history.pushState( {page: true}, null, document.location ); } //adds current page as previous page
  window.history.replaceState('currentPage', 'wedeo.me', url); //changes browser url
  closeNavi();

  //add page loading progress

  if( ( url.startsWith("watchPage") || url.startsWith( new URL(document.baseURI).pathname + "watchPage") ) && wedeoPlayer ) {
    loadVideoPage(url);
  } else if( wedeoPlayer ) {
    moveIntoMiniplayer();
    loadPage(url);
  } else {
    loadPage(url);
  }
}

function loadVideoPage( url ) {
  console.log( 'loadVideoPage' );
  $.post( url, { 'json': true, 'html': false, 'from': document.location.toString() }, function(data) {
    nextPageIsLoading = false;

    document.title = data.htmlTitle;
    wedeoPlayer.setVideo(data.videoData);
    store.commit( 'setCurrentVideoInfo', data.videoData );

    activateSamePageNavigation();
    activateSamePageLinks();
  });
}

function loadPage( url ) {
  console.log( 'loadPage' );
  if( wedeoBgPlayer ) { videojs(wedeoBgPlayer.playerId).dispose(); wedeoBgPlayer = false; }
  if( wedeoPlayer ) { videojs(wedeoPlayer.playerId).dispose();  wedeoPlayer = false; } //remove for miniplayer

  $.post( url, { 'json': true, 'html': true, 'from': document.location.toString() }, function(data) {
    nextPageIsLoading = false;

    document.title = data.htmlTitle;
    $('mainContainer').html(data.html);

    activateSamePageNavigation();
    activateSamePageLinks();
    pageScripts();
  });
}

function moveIntoMiniplayer() {

}

function secondsToHms( d ) {
  if( d || d >= 0 ) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + ":" : "";
    const mDisplay = m >= 0 ? ( h > 0 && m < 10 ? "0" + m + ":" : m + ":" ) : "0:";
    const sDisplay = s < 10 ? "0" + s : s;
    return hDisplay + mDisplay + sDisplay;
  } else {
    return "0:00";
  }
}
