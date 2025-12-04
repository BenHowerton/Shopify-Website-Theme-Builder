(function () {
  const slideshow = () => {
    $(".product-slideshow-section").each(function () {
      if ($(this).hasClass("slider_started")) {
        return "";
      }
      $(this).addClass("slider_started");
      const id = $(this).attr("id");
      const box = $(this).find(".product-slideshow");
      const isAutoplay = box.data("autoplay");
      const isLoop = box.data("loop");
      const stopAutoplay = box.data("stop-autoplay");
      const delay = box.data("delay") * 1000;
      const slideCount = box.data("slide-count");

      let autoplayParam;
      if (isAutoplay && slideCount > 1) {
        autoplayParam = {
          autoplay: {
            delay: delay,
            pauseOnMouseEnter: stopAutoplay,
            disableOnInteraction: false,
          },
        };
      } else {
        autoplayParam = {
          autoplay: false
        };
      }

      let loopParam;
      if (isLoop && slideCount > 1) {
        loopParam = {
          loop: true,
          loopedSlides: loopedSlides,
          loopedSlidesLimit: loopedSlides,
        }
      } else {
        loopParam = {
          loop: false,
        }
      }

      const swiperMediaParams = {
        speed: box.data("speed") * 1000,
        effect: box.data("effect"),
        ...loopParam,
        autoHeight: false,
        calculateHeight: false,
        allowTouchMove: true,
        ...autoplayParam,
        centeredSlides: false,
        creativeEffect: {
          prev: {
            shadow: true,
            translate: [0, 0, -400],
          },
          next: {
            translate: ["100%", 0, 0],
          },
        },
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
      };

      const swiperProductParams = {
        speed: box.data("speed") * 1000,
        ...loopParam,
        autoplay: false,
        allowTouchMove: false,
        keyboard: true,
        effect: "creative",
        creativeEffect: {
          limitProgress: loopedSlides - 1,
          prev: {
            translate: [-10, 0, 0],
            scale: 0.92,
          },
          next: {
            translate: [-20, 0, 0],
            scale: 0.92,
          },
        },
        cardsEffect: {
          perSlideOffset: -8,
          perSlideRotate: 0,
          rotate: false,
          slideShadows: false,
        },
        navigation: {
          nextEl: `#${id} .swiper-button-next`,
          prevEl: `#${id} .swiper-button-prev`,
        },
        pagination: {
          el: `#${id} .swiper-pagination`,
          clickable: true,
        },
      };

      const swiperMediaElement = document.querySelector(`#${id} .product-slideshow-media`);
      const swiperMedia = new Swiper(swiperMediaElement, {
        ...swiperMediaParams,
      });

      const swiperProductElement = document.querySelector(`#${id} .product-slideshow-item`);
      const swiperProduct = new Swiper(swiperProductElement, {
        ...swiperProductParams,
      });

      const getProductCardHeight = () => {
        const productCardHeight = swiperProductElement.getBoundingClientRect().height;
        box[0].style.setProperty('--product-card-height', `${productCardHeight}px`);
      }
      getProductCardHeight();

      const observer = new ResizeObserver((entries) => {
        getProductCardHeight();
      })
      observer.observe(this);

      swiperMedia.controller.control = swiperProduct;
      swiperProduct.controller.control = swiperMedia;
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    slideshow();
    document.addEventListener("shopify:section:load", function () {
      slideshow();
    });
  });
})();
