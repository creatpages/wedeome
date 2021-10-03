Vue.component( 'watch', {
  template: `
  <div class='mainWedeoContainer'>
    <div class='wedeoContainer'>
      <video id="wedeo-player" class="wedeo-player video-js cover" controls></video>
    </div>

    <wedeoSideContainer/>
  </div>
  `,
  computed: {
    videoData() {
      return this.$store.state.videoData;
    }
  },
  created() {
    this.$store.commit( 'setCurrentVideoInfo', this.videoData );
  },
  mounted() {
    wedeoPlayer = new wedeoPlayerClass( 'wedeo-player' );
    wedeoPlayer.addSizeButton();
    wedeoPlayer.setVideo( this.videoData );

    const settingsMenu = new Vue({
      el: '#vjs-settings-menu',
      data() {
        return {
          wedeoPlayer: wedeoPlayer
        }
      },
      store,
      template: `<settingsMenu :wedeoPlayer="wedeoPlayer"/>`
    });

    wedeoPlayer.resizeWedeo();
    window.onresize = function() { wedeoPlayer.resizeWedeo(); };

    this.$store.commit( 'setWedeoPlayer', wedeoPlayer );
  }
});