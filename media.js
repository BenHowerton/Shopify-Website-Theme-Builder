(function () {
  const playVideo = (card) => {
    const video = card.querySelector(".simple-media-card__video video");
    if (video) {
      const button = card.querySelector(".js-play-video");

      if (video.parentElement.classList.contains("autoplay")) {
        video.autoplay = true;
        if (button) {
          button.classList.add("active");
        }
      }

      if (video.autoplay && video.paused) {
        video.play();
      }

      if (!video.autoplay && button) {
        button.classList.remove("active");
      }

      if (video.parentElement.dataset.videoLoop === 'false') {
        video.addEventListener("ended", () => {
          button.classList.remove("active");
        });
      }
    }

    const videoUrl = card.querySelector(".simple-media-card__video iframe");
    if (videoUrl) {
      const button = card.querySelector(".js-play-video");
      if (videoUrl.parentElement.classList.contains("autoplay")) {
        if (videoUrl.classList.contains("js-youtube")) {
          videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
          } else {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
          }
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        } else if (videoUrl.classList.contains("js-vimeo")) {
          videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
          } else {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
          }
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        }
        if (button) {
          button.classList.add("active");
        }
      }

      if (videoUrl.parentElement.classList.contains("autoplay") && videoUrl.classList.contains("video-pause")) {
        if (videoUrl.classList.contains("js-youtube")) {
          videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
          } else {
            videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
          }
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        } else if (videoUrl.classList.contains("js-vimeo")) {
          videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
          if (videoUrl.classList.contains("video-muted")) {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
          } else {
            videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
          }
          videoUrl.classList.add("video-play");
          videoUrl.classList.remove("video-pause");
        }
      }

      if (!videoUrl.parentElement.classList.contains("autoplay") && button) {
        button.classList.remove("active");
      }
    }
  };

  const stopVideo = (card) => {
    const videoActive = card.querySelector(".simple-media-card__video video");
    if (videoActive) {
      videoActive.pause();
    }

    const videoUrlActive = card.querySelector(".simple-media-card__video iframe");
    if (videoUrlActive) {
      if (videoUrlActive.classList.contains("js-youtube")) {
        videoUrlActive.contentWindow.postMessage('{"event":"command","func":"' + "pauseVideo" + '","args":""}', "*");
        videoUrlActive.classList.add("video-pause");
        videoUrlActive.classList.remove("video-play");
      } else if (videoUrlActive.classList.contains("js-vimeo")) {
        videoUrlActive.contentWindow.postMessage('{"method":"pause"}', "*");
        videoUrlActive.classList.add("video-pause");
        videoUrlActive.classList.remove("video-play");
      }
    }
  };

  const controlsVideo = (section) => {
    const buttonsPlay = section.querySelectorAll(".js-play-video");
    const buttonsSound = section.querySelectorAll(".js-sound-video");

    buttonsPlay.forEach((button) => {
      button.addEventListener("click", (event) => onClickPlayPause(event));
      function onClickPlayPause(event) {
        const buttonPlay = event.currentTarget;
        const parentElement = event.currentTarget.parentNode;
        if (buttonPlay.classList.contains("js-play-video") && parentElement.previousElementSibling.classList.contains("simple-media-card__video")) {
          const video = parentElement.previousElementSibling.querySelector("video");
          if (video) {
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
            buttonPlay.classList.toggle("active");
          }

          const videoUrl = parentElement.previousElementSibling.querySelector("iframe");
          if (videoUrl) {
            if (videoUrl.classList.contains("video-pause")) {
              if (videoUrl.classList.contains("js-youtube")) {
                videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "playVideo" + '","args":""}', "*");
                if (videoUrl.classList.contains("video-muted")) {
                  videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "mute" + '","args":""}', "*");
                } else {
                  videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "unMute" + '","args":""}', "*");
                }
                videoUrl.classList.add("video-play");
                videoUrl.classList.remove("video-pause");
              } else if (videoUrl.classList.contains("js-vimeo")) {
                videoUrl.contentWindow.postMessage('{"method":"play"}', "*");
                if (videoUrl.classList.contains("video-muted")) {
                  videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":0}', "*");
                } else {
                  videoUrl.contentWindow.postMessage('{"method":"setVolume", "value":1}', "*");
                }
                videoUrl.classList.add("video-play");
                videoUrl.classList.remove("video-pause");
              }
            } else {
              if (videoUrl.classList.contains("js-youtube")) {
                videoUrl.contentWindow.postMessage('{"event":"command","func":"' + "pauseVideo" + '","args":""}', "*");
                videoUrl.classList.add("video-pause");
                videoUrl.classList.remove("video-play");
              } else if (videoUrl.classList.contains("js-vimeo")) {
                videoUrl.contentWindow.postMessage('{"method":"pause"}', "*");
                videoUrl.classList.add("video-pause");
                videoUrl.classList.remove("video-play");
              }
            }
            buttonPlay.classList.toggle("active");
          }
        }
      }
    });

    buttonsSound.forEach((button) => {
      button.addEventListener("click", (event) => onClickSound(event));
      function onClickSound(event) {
        const buttonSound = event.currentTarget;
        const parentElement = event.currentTarget.parentNode;
        if (
          buttonSound.classList.contains("js-sound-video") &&
          parentElement.previousElementSibling.classList.contains(
            "simple-media-card__video"
          )
        ) {
          const video =
            parentElement.previousElementSibling.querySelector("video");
          if (video) {
            if (video.muted) {
              setTimeout(() => {
                video.muted = false;
              }, 10);
            } else {
              setTimeout(() => {
                video.muted = true;
              }, 10);
            }
            buttonSound.classList.toggle("active");
          }

          const videoUrl =
            parentElement.previousElementSibling.querySelector("iframe");
          if (videoUrl) {
            if (videoUrl.classList.contains("video-muted")) {
              if (videoUrl.classList.contains("js-youtube")) {
                videoUrl.contentWindow.postMessage(
                  '{"event":"command","func":"' + "unMute" + '","args":""}',
                  "*"
                );
                videoUrl.classList.remove("video-muted");
              } else if (videoUrl.classList.contains("js-vimeo")) {
                videoUrl.contentWindow.postMessage(
                  '{"method":"setVolume", "value":1}',
                  "*"
                );
                videoUrl.classList.remove("video-muted");
              }
            } else {
              if (videoUrl.classList.contains("js-youtube")) {
                videoUrl.contentWindow.postMessage(
                  '{"event":"command","func":"' + "mute" + '","args":""}',
                  "*"
                );
                videoUrl.classList.add("video-muted");
              } else if (videoUrl.classList.contains("js-vimeo")) {
                videoUrl.contentWindow.postMessage(
                  '{"method":"setVolume", "value":0}',
                  "*"
                );
                videoUrl.classList.add("video-muted");
              }
            }
            buttonSound.classList.toggle("active");
          }
        }
      }
    });
  };

  const addClasses = (slider) => {
    const sliderWrapper = slider.querySelector(".simple-media-list__wrapper");
    const slides = slider.querySelectorAll(".simple-media-card");

    slider.classList.add("swiper");
    if (sliderWrapper) sliderWrapper.classList.add("swiper-wrapper");
    if (slides.length > 1) {
      slides.forEach((slide) => {
        slide.classList.add("swiper-slide");
      });
    }
  };

  const removeClasses = (slider) => {
    const sliderWrapper = slider.querySelector(".simple-media-list__wrapper");
    const slides = slider.querySelectorAll(".simple-media-card");

    slider.classList.remove("swiper");
    if (sliderWrapper) sliderWrapper.classList.remove("swiper-wrapper");
    slides.forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove("swiper-slide");
    });
  };

  const initSlider = (section) => {
    const slider = section.querySelector(".swiper--media");

    if (slider) {
      addClasses(slider);

      new Swiper(slider, {
        loop: false,
        speed: 800,
        breakpoints: {
          320: {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 8,
          },
          750: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 16,
          },
        },
        pagination: {
          el: slider.querySelector(".simple-media__pagination"),
          clickable: true,
          type: "custom",
          renderCustom: function (swiper, current, total) {
            let out = "";
            for (let i = 1; i < total + 1; i++) {
              if (i == current) {
                out = `${out}<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
              } else {
                out = `${out}<span class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`;
              }
            }
            return out;
          },
        },
      });
    }
  };

  const destroySlider = (section) => {
    const slider = section.querySelector('.swiper--media');

    if (slider) {;
      removeClasses(slider);
    }
  };

  const initSection = (section) => {
    if (section && section.classList.contains('media-section')) {
      const sectionResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.contentRect.width < 990) {
            initSlider(entry.target);
          } else {
            destroySlider(entry.target);
          }
        })
      });

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          let mediaCards = entry.target.querySelectorAll(".simple-media-card");

          if (entry.isIntersecting) {
            mediaCards.forEach((card) => playVideo(card));
          } else {
            mediaCards.forEach((card) => stopVideo(card));
          }
        });
      });

      sectionResizeObserver.observe(section);
      sectionObserver.observe(section);
      controlsVideo(section);
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (section) {
    initSection(section.target);
  });
})();
