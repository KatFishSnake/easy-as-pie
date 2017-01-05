
(function (moment) {
	var localStorageKey = 'easyAsPie';

	var localStorageModel = {
		id: '',
		weather: '',
		quote: '',
		author: '',
		color: ''
	};

	var weatherAPIkey = 'bfc0ae72e81bf2384896786a428a855f';

	function makeXHR(callback, url) {
		var xhr = new XMLHttpRequest();

		// The last parameter must be set to true to make an asynchronous request
		xhr.open('GET', url, true);

		xhr.setRequestHeader('Accept', 'application/json');
		
		xhr.onload = function() {
		  if (xhr.status >= 200 && xhr.status < 300) {
		    var data = JSON.parse(xhr.response);
		    callback(data);
		  } else {
		    console.log('Error !');
		  }
		};

		xhr.send();
	}

	function setLocalStorageItem (key, value) {
        try {
            localStorage.setItem(key, value);
        } catch(e) {
            return false;
        }
	}

	function removeLocalStorageItem (key) {
        try {
            localStorage.removeItem(key);
        } catch(e) {
            return false;
        }
	}

	function getLocalStorageItem (key) {
		var item = null;
        try {
            item = localStorage.getItem(key);
        } catch(e) {
            return false;
        }

        return item;
	}

	function setClockListeners() {
		var clockNode = document.querySelector('.clock');
		clockNode.setAttribute('class', 'clock fade-in');

		var clockTNode = document.querySelector('.clock-t');
		var clockANode = document.querySelector('.clock-a');

		var time = moment().format('h:mma');
		var t = time.slice(0, (time.length - 2));
		var a = time[time.length - 2] + time[time.length - 1];

		setInterval(function () {
			time = moment().format('h:mma');
			t = time.slice(0, (time.length - 2));
			a = time[time.length - 2] + time[time.length - 1];

			clockTNode.textContent = t.toString();				
			clockANode.textContent = a.toString();				
		}, 1000);

		clockTNode.textContent = t.toString();				
		clockANode.textContent = a.toString();
	}

	function setWeatherListeners() {
		var weatherNode = document.querySelector('.weather');
		var weatherTNode = weatherNode.querySelector('.temp');

		if (localStorageModel.weather && localStorageModel.weather.length) {
			weatherTNode.textContent = localStorageModel.weather;

			setTimeout(function () {
				weatherNode.setAttribute('class', 'weather fade-in');
			}, 200);

    		return false;
		}

	    if (navigator.geolocation) {

	        navigator.geolocation.getCurrentPosition(function (position) {
	        	makeXHR(function (data) {
	        		var temp = parseFloat(data.main.temp).toFixed(1);
					weatherTNode.textContent = temp;
	        		weatherNode.setAttribute('class', 'weather fade-in');

					localStorageModel.weather = temp.toString();
					localStorageModel.id = new Date().getTime();

					setLocalStorageItem(localStorageKey, JSON.stringify(localStorageModel));

	        	}, 'http://api.openweathermap.org/data/2.5/weather?lat=' + 
	        	position.coords.latitude + '&lon=' + position.coords.longitude + '&appid=' + weatherAPIkey + '&units=metric');
	        });
	    }
	}

	function setQuote () {
		var quoteNode = document.querySelector('.quote');
		var quoteBNode = document.querySelector('.quote-body');
		var quoteANode = document.querySelector('.quote-author');

		if (localStorageModel.quote && localStorageModel.author && 
			localStorageModel.quote.length && localStorageModel.author.length) {
			
			quoteBNode.textContent = '"' + localStorageModel.quote + '"';
			quoteANode.textContent = localStorageModel.author;

			setTimeout(function () {
				quoteNode.setAttribute('class', 'quote fade-in');  	
			}, 200);

    		return false;
		}

		makeXHR(function (data) {
			if(data.contents.quotes[0] && data.contents.quotes[0].quote.length) {
				quoteBNode.textContent = '"' + data.contents.quotes[0].quote + '"';
				quoteANode.textContent = data.contents.quotes[0].author;
				quoteNode.setAttribute('class', 'quote fade-in');  	

				localStorageModel.quote = data.contents.quotes[0].quote;
				localStorageModel.author = data.contents.quotes[0].author;
				localStorageModel.id = new Date().getTime();

				setLocalStorageItem(localStorageKey, JSON.stringify(localStorageModel));
			}
		}, 'http://quotes.rest/qod.json');
	}

	function setImage() {
		var imageNode = document.querySelector('.image');
		var mainNode = document.querySelector('main');

		var image = new Image();

		image.onload = function () {
			imageNode.style.backgroundImage = 'url("' + this.src + '")';
			imageNode.setAttribute('class', 'image fade-in');  
			mainNode.setAttribute('class', 'image-loaded');  
		};

		// Personal images
		// image.src = 'https://unsplash.it/1920/1200/?random'; // random fixed size
		// https://api.500px.com/v1/photos?feature=fresh_week&consumer_key=8Nvb8IV6QI81WrNJ4farNYzkqvgA75v3UbzMUxCx
		// https://www.reddit.com/domain/drscdn.500px.org/new.json
		image.src = 'https://source.unsplash.com/daily';
	}

	function emptyStorageIfExpired () {
		if (localStorageModel.id) {
			var jsonedLocal = JSON.parse(localStorageModel.id);

			var expiry = 28800 * 1000; // 8 hours

			var currentTime = new Date().getTime();
			var diff = currentTime - jsonedLocal.id;

			if (diff >= expiry) {
				removeLocalStorageItem(localStorageKey);
			}
		}
	}

	function setSettingsListeners () {
		var popperNode = document.querySelector('.popper');
		var settingsNode = document.querySelector('.settings');

		setTimeout(function () {
			settingsNode.setAttribute('class', 'settings fade-in');  	
		}, 200);

		popperNode.addEventListener('click', function () {
			settingsNode.classList.toggle('open');
		});
	}

	function setColorsListeners () {
		var colorNodes = document.querySelectorAll('.color');
		var mainNode = document.querySelector('main');

		console.log(localStorageModel);

		if(localStorageModel.color) {
			mainNode.style.color = localStorageModel.color;
		}

		[].map.call(colorNodes, function(node) {
			node.addEventListener('click', function (e) {
				var color = e.target.dataset.color;
				if (color) {
					mainNode.style.color = color;
					
					localStorageModel.color = color;
					console.log(localStorageModel);

					console.log(setLocalStorageItem(localStorageKey, JSON.stringify(localStorageModel)));
				}
			});
		});
	}

	function populateFromLocal() {
		var local = getLocalStorageItem(localStorageKey);
		if (local) {
			localStorageModel = JSON.parse(local);
		}

		emptyStorageIfExpired();
	}

	function setBGcolor () {
		var bodyNode = document.body;
		bodyNode.style.backgroundColor = "#"+((1<<24)*Math.random()|0).toString(16);
	}

	setTimeout(function () {
		setClockListeners();
	}, 200);

	populateFromLocal();

	setColorsListeners();

	setSettingsListeners();

	setWeatherListeners();

	setQuote();

	setImage();

})(moment);
