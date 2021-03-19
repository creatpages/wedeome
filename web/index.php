<?php
  $htmlTitle = "Player Test";
?>

<!DOCTYPE html>
<html lang="de" dir="ltr">
  <head>
    <base href="/wedeo.me/web/">
    <?php require_once("include/head.php"); ?>
  </head>
  <body>
    <wedeoContainer>
    <!-- <div class="videoContainer-bg"> -->
      <video id="wedeo-player" class="wedeo-player video-js" controls></video>
      <!-- <video id="wedeo-player" class="wedeo-bg-player video-js" controls></video> -->
    </wedeoContainer>

    <script type="text/javascript">
      const options = {
        defaultResolution: "1080p",
        playbackRate: 1,
        fullscreenUi: "auto"
      };

      const meta = {
        uuid: "G4bGS4TQajeo",
        vuid: "ZL7CM0Rd",
        datavuid: "JnhdhWTGOaCFMzPPAca0JkDyW",
        availableSources: [ "audio", "240p", "480p", "1080p" ],
        title: "Minecraft Server overview",
        rating: [ 2, 0 ]
      }

      var wedeoPlayer = new wedeoPlayerClass( 'wedeo-player', options );
      wedeoPlayer.setVideo(meta);
    </script>
  </body>
</html>
