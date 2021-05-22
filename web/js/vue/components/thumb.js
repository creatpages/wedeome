Vue.component( 'thumb', {
	props: [ 'videoData', ],
	data: function() {
		return {
      thumbPreviewUrl: null,
			thumbImgNumber: 1,
      thumbDiashow: null,
			thumbHoverInfoTransitionHidden: false,
			thumbHoverInfoWidth: 0
    }
	},
  template: `
    <a :href="videoUrl" :id="thumbId"  :class="thumbClass" :data-uvid="videoData.uvid" @mouseenter="startThumbDiashow" @mouseleave="stopThumbDiashow">
      <img :src="thumbUrl"/>
      <div :class="'thumbHoverInfo ' + thumbHoverInfoClass" :style="thumbHoverInfoWidthStyle"></div>
      <div class="thumbInfo">
        <div class="thumbMetaInfo">
          <span class="thumbLanguage">{{videoData.language.toUpperCase()}}</span>
          <span class="thumbRating">
            {{rating}}
            <span class="material-icons">thumb_up_off_alt</span>
          </span>
          <span class="thumbComents">
            {{videoData.commentsCount}}
            <span class="material-icons">chat_bubble_outline</span>
          </span>
        </div>
        <div class="thumbTimeInfo">
          {{duration}}
        </div>
      </div>
    </a>
  `,
  computed: {
    cdnURLbase: function() {
			return this.$store.state.cdnURLbase;
  	},
		videoUrl: function() {
      //TODO: add playlist
			return "watch/" + this.videoData.uvid;
  	},
    thumbClass: function() {
      return "thumbHolder " + this.videoData.color;
    },
		thumbHoverInfoClass: function() {
			return this.thumbHoverInfoTransitionHidden === true ? "thumbHoverInfoLeave" : "";
		},
		thumbHoverInfoWidthStyle: function() {
			return "width:" + this.thumbHoverInfoWidth + "%;";
		},
    thumbId: function() {
      return "thumb" + this.videoData.uvid;
    },
    thumbUrl: function() {
      return this.thumbPreviewUrl ? this.thumbPreviewUrl : this.cdnURLbase + "images/thumb/" + this.videoData.uvid + "/small.jpg";
    },
    rating: function() {
      return this.videoData.rating[0] == 0 ? "0%" : Math.floor( this.videoData.rating[0] / ( this.videoData.rating[0] + this.videoData.rating[1] ) * 100 ) + "%";
    },
    duration: function() {
      return secondsToHms(this.videoData.duration);
    }
  },
  methods: {
    startThumbDiashow() {
      const self = this;
    	this.thumbImgNumber = 1;

    	this.thumbHoverInfoTransitionHidden = false;
    	this.updateThumbDiashow();

    	this.thumbDiashow = setInterval( function() {
      	if( self.thumbImgNumber === 20 ){ self.thumbImgNumber = 0; }
        self.thumbImgNumber++;

    		self.updateThumbDiashow();
      }, 450);
    },
    updateThumbDiashow() {
    	this.thumbHoverInfoWidth = 100 / 20 * this.thumbImgNumber;
      this.thumbPreviewUrl = this.cdnURLbase + "images/thumb/" + this.videoData.uvid + "/" + this.thumbImgNumber + ".jpg";
    },
    stopThumbDiashow() {
      const self = this
			this.thumbHoverInfoTransitionHidden = true;
			this.thumbHoverInfoWidth = 0;
      this.thumbPreviewUrl = null;

    	if(this.thumbDiashow !== null) {
      	clearInterval(this.thumbDiashow);
      }
    }
  }
});
