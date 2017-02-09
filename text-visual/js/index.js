'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vector2 = function () {
	function Vector2() {
		var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

		_classCallCheck(this, Vector2);

		this.x = x;
		this.y = y;
	}

	Vector2.prototype.add = function add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	};

	Vector2.prototype.multiplyScalar = function multiplyScalar(s) {
		this.x *= s;
		this.y *= s;
		return this;
	};

	Vector2.prototype.clone = function clone() {
		return new Vector2(this.x, this.y);
	};

	Vector2.fromScalar = function fromScalar(s) {
		return new Vector2(s, s);
	};

	return Vector2;
}();

var Clock = function () {
	function Clock() {
		_classCallCheck(this, Clock);

		this.reset();
		this.update();
	}

	Clock.prototype.reset = function reset() {
		this.start = Clock.now();
		this.previous = Clock.now();
	};

	Clock.prototype.update = function update() {
		var now = Clock.now();

		this.delta = now - this.previous;
		this.elapsed += this.delta;
		this.previous = now;
	};

	Clock.now = function now() {
		return Date.now() / 1000;
	};

	return Clock;
}();

var Walker = function () {
	function Walker(seed) {
		var position = arguments.length <= 1 || arguments[1] === undefined ? Vector2.fromScalar(0) : arguments[1];

		_classCallCheck(this, Walker);

		this.seed = seed;
		this.position = position;

		this.birth = Clock.now();
		this.lifetime = 3 + seed * 1;

		this.heading = seed * Math.PI * 2;
		this.headingDirection = Math.sin(this.heading) < 0 ? -1 : 1;
	}

	Walker.prototype.getAge = function getAge() {
		var now = Clock.now();
		return (now - this.birth) / this.lifetime;
	};

	Walker.prototype.isAlive = function isAlive() {
		var age = this.getAge();
		return age <= 1;
	};

	Walker.prototype.update = function update(delta) {
		if (!this.isAlive()) {
			return;
		}

		this.heading +=
		// Set rotate speed by seed
		this.seed / 4 *
		// Gives back and forth swirls
		Math.sin(this.getAge() * Math.PI * 2) *
		// Move in specified direction
		this.headingDirection;

		var velocity = new Vector2(Math.sin(this.heading), Math.cos(this.heading)).multiplyScalar(50 * delta);

		this.position.add(velocity);
	};

	Walker.prototype.render = function render(context) {
		if (!this.isAlive()) {
			return;
		}

		var scale = Math.min(context.canvas.width, context.canvas.height);
		var radius = (1 - this.getAge()) * 4 * scale / 1024;

		context.beginPath();
		context.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
		context.fill();
	};

	return Walker;
}();

var TextToSymbolFactory = function () {
	function TextToSymbolFactory() {
		_classCallCheck(this, TextToSymbolFactory);

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.clock = new Clock();
		this.walkers = [];

		this.loop = this.animate.bind(this);
	}

	TextToSymbolFactory.prototype.setSize = function setSize(width, height) {
		var pixelRatio = window.devicePixelRatio;

		this.canvas.width = width * pixelRatio;
		this.canvas.height = height * pixelRatio * .8;
	};

	TextToSymbolFactory.prototype.start = function start(data) {
		var _this = this;

		var _canvas = this.canvas;
		var width = _canvas.width;
		var height = _canvas.height;

		var scale = Math.min(width, height) / 3;
		var segments = new Array(64);

		this.clock.reset();

		for (var i = 0; i < segments.length; i++) {
			var charIndex = i / segments.length * (data.length - 1);
			var charIndexBefore = Math.floor(charIndex);
			var charIndexAfter = Math.ceil(charIndex);
			var charIndexRemain = charIndex - charIndexBefore;

			var charCodeBefore = data.charCodeAt(charIndexBefore);
			var charCodeAfter = data.charCodeAt(charIndexAfter);

			// Lerp into charcode
			var charCode = charCodeBefore + (charCodeAfter - charCodeBefore) * charIndexRemain;

			segments[i] = charCode;
		}

		this.walkers = new Array(segments.length);

		segments.forEach(function (charCode, index) {
			var seed = charCode % 16 / 16;
			var progress = index / segments.length;
			var angle = progress * Math.PI * 2;

			var position = new Vector2(Math.cos(angle) * scale, Math.sin(angle) * scale);

			_this.walkers.push(new Walker(seed, position));
		});

		this.context.clearRect(0, 0, width, height);
		this.animate();
	};

	TextToSymbolFactory.prototype.animate = function animate() {
		requestAnimationFrame(this.loop);

		this.clock.update();
		this.render();
	};

	TextToSymbolFactory.prototype.render = function render() {
		var _this2 = this;

		var _canvas2 = this.canvas;
		var width = _canvas2.width;
		var height = _canvas2.height;

		this.context.save();
		this.context.translate(width * .5, height * .5);

		this.walkers.forEach(function (walker) {
			walker.update(_this2.clock.delta);
			walker.render(_this2.context);
		});

		this.context.restore();
	};

	return TextToSymbolFactory;
}();

var canvasContainer = document.querySelector('.js-canvas-container');
var inputElement = document.querySelector('.js-input');

var textToSymbolFactory = new TextToSymbolFactory();
textToSymbolFactory.setSize(window.innerWidth, window.innerHeight);
textToSymbolFactory.start(inputElement.value);

canvasContainer.appendChild(textToSymbolFactory.canvas);

inputElement.addEventListener('input', function (e) {
	var data = e.target.value;

	textToSymbolFactory.start(data);
});