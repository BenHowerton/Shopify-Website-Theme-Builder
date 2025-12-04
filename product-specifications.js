(function () {
  const initCollapsibleContent = () => {
    $(".product-specifications__toggle").each(function (index, element) {
      if ($(this).hasClass("content_started")) {
        return "";
      }
      $(this).addClass("content_started");
      $(element).on("click", function () {
        const parent = $(this).parent();

        if (!parent.hasClass("active")) {
          parent.siblings(".product-specifications__item.active").removeClass("active");
          parent.addClass("active");
          $(this)
            .closest(".product-specifications__items")
            .find(".product-specifications__answer")
            .stop()
            .slideUp(300);
          $(this).next().stop().slideDown(300);
        } else {
          parent.removeClass("active");
          $(this).next().stop().slideUp(300);
        }
      });
    });

    $(".product-specifications__item").mouseenter(function (event) {
      const element = $(this);
      element.removeClass("product-specifications__item--opacity");
      element.siblings().addClass("product-specifications__item--opacity");
      element.mouseleave(() => {
        element.siblings().removeClass("product-specifications__item--opacity");
      });
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initCollapsibleContent();
    document.addEventListener("shopify:section:load", function () {
      initCollapsibleContent();
    });
  });
})();

