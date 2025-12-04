(function () {
  const initCollapsibleContent = () => {
    $(".collapsible-content__toggle").each(function (index, element) {
      if ($(this).hasClass("content_started")) {
        return "";
      }
      $(this).addClass("content_started");
      $(element).on("click", function () {
        const parent = $(this).parent();

        if (!parent.hasClass("active")) {
          parent.siblings(".collapsible-content__item.active").removeClass("active");
          parent.addClass("active");
          $(this)
            .closest(".collapsible-content__items")
            .find(".collapsible-content__answer")
            .stop()
            .slideUp(300);
          $(this).next().stop().slideDown(300);
        } else {
          parent.removeClass("active");
          $(this).next().stop().slideUp(300);
        }
      });
    });

    $(".collapsible-content__item").mouseenter(function (event) {
      const element = $(this);
      element.removeClass("collapsible-content__item--opacity");
      element.siblings().addClass("collapsible-content__item--opacity");
      element.mouseleave(() => {
        element.siblings().removeClass("collapsible-content__item--opacity");
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

