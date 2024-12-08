<?php
require_once( __DIR__ . '/include/start.php' );

$page = isset( $_GET['page'] ) ? dbEsc( $_GET['page'] ) : 'index';

switch($page) {
  case 'index': require_once( __DIR__ . '/include/pages/index.php' ); break;
  case 'watch': require_once( __DIR__ . '/include/pages/watch.php' ); break;
}

if( isset( $_GET['json'] ) ) {
  $asJson = $_GET['json'] == "true";
} else {
  $asJson = false;
}

if( !$asJson ) {
?>
  <!DOCTYPE html>
  <html lang="de" dir="ltr">
    <head>
      <?php require_once("include/head.php"); ?>

  <meta name="google-site-verification" content="Vl-Q8qXxfw0Z-rGZLa3lDe_cyG6E6Fa8DdlfBYMapTU" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8587042219787939"
    crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-8587042219787939">
      <link rel="icon" type="image/x-icon" href="favicon.ico">
            <link rel="icon" type="image/x-icon" href="favicon.jpg">
                  <link rel="icon" type="image/x-icon" href="favicon.png">
                        <link rel="icon" type="image/x-icon" href="favicon.webp">
   <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDfY5Uak6kEuRLh6Q3ovTMoUx2JfzyvncM",
    authDomain: "cereatpages-1.firebaseapp.com",
    projectId: "cereatpages-1",
    storageBucket: "cereatpages-1.firebasestorage.app",
    messagingSenderId: "971329782403",
    appId: "1:971329782403:web:15caed843694fcdb4dd1b6",
    measurementId: "G-TC9FW46K2K"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
    </head>
    <body class="bg-bg text-white">

    <?php // just for now, make this better later ?>
    <script>
      <?php if( $page === "watch" ) { ?>
      store.commit( 'setMainVideoData', JSON.parse('<?=json_encode($json->videoData)?>') );
      <?php } else if( $page === "index" ) { ?>
      store.commit( 'setSecondVideoData', JSON.parse('<?=json_encode($json->videoData)?>') );
      <?php } ?>
    </script>

    <script src="vue/pages/mainContainer.js"></script>
    <script src="vue/pages/watch.js"></script>
    <script src="vue/pages/index.js"></script>

    <script src="vue/components/video/shortVideoInfo.js"></script>
    <script src="vue/components/video/settingsMenu.js"></script>
    <script src="vue/components/video/sidebar.js"></script>
    <script src="vue/components/video/title.js"></script>

    <script src="vue/components/wedeoSideContainer.js"></script>
    <script src="vue/components/wedeoSidePlaylist.js"></script>
    <script src="vue/components/wedeoSideComments.js"></script>
    <script src="vue/components/wedeoSideInfo.js"></script>
    <script src="vue/components/wedeoSideMoreVideos.js"></script>

    <div id='mainContainer'></div>

    <script>
      store.commit( 'setPage', '<?=$page?>' );
      store.dispatch('fetchTranslations');

      if( window.matchMedia("(pointer: coarse)").matches ) {
        document.querySelector('body').classList.add('touch');
      }

      activateSamePageNavigation();

      const mainapp = new Vue({
        el: '#mainContainer',
        store,
        template: `<mainContainer/>`
      });

    </script>
  </body>
</html>
<?php
} else {
  header("Content-Type: application/json; charset=UTF-8");

  echo json_encode($json);
}
?>
