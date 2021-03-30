/* makes seeking smooth */
{
  const SeekBar = videojs.getComponent('SeekBar')

  SeekBar.prototype.getPercent = function getPercent() {
    // Allows for smooth scrubbing, when player can't keep up.
    const time = this.player_.currentTime();
    const percent = time / this.player_.duration();
    return percent >= 1 ? 1 : percent;
  }

  SeekBar.prototype.handleMouseMove = function handleMouseMove(event) {
    let newTime = this.calculateDistance(event) * this.player_.duration();

    if( newTime === this.player_.duration() ) {
      newTime = newTime - 0.1;
    }

    this.player_.currentTime(newTime);
    this.update();
  }
}

/******/


class wedeoPlayerClass {
  constructor( playerId ) {
    this.URLbase      = "https://www.we-teve.com/";
    this.playerId     = playerId;
    this.selectedRes  = "1080p";
    this.playbackRate = 1;
    this.fullscreenUi = "auto";
    this.availablePlaybackRates = [ 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    this.availableFullscreenOptions = [ t('VIDEO_FULLSCREEN_UI_AUTO'), t('VIDEO_FULLSCREEN_UI_ON'), t('VIDEO_FULLSCREEN_UI_OFF')];
    this.inactivityTimeout = 2000;
    this.seekTime = 10;

    this.createPlayer();
  }

  createPlayer() {
    const self = this;

    this.Player = videojs( this.playerId, {
      preload: true,
      inactivityTimeout: self.inactivityTimeout,
      autoplay: "any"
    });

    if( $("#" + self.playerId).hasClass("wedeo-bg-player") ) {
      self.playerType = "background";
      self.createBackgroundPlayer();
    } else {
      self.playerType = "default";
      self.createDefaultPlayer();
    }
  }

  createDefaultPlayer() {
    const self = this;
    this.addHotkeys();
    this.addPlayerMenus();
    this.addPlayerVideoPreview();
    this.addPlayerHeader();
    this.addPlayerSidebar();
    this.addSkipButtons();
    this.addBigPlayerButtons();
    this.addPlayerTouchControls();

    this.Player.on('mouseout', function() {
      if( !self.playerSettingsMenuOpen ) { this.addClass('vjs-user-inactive'); }
    });

    this.Player.on('mouseover', function() { this.removeClass('vjs-user-inactive'); });

    this.Player.on('ended', function() { self.videoEnded(); });
  }

  createBackgroundPlayer() {
    const self = this;
    $("#" + this.playerId).append( "<div class='background-player-mute-btn'></div>" );
    $("#" + this.playerId + " .background-player-mute-btn").click( function() {
      self.Player.muted(!self.Player.muted());
    });

    if( this.selectedRes == "audio" ) { this.selectedRes = "480p"; }

    setTimeout(function () {
      self.Player.loop(true);
      self.Player.volume(0.5);
    }, 0);

    this.addVideoInfo();
  }

  addVideoInfo() {
    $("#" + this.playerId+ ' .vjs-control-bar').append(
      "<div class='mainVideoPreview'>" +
        "<a href='' class='mainVideoPreviewTitle'></a>" +
        "<div class='mainVideoPreviewDescription'></div>" +
        "<div class='mainVideoPreviewMeta'>" +
          "<a href='' class='mainVideoPreviewUser'>" +
            "<img src='' class='mainVideoPreviewUserImg'/>" +
            "<p class='mainVideoPreviewUserName'></p>" +
          "</a>" +
          "<span class='mainVideoPreviewMetaSpacing'> • </span>" +
          "<div class='mainVideoPreviewLang'></div>" +
          "<span class='mainVideoPreviewMetaSpacing'> • </span>" +
          "<div class='mainVideoPreviewRating'>" +
            "<div class='mainVideoPreviewRatingText'></div>" +
            "<span class='material-icons'>thumb_up_off_alt</span>" +
          "</div>" +
          "<span class='mainVideoPreviewMetaSpacing'> • </span>" +
          "<div class='mainVideoPreviewComments'>" +
            "<div class='mainVideoPreviewCommentsText'></div>" +
            "<span class='material-icons'>chat_bubble_outline</span>" +
          "</div>" +
        "</div>" +
        "<a href='' class='bigBtn'>" + t("WATCH_NOW") + "</a>" +
      "</div>"
    );
  }

  updateVideoInfo() {
    const videoUrl = "watchPage.php?v=" + this.meta.vuid;
    const userUrl = "userPage.php?u=" + this.meta.user.uuid;

    $("#" + this.playerId+ ' .mainVideoPreviewTitle').attr( 'href', videoUrl ).html( this.meta.title ).attr( 'title', this.meta.title );
    $("#" + this.playerId+ ' .mainVideoPreviewDescription').html( this.meta.description );
    $("#" + this.playerId+ ' .mainVideoPreviewUser').attr( 'href', userUrl );
    $("#" + this.playerId+ ' .mainVideoPreviewUserImg').attr( 'src', this.URLbase + 'images/avatar/small/' + this.meta.user.uuid + '.jpg' );
    $("#" + this.playerId+ ' .mainVideoPreviewUserName').html( this.meta.user.name );
    $("#" + this.playerId+ ' .mainVideoPreviewLang').html( this.meta.lang );
    $("#" + this.playerId+ ' .mainVideoPreviewRatingText').html( this.meta.rating[0] == 0 ? "0%" : Math.floor( this.meta.rating[0] / ( this.meta.rating[0] + this.meta.rating[1] ) * 100 ) + "%" );
    $("#" + this.playerId+ ' .mainVideoPreviewCommentsText').html( this.meta.commentsCount );
    $("#" + this.playerId+ ' .mainVideoPreview .bigBtn').attr( 'href', videoUrl );
  }

  addHotkeys() {
    const self = this;

    this.Player.ready(function() {
      this.hotkeys({
        volumeStep: 0.1,
        seekStep: 5,
        enableModifiersForNumbers: false,
        customKeys: {
          settingsMenuKey: {
            key: function(event) {
              return ( event.which === 83 || event.which === 79 ); //u
            },
            handler: function() {
              self.togglePlayerSettingsMenu(true);
            }
          },
          playerSizeKey: {
            key: function(event) {
              return (event.which === 84); //t
            },
            handler: function() {
              self.togglePlayerSize();
            }
          },
          skipPreviousKey: {
            key: function(event) {
              return ( event.shiftKey && event.which === 80 ); //shift + p
            },
            handler: function() {
              self.previousVideo();
            }
          },
          skipNextKey: {
            key: function(event) {
              return ( event.shiftKey && event.which === 78 ); //shift + n
            },
            handler: function() {
              self.nextVideo();
            }
          }
        }
      });
    });

    $('#'+this.playerId).focus();
  }

  addPlayerMenus() {
    const self = this;

    $('#'+this.playerId+" .vjs-custom-control-spacer").html(
      "<div class='vjs-control vjs-button vjs-settings-button' tabindex='0'><span class='material-icons'>settings</span></div>" +
      "<div class='vjs-control vjs-button vjs-size-button' tabindex='0'><span class='material-icons'>aspect_ratio</span></div>" /* crop_16_9 */
    );

    $('#'+this.playerId+" .vjs-settings-button").click( function() { self.togglePlayerSettingsMenu(); });

    $('#'+this.playerId+" .vjs-settings-button").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.togglePlayerSettingsMenu(true); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });


    $('#'+this.playerId+" .vjs-size-button").click( function() { self.togglePlayerSize(); });

    $('#'+this.playerId+" .vjs-size-button").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.togglePlayerSize(); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });

    $('#'+this.playerId+" .vjs-control-bar").after(
      "<div class='vjs-settings-menu'>" +
        "<div class='vjs-setting vjs-speed-settings'>" +
          "<div class='vjs-setting-title'>" + t('VIDEO_PLAYBACK_SPEED-TITLE') + "</div>" +
          "<div class='vjs-setting-value-container'>" +
            "<div class='vjs-setting-value'>" + this.playbackRate + "</div>" +
            "<span class='material-icons'>keyboard_arrow_right</span>" +
          "</div>" +
        "</div>" +
        "<div class='vjs-setting vjs-resolution-settings'>" +
          "<div class='vjs-setting-title'>" + t('VIDEO_QUALITY-TITLE') + "</div>" +
          "<div class='vjs-setting-value-container'>" +
            "<div class='vjs-setting-value'></div>" +
            "<span class='material-icons'>keyboard_arrow_right</span>" +
          "</div>" +
        "</div>" +
        "<div class='vjs-setting vjs-fullscreen-settings'>" +
          "<div class='vjs-setting-title'>" + t('VIDEO_FULLSCREEN_UI-TITLE') + "</div>" +
          "<div class='vjs-setting-value-container'>" +
            "<div class='vjs-setting-value'>" + t('VIDEO_FULLSCREEN_UI_AUTO') + "</div>" +
            "<span class='material-icons'>keyboard_arrow_right</span>" +
          "</div>" +
        "</div>" +
      "</div>" +
      "<div class='vjs-settings-dropdown'>" +
        "<div class='vjs-settings-dropdown-title-container'>" +
          "<span class='material-icons'>keyboard_arrow_left</span>" +
          "<div class='vjs-settings-dropdown-title'></div>" +
        "</div>" +
        "<div class='vjs-speed-settings-dropdown vjs-settings-dropdown-options'></div>" +
        "<div class='vjs-resolution-settings-dropdown vjs-settings-dropdown-options'></div>" +
        "<div class='vjs-fullscreen-settings-dropdown vjs-settings-dropdown-options'></div>" +
      "</div>"
    );

    /* speed */
    $('#'+this.playerId+' .vjs-speed-settings-dropdown').html( this.genDropDownOptions( this.availablePlaybackRates, this.playbackRate ) );

    $('#'+this.playerId+" .vjs-speed-settings").click( function() { self.openPlayerSpeedSettings(); });

    $('#'+this.playerId+" .vjs-speed-settings").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.openPlayerSpeedSettings(true); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });

    $('#'+this.playerId+" .vjs-speed-settings-dropdown .vjs-settings-dropdown-option").click( function() {
      self.changePlaybackRate( $(this).attr("value") );
    });

    $('#'+this.playerId+" .vjs-speed-settings-dropdown .vjs-settings-dropdown-option").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.changePlaybackRate( $(this).attr("value") ); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });

    /* fullscreen Ui */
    $('#'+this.playerId+" .vjs-fullscreen-settings-dropdown").html( this.genDropDownOptions( this.availableFullscreenOptions, this.fullscreenUi ) );

    $('#'+this.playerId+" .vjs-fullscreen-settings").click( function() { self.openPlayerFullscreenSettings(); });

    $('#'+this.playerId+" .vjs-fullscreen-settings").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.openPlayerFullscreenSettings(true); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });

    $('#'+this.playerId+" .vjs-fullscreen-settings-dropdown .vjs-settings-dropdown-option").click( function() {
      self.changefullscreenUi( $(this).attr("value") );
    });

    $('#'+this.playerId+" .vjs-fullscreen-settings-dropdown .vjs-settings-dropdown-option").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.changefullscreenUi( $(this).attr("value") ); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });


    $('#'+this.playerId+" .vjs-settings-dropdown-title-container").click( function() { self.closeDropdowns(); });

    $('#'+this.playerId+" .vjs-settings-dropdown-title-container").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.closeDropdowns(true); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });
  }

  addPlayerSidebar() {
    $('#'+this.playerId+' .vjs-control-bar').before(
      "<div class='vjs-sidebar'>" +
        "<div class='vjs-sidebar-content'>" +
          "<div class='vjs-rating'>" +
            "<div class='vjs-rating-vote vjs-button vjs-rating-upvote' data-title=''>" +
              "<span class='material-icons'>thumb_up_off_alt</span>" +
            "</div>" +
            "<div class='vjs-rating-percent'></div>" +
            "<div class='vjs-rating-vote vjs-button vjs-rating-downvote' data-title=''>" +
              "<span class='material-icons'>thumb_down_off_alt</span>" +
            "</div>" +
          "</div>" +
          "<div class='vjs-share-buttons'>" +
            "<div class='vjs-share-button vjs-button vjs-add-playlist' data-title='" + t('VIDEO_ADD_PLAYLIST') + "'>" +
              "<span class='material-icons'>playlist_add</span>" +
            "</div>" +
            "<div class='vjs-share-button vjs-button vjs-recommend' data-title='" + t('VIDEO_RECOMMEND') + "'>" +
              "<span class='weicon-lightbulb'></span>" +
            "</div>" +
            "<div class='vjs-share-button vjs-button vjs-share' data-title='" + t('VIDEO_SHARE') + "'>" +
              "<span class='weicon-share'></span>" +
            "</div>" +
            "<div class='vjs-share-button vjs-button vjs-download' data-title='" + t('VIDEO_DOWNLOAD') + "'>" +
              "<span class='weicon-file_download'></span>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  addPlayerHeader() {
    $('#'+this.playerId+' .vjs-control-bar').before("<div class='vjs-header'><div class='vjs-header-title'></div></div>");
  }

  addBigPlayerButtons() {
    const self = this;

    $('#'+this.playerId+' .vjs-control-bar').before(
      "<div class='vjs-big-buttons'>" +
        "<div class='vjs-big-button vjs-big-button-rewind-video' data-time='0'>" +
          "<span class='material-icons'>fast_rewind</span>" +
        "</div>" +
        "<div class='vjs-big-button vjs-big-button-core vjs-big-button-previous-video'>" +
          "<span class='material-icons'>skip_previous</span>" +
        "</div>" +
        "<div class='vjs-big-button vjs-big-button-core vjs-big-button-state-video vjs-big-button-pause-video'>" +
          "<span class='material-icons'>pause</span>" +
        "</div>" +
        "<div class='vjs-big-button vjs-big-button-core vjs-big-button-next-video'>" +
          "<span class='material-icons'>skip_next</span>" +
        "</div>" +
        "<div class='vjs-big-button vjs-big-button-forward-video' data-time='0'>" +
          "<span class='material-icons'>fast_forward</span>" +
        "</div>" +
      "</div>"
    );

    this.Player.on( 'pause', function() {
      $('#'+self.playerId+' .vjs-big-button-state-video').removeClass('vjs-big-button-pause-video');
      $('#'+self.playerId+' .vjs-big-button-state-video').addClass('vjs-big-button-play-video');
      $('#'+self.playerId+' .vjs-big-button-state-video .material-icons').html('play_arrow');
    });

    this.Player.on( 'play', function() {
      $('#'+self.playerId+' .vjs-big-button-state-video').removeClass('vjs-big-button-play-video');
      $('#'+self.playerId+' .vjs-big-button-state-video').addClass('vjs-big-button-pause-video');
      $('#'+self.playerId+' .vjs-big-button-state-video .material-icons').html('pause');
    });
  }

  addSkipButtons() {
    const self = this;

    $('#'+this.playerId+' .vjs-play-control').before(
      "<button class='vjs-previous-control vjs-control vjs-button'>" +
        "<span class='material-icons'>skip_previous</span>" +
      "</button>"
    );

    $('#'+this.playerId+' .vjs-play-control').after(
      "<button class='vjs-next-control vjs-control vjs-button'>" +
        "<span class='material-icons'>skip_next</span>" +
      "</button>"
    );

    $("#" + this.playerId + " .vjs-previous-control").click( function() { self.previousVideo(); });
    $("#" + this.playerId + " .vjs-next-control").click( function() { self.nextVideo(); });
  }

  updateSkipButtons() {
    if( this.meta.previousVideo != "" ) {
      $('#'+this.playerId+' .vjs-big-button-previous-video').css('visibility', 'visible');
      $('#'+this.playerId+' .vjs-previous-control').show();
    } else {
      $('#'+this.playerId+' .vjs-big-button-previous-video').css('visibility', 'hidden');
      $('#'+this.playerId+' .vjs-previous-control').hide();
    }

    if( this.meta.nextVideo != "" ) {
      $('#'+this.playerId+' .vjs-big-button-next-video').css('visibility', 'visible');
      $('#'+this.playerId+' .vjs-next-control').show();
    } else {
      $('#'+this.playerId+' .vjs-big-button-next-video').css('visibility', 'hidden');
      $('#'+this.playerId+' .vjs-next-control').hide();
    }
  }

  addPlayerTouchControls() {
    if( window.matchMedia("(pointer: coarse)").matches ) {
      const self = this;
      let tappedRewind = false;
      let tappedForward = false;
      let rewindTime = 0;
      let forwardTime = 0;

      $('#'+this.playerId+' .vjs-control-bar').before(
        "<div class='vjs-big-skip-buttons'>" +
          "<div class='vjs-big-skip-button vjs-big-skip-button-rewind'></div>" +
          "<div class='vjs-big-skip-button vjs-big-skip-button-forward'></div>" +
        "</div>"
      );

      $("#" + this.playerId + " .vjs-big-button-previous-video").bind( 'touchstart', function() { self.previousVideo(); });
      $("#" + this.playerId + " .vjs-big-button-next-video").bind( 'touchstart', function() { self.nextVideo(); });

      $('#'+this.playerId+' .vjs-big-button-state-video').bind( 'touchstart', function() {
        if( $(this).hasClass('vjs-big-button-pause-video') ) { self.pause(); }
        if( $(this).hasClass('vjs-big-button-play-video') ) { self.play(); }
      });

      $('#'+this.playerId + ' .vjs-big-skip-button-rewind').on( 'touchstart', function(e) {
          if( !tappedRewind ) {
            tappedRewind = setTimeout( function() { resetTouchSeeking(); }, 300 );
          } else {
            clearTimeout( tappedRewind );
            tappedRewind = setTimeout( function() { resetTouchSeeking(); }, 300 );

            rewindTime = rewindTime + self.seekTime;
            $('#'+self.playerId+' .vjs-big-button').css('opacity', 0);
            $('#'+self.playerId+' .vjs-big-button-rewind-video').attr('data-time', "- " + rewindTime);
            $('#'+self.playerId+' .vjs-big-button-rewind-video').css('opacity', 1);
            self.seekBackward();
          }
      });

      $('#'+this.playerId + ' .vjs-big-skip-button-forward').on( 'touchstart', function(e) {
          if( !tappedForward ) {
            tappedForward = setTimeout( function() { resetTouchSeeking(); }, 300 );
          } else {
            clearTimeout( tappedForward );
            tappedForward = setTimeout( function() { resetTouchSeeking(); }, 300 );

            forwardTime = forwardTime + self.seekTime;
            $('#'+self.playerId+' .vjs-big-button').css('opacity', 0);
            $('#'+self.playerId+' .vjs-big-button-forward-video').attr('data-time', "+ " + forwardTime);
            $('#'+self.playerId+' .vjs-big-button-forward-video').css('opacity', 1);

            self.seekForward();
          }
      });

      function resetTouchSeeking() {
        tappedRewind = null;
        tappedForward = null;
        rewindTime = 0;
        forwardTime = 0;

        $('#'+self.playerId+' .vjs-big-button').css('opacity', 0);
        $('#'+self.playerId+' .vjs-big-button-core').css('opacity', "");
        $('#'+self.playerId+' .vjs-big-button-rewind-video').attr('data-time', "0");
        $('#'+self.playerId+' .vjs-big-button-forward-video').attr('data-time', "0");
      }
    }
  }

  addPlayerVideoPreview() {
    const self = this;
    $('#'+this.playerId+' .vjs-progress-control').append("<div class='vjs-small-video-preview'></div>");
    $('#'+this.playerId+' .vjs-progress-control').append("<div class='vjs-small-time-preview'></div>");

    this.Player.on( 'seeking', function() {
      if( !$('#'+self.playerId+' .vjs-progress-control').is(":hover") ) {
        const maxWidth = $('#'+self.playerId+' .vjs-progress-control').width();
        const hoverTime = Math.floor( self.Player.currentTime() );
        const hoverPosFromLeft = Math.floor( maxWidth * (hoverTime / self.Player.duration()) );
        self.updatePlayerVideoPreview( hoverTime, hoverPosFromLeft, maxWidth );
      }
    });

    $('#'+this.playerId+' .vjs-progress-control').bind( 'mousemove', function(e) {
      const offset = $(this).offset();
      const hoverPosFromLeft = e.pageX - offset.left;
      const maxWidth = $('#'+self.playerId+' .vjs-progress-control').width();
      const maxTime = self.Player.duration();
      const hoverTime = Math.floor( maxTime / ( maxWidth / hoverPosFromLeft ) );
      self.updatePlayerVideoPreview( hoverTime, hoverPosFromLeft, maxWidth );
    });

    $('#'+this.playerId+' .vjs-progress-control').bind( 'touchmove', function(e) {
      $('#'+self.playerId+' .vjs-small-video-preview').show();
      $('#'+self.playerId+' .vjs-small-time-preview').css('display', 'flex');
      const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      const offset = $(this).offset();
      const hoverPosFromLeft = touch.pageX - offset.left;
      const maxWidth = $('#'+self.playerId+' .vjs-progress-control').width();
      const maxTime = self.Player.duration();
      const hoverTime = Math.floor( maxTime / ( maxWidth / hoverPosFromLeft ) );
      self.updatePlayerVideoPreview( hoverTime, hoverPosFromLeft, maxWidth );
    });

    $('#'+this.playerId+' .vjs-progress-control').bind( 'touchend', function() {
      $('#'+self.playerId+' .vjs-small-video-preview').hide();
      $('#'+self.playerId+' .vjs-small-time-preview').hide();
    });
  }

  updatePlayerVideoPreview( hoverTime, hoverPosFromLeft, maxWidth ) {
    const hoverImgTime = hoverTime + 4; // the preview is off by about 4s. idk why...

    //set img posi
    const imgSize = $('#'+this.playerId+' .vjs-small-video-preview').width();
    const halfImgSize = imgSize / 2;
    let newImgPos = hoverPosFromLeft - halfImgSize;
      if( newImgPos < 0 ){ newImgPos = 0; }
      if( newImgPos + imgSize > maxWidth ){ newImgPos = maxWidth - imgSize; }

    $('#'+this.playerId+' .vjs-small-video-preview').css('left', newImgPos);

    //set time posi
    const timeSize = $('#'+this.playerId+' .vjs-small-time-preview').width() + 8;
    const halfTimeSize = timeSize / 2;
    let newTimePos = hoverPosFromLeft - halfTimeSize;
      const videoPadding = halfImgSize - halfTimeSize;
      if( newTimePos < videoPadding ){ newTimePos = videoPadding; }
      if( newTimePos + timeSize > maxWidth - videoPadding ){ newTimePos = maxWidth - timeSize - videoPadding; }

    const displayTime = this.secondsToHms(hoverTime);
    $('#'+this.playerId+' .vjs-small-time-preview').html(displayTime);
    $('#'+this.playerId+' .vjs-small-time-preview').css('left', newTimePos);

    const getSingleImg = Math.floor( hoverImgTime / 5 / 20 );
    const getImgPreview = getSingleImg + 1;
    const getImg = Math.floor( hoverImgTime / 5 - getSingleImg * 20 );

    let imgPos;
    switch( getImg ) {
      case 1: imgPos = '-80em 0px'; break;     case 2: imgPos = '-96em 0px'; break;     case 3: imgPos = '-112em 0px'; break;    case 4: imgPos = '-128em 0px'; break;    case 5: imgPos = '-144em 0px'; break;
      case 6: imgPos = '-80em -9em'; break;    case 7: imgPos = '-96em -9em'; break;    case 8: imgPos = '-112em -9em'; break;   case 9: imgPos = '-128em -9em'; break;   case 10: imgPos = '-144em -9em'; break;
      case 11: imgPos = '-80em -18em'; break;  case 12: imgPos = '-96em -18em'; break;  case 13: imgPos = '-112em -18em'; break; case 14: imgPos = '-128em -18em'; break; case 15: imgPos = '-144em -18em'; break;
      case 16: imgPos = '-80em -27em'; break;  case 17: imgPos = '-96em -27em'; break;  case 18: imgPos = '-112em -27em'; break; case 19: imgPos = '-128em -27em'; break; case 20: imgPos = '-144em -27em'; break;
      default: imgPos = '-80em 0px';
    }

    if( getImgPreview ) {
      $('#'+this.playerId+' .vjs-small-video-preview').css( 'background-image', 'url(' + this.URLbase + 'images/thumb/preview/' + this.meta.vuid + '/pre' + getImgPreview + '.jpg)' );
      $('#'+this.playerId+' .vjs-small-video-preview').css( 'background-position', imgPos );
    }
  }

  secondsToHms( d ) {
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

  genDropDownOptions( array, active ) {
    let options = "";
    for( let i = 0; i < array.length; i++ ) {
      const opt = array[i];
      const activeOption = ( active == opt ? "active" : "" );

      options += "<div class='vjs-settings-dropdown-option " + activeOption + "' value='" + opt + "' >" + opt + "</div>";
    }

    return options;
  }

  /* menu events */
  togglePlayerSettingsMenu( key = false ) {
    this.playerSettingsMenuOpen ? this.closePlayerSettingsMenu() : this.openPlayerSettingsMenu(key);
  }

  openPlayerSettingsMenu( key = false ) {
    const self = this;
    this.playerSettingsMenuOpen = true;
    $('#'+this.playerId).addClass('vjs-open-menu');
    $('#'+this.playerId+' .vjs-settings-menu').css('display', 'flex');
    $('#'+this.playerId+' .vjs-setting').attr('tabindex', 0);

    $(document).unbind('mouseup touchend').bind( 'mouseup touchend', function( e ) {
        const container = $(".vjs-settings-menu, .vjs-settings-button, .vjs-settings-dropdown");

        if( !container.is(e.target) && container.has(e.target).length === 0 ) {
          self.closePlayerSettingsMenu();
        }
    });

    if( key ) {
      $('.vjs-speed-settings').focus();
    }
  }

  closePlayerSettingsMenu() {
    this.playerSettingsMenuOpen = false;
    $('#'+this.playerId).removeClass('vjs-open-menu');
    this.closeDropdowns();
    $('#'+this.playerId+' .vjs-settings-menu').hide();

    $('#'+this.playerId+' .vjs-setting').attr('tabindex','');
    $('#'+this.playerId).focus();
    $(document).unbind( 'mouseup');
  }

  openPlayerSpeedSettings( key = false ) {
    this.PlayerSpeedSettingsOpen = true;
    $('#'+this.playerId+' .vjs-settings-menu').hide();
    $('#'+this.playerId+' .vjs-settings-dropdown-title').html( $('#'+this.playerId+' .vjs-speed-settings .vjs-setting-title').html() );
    $('#'+this.playerId+' .vjs-settings-dropdown').css('display', 'flex');
    $('#'+this.playerId+' .vjs-speed-settings-dropdown').css('display', 'flex');

    this.selectDropdownMenu(key);
  }

  openPlayerResolutionSettings( key = false ) {
    this.PlayerResolutionSettingsOpen = true;
    $('#'+this.playerId+' .vjs-settings-menu').hide();
    $('#'+this.playerId+' .vjs-settings-dropdown-title').html( $('#'+this.playerId+' .vjs-resolution-settings .vjs-setting-title').html() );
    $('#'+this.playerId+' .vjs-settings-dropdown').css('display', 'flex');
    $('#'+this.playerId+' .vjs-resolution-settings-dropdown').css('display', 'flex');

    this.selectDropdownMenu(key);
  }

  openPlayerFullscreenSettings( key = false ) {
    this.closePlayerFullscreenSettingsOpen = true;
    $('#'+this.playerId+' .vjs-settings-menu').hide();
    $('#'+this.playerId+' .vjs-settings-dropdown-title').html( $('#'+this.playerId+' .vjs-fullscreen-settings .vjs-setting-title').html() );
    $('#'+this.playerId+' .vjs-settings-dropdown').css('display', 'flex');
    $('#'+this.playerId+' .vjs-fullscreen-settings-dropdown').css('display', 'flex');

    this.selectDropdownMenu(key);
  }

  selectDropdownMenu( key ) {
    $('#'+this.playerId+' .vjs-settings-dropdown-title-container').attr('tabindex',0);
    $('#'+this.playerId+' .vjs-settings-dropdown-option').attr('tabindex',0);

    if( key ) {
      if( this.PlayerSpeedSettingsOpen ) { $('#'+this.playerId+ '.vjs-speed-settings-dropdown .vjs-settings-dropdown-option:first').focus(); }
      if( this.PlayerResolutionSettingsOpen ) { $('#'+this.playerId+ '.vjs-resolution-settings-dropdown .vjs-settings-dropdown-option:first').focus(); }
      if( this.closePlayerFullscreenSettingsOpen ) { $('#'+this.playerId+ '.vjs-fullscreen-settings-dropdown .vjs-settings-dropdown-option:first').focus(); }
    }
  }

  closePlayerSpeedSettings( key ) {
    this.PlayerSpeedSettingsOpen = false;
    if( key ){ $('#'+this.playerId+' .vjs-speed-settings').focus(); }
  }
  closePlayerResolutionSettings( key ) {
    this.PlayerResolutionSettingsOpen = false;
    if( key ){ $('#'+this.playerId+' .vjs-resolution-settings').focus(); }
  }
  closePlayerFullscreenSettings( key ) {
    this.closePlayerFullscreenSettingsOpen = false;
    if( key ){ $('#'+this.playerId+' .vjs-fullscreen-settings').focus(); }
  }

  closeDropdowns( key = false ) {
    $('#'+this.playerId+' .vjs-settings-dropdown').hide();
    $('#'+this.playerId+' .vjs-settings-dropdown-options').hide();
    $('#'+this.playerId+' .vjs-settings-menu').css('display', 'flex');

    $('#'+this.playerId+' .vjs-settings-dropdown-title-container').attr('tabindex','');
    $('#'+this.playerId+' .vjs-settings-dropdown-option').attr('tabindex','');

    if( this.PlayerSpeedSettingsOpen ) { this.closePlayerSpeedSettings(key); }
    if( this.PlayerResolutionSettingsOpen ) { this.closePlayerResolutionSettings(key); }
    if( this.closePlayerFullscreenSettingsOpen ) { this.closePlayerFullscreenSettings(key); }
  }

  togglePlayerSize() {
    console.log( "toggle size" );
  }

  getVideoSource() {
    let selectedRes = this.selectedRes != "audio" ? this.selectedRes.slice(0, -1) : "audio";
    const availableSources = this.meta.availableSources.map( source => {
      return source != "audio" ? source.slice(0, -1) : ""
    }).filter( source => {
      return source != "";
    }).reverse();

    if( selectedRes != "audio" ) {
      if( !availableSources.includes( selectedRes ) ) {
        let nextSmaller = "";
        for( let i = 0; i < availableSources.length; i++ ) {
          if( parseInt(selectedRes) > parseInt(availableSources[i]) ) {
            nextSmaller = availableSources[i];
            break;
          }
        }

        if( nextSmaller == "" ) { nextSmaller = availableSources[ availableSources.length - 1 ]; }
        selectedRes = nextSmaller + "p";
      } else {
        selectedRes = selectedRes + "p";
      }
    }

    this.selectedRes = selectedRes;
    const fileType = ( this.selectedRes == "audio" ? ".mp3" : ".mp4" );
    return this.URLbase + 'videos/' + this.meta.datavuid + '/' + this.selectedRes + fileType;
  }

  setVideo( meta ) {
    const self = this;
    this.meta = meta;
    const poster = this.URLbase + 'images/thumb/large_img/' + this.meta.vuid + '.jpg';

    this.media = {src: this.getVideoSource()};

    this.Player.loadMedia(this.media, function() {
      self.Player.poster(poster);
      self.Player.playbackRate(self.playbackRate);
    });

    this.updateSkipButtons();
    this.updatePlayerSettingsMenu();
    this.updatePlayerTitle();
    this.updatePlayerRating();

    if( this.playerType == "background" ) { this.updateVideoInfo(); }

    if('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.meta.title,
        artist: this.meta.user.name,
        artwork: [
          { src: this.URLbase + 'images/thumb/small_img/' + this.meta.vuid + '.jpg', sizes: '320x180', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', function() { self.play(); });
      navigator.mediaSession.setActionHandler('pause', function() { self.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', function() { self.seekBackward(); });
      navigator.mediaSession.setActionHandler('seekforward', function() { self.seekForward(); });

      if( this.meta.previousVideo != "" ) {
        navigator.mediaSession.setActionHandler('previoustrack', function() { self.previousVideo(); });
      } else {
        navigator.mediaSession.setActionHandler('previoustrack', null );
      }

      if( this.meta.nextVideo != "" ) {
        navigator.mediaSession.setActionHandler('nexttrack', function() { self.nextVideo(); });
      } else {
        navigator.mediaSession.setActionHandler('nexttrack', null );
      }
    }
  }

  updatePlayerSettingsMenu() {
    const self = this;
    $('#'+this.playerId+' .vjs-resolution-settings .vjs-setting-value').html( this.selectedRes );
    $('#'+this.playerId+' .vjs-resolution-settings-dropdown').html( this.genDropDownOptions( this.meta.availableSources.reverse(), this.selectedRes ) );

    $('#'+this.playerId+" .vjs-resolution-settings").unbind('click').bind( 'click', function() { self.openPlayerResolutionSettings(); });

    $('#'+this.playerId+" .vjs-resolution-settings").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.openPlayerResolutionSettings(true); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });

    $('#'+this.playerId+" .vjs-resolution-settings-dropdown .vjs-settings-dropdown-option").unbind('click').bind( 'click', function() {
      self.changeSource( $(this).attr("value") );
    });

    $('#'+this.playerId+" .vjs-resolution-settings-dropdown .vjs-settings-dropdown-option").keyup( function( event ) {
      if( event.which == 32 || event.which == 13 ) { self.changeSource( $(this).attr("value") ); }
      if( event.which == 27 ) { self.closePlayerSettingsMenu(); }
    });
  }

  updatePlayerTitle() {
    $('#'+this.playerId+' .vjs-header-title').html(this.meta.title);
  }

  updatePlayerRating() {
    $('#'+this.playerId+' .vjs-rating-upvote').attr( 'data-title', t('VIDEO_LIKE') + " (" + n(this.meta.rating[0]) + ")" );
    $('#'+this.playerId+' .vjs-rating-downvote').attr( 'data-title', t('VIDEO_DISLIKE') + " (" + n(this.meta.rating[1]) + ")" );

    $('#'+this.playerId+' .vjs-rating-percent').html( this.meta.rating[0] == 0 ? "0%" : Math.floor( this.meta.rating[0] / ( this.meta.rating[0] + this.meta.rating[1] ) * 100 ) + "%" );
  }

  changeSource( resolution ) {
    const self = this;

    if( this.selectedRes != resolution ) {
      this.selectedRes = resolution;
      const currentTime = this.Player.currentTime();
      const videoIsPlaused = this.Player.paused();
      const isVideoMuted = this.Player.muted();
      const fileType = ( this.selectedRes == "audio" ? ".mp3" : ".mp4" );

      this.Player.muted(true);
      this.Player.pause();

      this.Player.src( this.URLbase + '/videos/' + this.meta.datavuid  + '/' + this.selectedRes + fileType );

      this.Player.currentTime(currentTime);
      this.Player.play();

      if( !isVideoMuted ){ this.Player.muted(false) };

      if( videoIsPlaused ) {
        this.Player.on('playing', () => {
          self.Player.pause();
          self.Player.playbackRate(self.playbackRate);
          self.Player.off('playing')
        });
      } else {
        this.Player.on('playing', () => {
          self.Player.playbackRate(self.playbackRate);
          self.Player.off('playing')
        });
      }

      $('#'+this.playerId+' .vjs-resolution-settings .vjs-setting-value').html(resolution);
      $('#'+this.playerId+' .vjs-resolution-settings-dropdown .vjs-settings-dropdown-option').removeClass('active');
      $('#'+this.playerId+' .vjs-resolution-settings-dropdown .vjs-settings-dropdown-option[value="' + resolution + '"]').addClass('active');
    }

    this.closePlayerSettingsMenu();
  }

  changePlaybackRate( playbackRate ) {
    if( this.playbackRate != playbackRate ) {
      this.playbackRate = playbackRate;
      this.Player.playbackRate(this.playbackRate);

      $('#'+this.playerId+' .vjs-speed-settings .vjs-setting-value').html(playbackRate);
      $('#'+this.playerId+' .vjs-speed-settings-dropdown .vjs-settings-dropdown-option').removeClass('active');
      $('#'+this.playerId+' .vjs-speed-settings-dropdown .vjs-settings-dropdown-option[value="' + playbackRate + '"]').addClass('active');
    }

    this.closePlayerSettingsMenu();
  }

  changefullscreenUi( fullscreenUi ) {
    if( this.fullscreenUi != fullscreenUi ) {
      this.fullscreenUi = fullscreenUi;

      $('#'+this.playerId+' .vjs-fullscreen-settings .vjs-setting-value').html(fullscreenUi);
      $('#'+this.playerId+' .vjs-fullscreen-settings-dropdown .vjs-settings-dropdown-option').removeClass('active');
      $('#'+this.playerId+' .vjs-fullscreen-settings-dropdown .vjs-settings-dropdown-option[value="' + fullscreenUi + '"]').addClass('active');
    }

    this.closePlayerSettingsMenu();
  }

  play(){ this.Player.play(); }
  pause(){ this.Player.pause(); }
  seekBackward(){ this.setTime( this.Player.currentTime() - this.seekTime ); }
  seekForward(){ this.setTime( this.Player.currentTime() + this.seekTime ); }
  nextVideo(){ if( this.meta.nextVideo != "" ){ goToPage('watchPage.php?v=' + this.meta.nextVideo + ( this.meta.playlistId != "" ? '&pl=' + this.meta.playlistId : "" ) ); } }
  previousVideo() {
    if( this.Player.currentTime() <= 5 ) {
      this.setTime( 0 );
    } else if( this.meta.previousVideo != "" ) {
      goToPage('watchPage.php?v=' + this.meta.previousVideo + ( this.meta.playlistId != "" ? '&pl=' + this.meta.playlistId : "" ) );
    }
  }

  setTime( time ){ this.Player.currentTime( time ); }

  videoEnded() {
    //add checks for e.g. still typing etc.
    this.nextVideo();
  }
}
