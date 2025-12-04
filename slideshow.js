;(function () {
	
	const animateLines = (lines, delay=0) => {
		lines.forEach((line, i) => {
			line.classList.add('animated');
			Array.from(line.children).forEach((element) => {
				element.style.animationDelay = `${delay + (i * 0.25)}s`;
				
				setTimeout(() => {
					line.style.overflow = 'visible';
				}, delay*1000 + (i * 250) + 600);
			});
		});
	};

	const headingAnimation = () => {
		const slideshowTexts = document.querySelectorAll('.slideshow-slide__text--animation');
		const headings = document.querySelectorAll('.js-split-text');

		const splitHeadings = () => {
			if (document.querySelectorAll('.js-split-text').length > 0) {
				const split = new SplitType(
					document.querySelectorAll('.js-split-text'),
				);

				headings.forEach((heading) => {
					heading.classList.add('visible');
				});
			}
		};

		const textObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const lines = entry.target.querySelectorAll('.js-split-text .line');
					if (entry.isIntersecting) {
						let speed = Number(entry.target.closest('.slideshow').dataset.speed);
						let speedFade = speed;
						if (lines) {
							speedFade = speed*1000 + (lines.length)*250 + 100;
							animateLines(lines,speed);
						}
						setTimeout(() => {
							entry.target.querySelectorAll('.js-fade').forEach(item => {
								item.classList.add('visible');
							})
						}, (speedFade + 100));
					}
					else {
						lines.forEach((line, i) => {
							line.classList.remove('animated');
							line.style.overflow = 'hidden';
						})
						entry.target.querySelectorAll('.js-fade').forEach(item => {
							item.classList.remove('visible');
						})
					}
				});
			},
			{
				rootMargin: "0px 0px 0px 0px"
			},
		);
		
		const resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				const lines = entry.target.querySelectorAll('.js-split-text .line');
				if (lines) {
					splitHeadings(lines);
					animateLines(lines);
				}
				slideshowTexts.forEach((text) => {
					textObserver.observe(text);
				});
			});
		});

		splitHeadings();
		slideshowTexts.forEach((text) => {
			textObserver.observe(text);
			resizeObserver.observe(text);
		});
	};

	const slideshow = () => {
		$('.slideshow-section').each(function () {
			let zIndex;
			if ($(this).hasClass('slider_started')) {
				return ''
			}
			$(this).addClass('slider_started')
			const id = $(this).attr('id')
			const box = $(this).find('.slideshow')
			const autoplay = box.data('autoplay')
			const stopAutoplay = box.data('stop-autoplay')
			const delay = box.data('delay') * 1000
			const speed = box.data('speed') * 1000
			const effect = box.data('effect') == "custom" ? "fade": box.data('effect')
			let autoplayParm;
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
						waitForTransition: true
					},
				}
			} else {
				autoplayParm = {}
			}
			let swiperParms = {
				parallax: box.data('parallax'),
				effect: effect,
				virtualTranslate: effect == "custom",
				watchSlidesProgress: true,
				speed: speed,
				loop: false,
				centeredSlides: false,
				autoHeight: false,
				calculateHeight: false,
				keyboard: true,
				fadeEffect: { 
					crossFade: true 
				},
				creativeEffect: {
					prev: {
						shadow: false,
						translate: [0, 0, -400],
					},
					next: {
						translate: ['100%', 0, 0],
					},
				},
				coverflowEffect: {
					rotate: 50,
					stretch: 0,
					depth: 100,
					modifier: 1,
					slideShadows: false,
				},
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: 'true',
					type: 'bullets',
				},
				...autoplayParm,
				on: {
					init: function () {
						//Fix for first slide
						if (box.data('effect') == "custom") {
							const firstSlide = this.slides[0];
							if (firstSlide.classList.contains('swiper-slide-active')) {
								firstSlide.classList.add('no-animation');
							}
						}
					}
				}
			}
			zIndex = $(this).find('.slideshow-swiper__slide').length;
			const swiper = new Swiper(`#${id} .slideshow__swiper`, swiperParms)

			//Fix pause on mouse enter for custom effect
			const swiperContainer = swiper.el.querySelector('.swiper-wrapper');
			if (box.data('effect') == "custom" && autoplay && stopAutoplay) {
				swiperContainer.addEventListener('mouseenter', () => {
					swiper.autoplay.stop(); 
				});
			
				swiperContainer.addEventListener('mouseleave', () => {
					swiper.autoplay.start();
				});
			}
					
			swiper.on('transitionStart', function () {
				if (box.data('effect') == "custom") {
					zIndex = zIndex + 1;
					this.slides[this.activeIndex].style.setProperty("z-index", `${zIndex}`);
				}
			})

			swiper.on('transitionEnd', function () {
				//Remove text animation for other slides
				this.slides.forEach((slide,i) => {
					if (i != this.activeIndex) {
						const headingSlide = slide.querySelector('.js-split-text');
						if (headingSlide) {
							const linesSlide = headingSlide.querySelectorAll('.line');
							linesSlide.forEach(line => {
								line.classList.remove('animated');
								line.style.overflow = 'hidden';
							})
						}
						slide.querySelectorAll('.js-fade').forEach(item => {
							item.classList.remove('visible');
						})
					}
				})
			})
			
			swiper.on('beforeTransitionStart', function () {
				colorScheme(this)
			})
			swiper.on('slideChange', function () {
				box.css('--bullet-duration', `${delay + speed}ms`)
				colorScheme(this)

				if (box.data('effect') == "custom") {
					//Fix for first slide
					const firstSlide = this.slides[0];
					firstSlide.classList.remove('no-animation'); 

					//Fix autoplay for custom effect
					if (this.params.autoplay.waitForTransition == true) {
						this.params.autoplay.delay = delay + speed; 
						this.params.autoplay.waitForTransition = false;
						this.autoplay.stop();
						this.autoplay.start();
					}
				}
			})

			function colorScheme(context) {
				//const parent = $(context.el).parent();
				const parent = box.find('.slideshow-bottom')
				const activeIndex = context.activeIndex
				const activeSlide = context.slides[activeIndex]
				const changeItems = [parent[0]]
				const colorScheme = $(activeSlide)
					.find('.slideshow-slide')
					.data('color-scheme')
				changeItems.forEach((item) => {
					if (!item) return ''
					const classes = item.classList
					for (let className of classes) {
						if (/color-background-\d+$/.test(className)) {
							item.classList.remove(className)
						}
					}
					item.classList.add(colorScheme)
				})
			}

			const resizeObserver = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					const style = window.getComputedStyle(entry.target.querySelector('.container'));
					const paddingLeft = parseFloat(style.paddingLeft);
					const paddingRight = parseFloat(style.paddingRight);
					const widthSlide = entry.contentRect.width - paddingLeft - paddingRight;
					entry.target.style.setProperty("--width-slide", `${widthSlide}px`);
				})
			})
			resizeObserver.observe($(this)[0]);
		})
	}

	document.addEventListener('DOMContentLoaded', function () {
		slideshow();
		headingAnimation();

		document.addEventListener('shopify:section:load', function () {
			slideshow();
			headingAnimation();
		})
	})
})()
