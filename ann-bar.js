(function () {
  const initAnnBar = () => {
    const annBar = document.querySelector(".section-announcement");

    let observer;
    const createObserver = () => {
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const annBarHeight = annBar?.getBoundingClientRect().height || 0;
              document.documentElement.style.setProperty(
                "--ann-height",
                `${(annBarHeight * entry.intersectionRatio).toFixed(2)}px`
              );
            } else {
              document.documentElement.style.setProperty("--ann-height", "0px");
            }
          });
        },
        {
          threshold: Array.from({ length: 1000 }, (_, i) => i / 1000),
        }
      );

      if (annBar) observer.observe(annBar);
    };
    createObserver();
  };

  document.addEventListener("shopify:section:load", initAnnBar);
  document.addEventListener("shopify:section:unload", initAnnBar);
  document.addEventListener("shopify:section:reorder", initAnnBar);

  initAnnBar();
})();