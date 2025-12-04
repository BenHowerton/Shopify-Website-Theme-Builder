$(window).on('load', function () {
	let selects = $('.js-select');

	if (selects) {
		selects.each(function() {
			const that = $(this);
			const defOption = $('<option value="Country" data-provinces="[]" selected disabled></option>');

			$(this).find('option:first-child').remove();
			$(this).find('select').prepend(defOption);

			$(this).find('select').change(function (e) {
				$(this).css('color', 'rgb(var(--color-foreground), 1)');
			});
		});
	}
});