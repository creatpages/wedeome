Vue.component( 'allVideos', {
	props: [ 'customerId', 'sections', 'data', 'thunderforest_url' ],
	data: function() {
		return {
		}
	},
  template: `
    <div class='allVideosContainer'>
			<h1 class='text-green-200 flex'>{{t('ALL_VIDEOS')}}</h1><br>
			<div class='allVideosList'>
      	<thumb v-for="video in videos" :key="video.uvid" :videoData="video"/>
			</div>
    </div>
  `,
  computed: {
		videos: function() {
			return this.$store.state.videos;
  	}
  },
  created() {
    this.$store.dispatch('fetchVideos');
  }
});
