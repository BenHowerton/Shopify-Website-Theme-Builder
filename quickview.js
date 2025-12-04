// Quick View
$(document).ready(function () {
	quickView();
});


function quickView() {
	$(".quick-view").click(function (e) {
		let content;
		e.preventDefault();
		/*if ($('#quick-view').length == 0) {
			$("body").append('<div id="quick-view">' +
				'<a href="#" class="modal-close-button fancybox-close-button" onclick="$.fancybox.close(); event.preventDefault();"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 14 14">\n' +
				'<rect y="12.728" width="18" height="1.5" transform="rotate(-45 0 12.728)" fill="currentColor"/>\n' +
				'<rect x="1.06055" width="18" height="1.5" transform="rotate(45 1.06055 0)" fill="currentColor"/>\n' +
				'</svg></a>' +
				'<div class="qv-content">' +
				'<div class="qv-wrapper"></div></div></div>');
		}*/
		var product_handle = $(this).data('handle');
		$('#quick-view').addClass(product_handle);
		$.ajax({
			url: '/products/' + product_handle,
		}).done(function (text) {
			const newDiv = document.createElement("div");
			newDiv.innerHTML = text;

			$(newDiv).find(".product__additional-wrapper").remove();
			$(newDiv).find(".share-buttons").remove();
			$(newDiv).find(".product__pickup-availabilities").remove();
			$(newDiv).find(".pickup-availability-preview").remove();
			$(newDiv).find(".product__text").remove();
			$(newDiv).find(".product__tags").remove();
			$(newDiv).find(".product__info-wrapper .modals").remove();
			$(newDiv).find(".js-media-sublist").remove();
			$(newDiv).find(".product__media-toggle").remove();
			$(newDiv).find(".product__media-icon").remove();
			$(newDiv).find(".product-recommendations--single").remove();
			let scripts = $(newDiv).find("script");

			for (let i = 0; i < scripts.length; i++) {
				let source = "" + $(scripts[i]).attr("src");

				if(source){
					if( source.indexOf("copy.js") > -1 || source.indexOf("pickup-availability.js") > -1 ){
						$(scripts[i]).remove();
					}
				}

			}

			$(newDiv).find('.product-form__submit').addClass('button--secondary');

			content = $(newDiv).find(".product-section");
			$("#quick-view .qv-wrapper").append(content);
		});
	});
}

document.addEventListener('shopify:section:load', function () {
	quickView();
});

