/**
 * element can have these data attributes:
 * data-scrollanimation = a class to add to this element on scroll
 * data-scrollhook = onEnter, onLeave, defualt is center
 * data-scrolloffset = offset from scene start
 * data-scrolltrigger = the element that triggers the scene to start
 * data-scrollduration = how long it should last. if not set, 0  is used and that means it doesnt reset until you scroll up.
 * data-scrollscrub = tweens between two classes. tween expects a duration, else duration will be 100
 *
 */

//test if this is a touchscreen
if (!("ontouchstart" in document.documentElement)) {
	document.documentElement.className += " no-touch";
}else{
	document.documentElement.className += " touch-device";
}

let scrollMagicController = '';
function runScrollerAttributes (element) {
	//this function can be run on an alement even after load and they will be added to scrollMagicController
	//scrollmagic must be loaded
	if ('undefined' != typeof ScrollMagic && element.hasAttribute('data-scrollanimation')) {

		//scroll animation attributes
		let animationClass = element.dataset.scrollanimation,
			triggerHook = element.dataset.scrollhook || 'center',
			offset = element.dataset.offset || 0,
			triggerElement = element.dataset.scrolltrigger || element,
			duration = element.dataset.duration || 0,
			tween = element.dataset.scrollscrub,
			scene = '';

		//if animation has word up or down, its probably an animation that moves it up or down,
		//so make sure trigger element
		if (-1 !== animationClass.toLowerCase().indexOf('up') || -1 !== animationClass.toLowerCase().indexOf('down')) {
			//get parent element and make that the trigger, but use an offset from current element
			if (triggerElement === element) {
				triggerElement = element.parentElement;
			}
			offset = (element.offsetTop - triggerElement.offsetTop) + offset;
		}

		//if fixed at top, wrap in div
		if (element.getAttribute('data-scrollanimation') === 'fixed-at-top') {
			let wrappedElement = wrap(element, document.createElement('div'));
			wrappedElement.classList.add('fixed-holder');
			wrappedElement.style.height = element.offsetHeight + 'px';
			triggerHook = 'onLeave';
			triggerElement = element.parentElement;
		}

		//if scrollscrub exists used tweenmax
		if(tween !== undefined){
			if (! duration) {
				duration = 100;
			}

			tween = TweenMax.to(element, .65, {
				className: '+=' + animationClass
			});

			//finally output the scene
			scene = new ScrollMagic.Scene({
				triggerElement: triggerElement,
				offset: offset,
				triggerHook: triggerHook,
				duration: duration

			}).setTween(tween).addTo(scrollMagicController)
			// .addIndicators()
			;
		}else{
			scene = new ScrollMagic.Scene({
				triggerElement: triggerElement,
				offset: offset,
				triggerHook: triggerHook,
				duration: duration

			}).setClassToggle(element, animationClass).addTo(scrollMagicController)
			//.addIndicators()
			;
		}

		//good for knowing when its been loaded
		document.body.classList.add('scrollmagic-loaded');

	}
}



//LOAD IGNITION EVENTS
document.addEventListener('DOMContentLoaded', function () {

	scrollMagicController = new ScrollMagic.Controller();
	document.querySelectorAll('[data-scrollanimation]').forEach( (element) => {
		runScrollerAttributes(element);
	});


	//TOGGLE BUTTONS
	//adding new custom event for after the element is toggled
	let toggleEvent = null;
	if ( isIE11 ) {
		toggleEvent = document.createEvent( 'Event' );

		// Define that the event name is 'build'.
		toggleEvent.initEvent( 'afterToggle', true, true );

	} else {
		toggleEvent = new Event( 'afterToggle' );
	}

	//add aria to buttons currently on page
	let buttons = document.querySelectorAll('[data-toggle]');
	buttons.forEach(button => {
		button.setAttribute('role', 'switch');
		button.setAttribute('aria-checked', button.classList.contains('toggled-on') ? 'true' : 'false');

	});

	//toggling the buttons with delegation click
	document.body.addEventListener('click', e => {

		let item = e.target.closest('[data-toggle]');

		if (item) {

			let $doDefault = item.getAttribute( 'data-default' );

			if ( null === $doDefault ) {
				e.preventDefault();
				e.stopPropagation();
			}

			item.classList.toggle('toggled-on');
			item.setAttribute('aria-expanded', item.classList.contains('toggled-on') ? 'true' : 'false');

			let $class = item.getAttribute('data-toggle'),
				$target = document.querySelectorAll(item.getAttribute('data-target'));

			if ($class) {
				if ($target.length) {
					$target.forEach(targetItem => {
						targetItem.classList.toggle($class);
					});
				} else {
					item.classList.toggle($class);
				}
			} else {
				if ($target.length) {
					$target.forEach(targetItem => {
						targetItem.classList.toggle('toggled-on');
					});
				}
			}

			//trigger optional afterToggle event
			item.dispatchEvent(toggleEvent);

		}
	});

	//MOVING ITEMS
	//on Window resize we can move items to and from divs with data-moveto="the destination"
	//it will move there when the site reaches smaller than a size defaulted to 1030 or sett hat with data-moveat
	//the whole div, including the data att moveto moves back and forth
	let movedId = 0;

	function moveItems () {

		let windowWidth = window.innerWidth;
		let $moveItems = document.querySelectorAll('[data-moveto]');

		$moveItems.forEach(item => {
			let moveAt = item.getAttribute('data-moveat'),
				destination = document.querySelector(item.getAttribute('data-moveto')),
				source = item.getAttribute('data-movefrom');

			moveAt = moveAt ? moveAt : 1030;

			if (moveAt.startsWith('--')) {
				let cssVars = getComputedStyle(document.body); //get css variables
				moveAt = parseInt(cssVars.getPropertyValue(moveAt), 10);
			}


			if (!destination) {
				return;
			}

			//if no data movefrom is found add one to parent so we can move items back in. now they go back and forth
			if (!source) {
				let sourceElem = item.parentElement.id;

				//if parent has no id attr, add one with a number so its unique
				if (!sourceElem) {
					item.parentElement.setAttribute('id', 'move-' + movedId);
					movedId++;
					sourceElem = item.parentElement.id;
				}

				item.setAttribute('data-movefrom', '#' + sourceElem);
			}

			source = document.querySelector(item.getAttribute('data-movefrom'));

			//if the screen is smaller than moveAt (1030), move to destination
			if (windowWidth < moveAt) {
				if (item.hasAttribute('data-moveto-pos')) {
					destination.insertBefore(item, destination.children[item.getAttribute('data-moveto-pos')]);
				} else {
					destination.appendChild(item);
				}
			} else {
				if (item.hasAttribute('data-movefrom-pos')) {
					source.insertBefore(item, source.children[item.getAttribute('data-movefrom-pos')]);
				} else {
					source.appendChild(item);
				}
			}

			//show it
			item.classList.add('visible');
		});
	}

	window.addEventListener('resize', throttle(moveItems, 250));

	moveItems();

	document.documentElement.classList.remove('dom-loading');

	let EventFinished = null;
	if ( isIE11 ) {
		EventFinished = document.createEvent( 'Event' );

		// Define that the event name is 'build'.
		EventFinished.initEvent( 'afterIgnEvents', true, true );

	} else {
		EventFinished = new Event( 'afterIgnEvents' );
	}
	document.dispatchEvent( EventFinished );
});




//Add inline retina image if found and on retina device. To use add data-high-res to an inline element with a background-image
if( isHighDensity() ) {

	let retinaImage = document.querySelectorAll('[data-high-res]');
	retinaImage.forEach(item => {
		let image2x = '';
		//if a high res is provided use that, else use background image but add 2x at end.
		if(item.dataset.highRes){
			image2x = item.dataset.highRes;
		}else{
			//get url for original image
			let image = item.style.backgroundImage.slice(4, -1).replace(/"/g, "");
			//add @2x to it if image exists.
			image2x = image.replace(/(\.[^.]+$)/, '@2x$1');
		}

		if(fileExists(image2x)){
			item.style.backgroundImage = 'url("' + image2x + '")';
		}

	});
}

//check if device is retina
function isHighDensity(){
	return ((window.matchMedia && (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches)));
}

//check if file exists on server before using
function fileExists(image_url){
	let http = new XMLHttpRequest();
	http.open('HEAD', image_url, true);
	http.send();
	return http.status != 404;
}

