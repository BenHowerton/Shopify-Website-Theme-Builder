(function () {
  function swiperInit() {
    subSliderInit(true);
    sliderInit(true);
    popupSliderInit(true);
  }

  document.addEventListener("shopify:section:load", function (e) {
    swiperInit();
  });

  swiperInit();
})();
