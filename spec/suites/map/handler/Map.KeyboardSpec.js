describe("Map.Keyboard", function () {
	var KEYCODE_LOWERCASE_A = 65;
	var KEYCODE_ARROW_LEFT = 37;
	var KEYCODE_ARROW_UP = 38;
	var KEYCODE_ARROW_RIGHT = 39;
	var KEYCODE_ARROW_DOWN = 40;
	var KEYCODE_PLUS = 171;
	var KEYCODE_MINUS = 173;
	var KEYCODE_ESC = 27;

	var map, container;

	beforeEach(function () {
		container = createContainer();
		map = L.map(container, {
			zoomAnimation: false	// If true, the test has to wait extra 250msec
		});

		// make keyboard-caused panning instant to cut down on test running time
		map.panBy = function (offset) { return L.Map.prototype.panBy.call(this, offset, {animate: false}); };

		map.setView([0, 0], 5);

		// Keyboard functionality expects the map to be focused (clicked or cycle-tabbed)
		// However this can only happen with trusted events (non-synthetic), so
		// this bit has to be faked.
		map.keyboard._onFocus();
	});

	afterEach(function () {
		removeMapContainer(map, container);
	});

	describe("arrow keys", function () {
		it("move the map north", function () {
			happen.keydown(document,  {keyCode: KEYCODE_ARROW_UP});
			happen.keypress(document, {keyCode: KEYCODE_ARROW_UP});
			happen.keyup(document,    {keyCode: KEYCODE_ARROW_UP});

			expect(map.getCenter().lat).to.be.greaterThan(0);
		});

		it("move the map south", function () {
			happen.keydown(document,  {keyCode: KEYCODE_ARROW_DOWN});
			happen.keypress(document, {keyCode: KEYCODE_ARROW_DOWN});
			happen.keyup(document,    {keyCode: KEYCODE_ARROW_DOWN});

			expect(map.getCenter().lat).to.be.lessThan(0);
		});

		it("move the map west", function () {
			happen.keydown(document,  {keyCode: KEYCODE_ARROW_LEFT});
			happen.keypress(document, {keyCode: KEYCODE_ARROW_LEFT});
			happen.keyup(document,    {keyCode: KEYCODE_ARROW_LEFT});

			expect(map.getCenter().lng).to.be.lessThan(0);
		});

		it("move the map east", function () {
			happen.keydown(document,  {keyCode: KEYCODE_ARROW_RIGHT});
			happen.keypress(document, {keyCode: KEYCODE_ARROW_RIGHT});
			happen.keyup(document,    {keyCode: KEYCODE_ARROW_RIGHT});

			expect(map.getCenter().lng).to.be.greaterThan(0);
		});
	});

	describe("plus/minus keys", function () {
		it("zoom in", function () {
			happen.keydown(document,  {keyCode: KEYCODE_PLUS});
			happen.keypress(document, {keyCode: KEYCODE_PLUS});
			happen.keyup(document,    {keyCode: KEYCODE_PLUS});

			expect(map.getZoom()).to.be.greaterThan(5);
		});

		it("zoom out", function () {
			happen.keydown(document,  {keyCode: KEYCODE_MINUS});
			happen.keypress(document, {keyCode: KEYCODE_MINUS});
			happen.keyup(document,    {keyCode: KEYCODE_MINUS});

			expect(map.getZoom()).to.be.lessThan(5);
		});
	});

	describe("does not move the map if disabled", function () {
		it("no zoom in", function () {

			map.keyboard.disable();

			happen.keydown(document,  {keyCode: KEYCODE_PLUS});
			happen.keypress(document, {keyCode: KEYCODE_PLUS});
			happen.keyup(document,    {keyCode: KEYCODE_PLUS});

			expect(map.getZoom()).to.eql(5);
		});

		it("no move north", function () {

			map.keyboard.disable();

			happen.keydown(document,  {keyCode: KEYCODE_ARROW_UP});
			happen.keypress(document, {keyCode: KEYCODE_ARROW_UP});
			happen.keyup(document,    {keyCode: KEYCODE_ARROW_UP});

			expect(map.getCenter().lat).to.eql(0);
		});
	});


	describe("popup closing", function () {
		it("closes a popup when pressing escape", function () {

			var popup = L.popup().setLatLng([0, 0]).setContent('Null Island');
			map.openPopup(popup);

			expect(popup.isOpen()).to.be(true);

			happen.keydown(document,  {keyCode: KEYCODE_ESC});
			happen.keyup(document,    {keyCode: KEYCODE_ESC});

			expect(popup.isOpen()).to.be(false);
		});
	});

	describe("popup closing disabled", function () {
		it("close of popup when pressing escape disabled via options", function () {

			var popup = L.popup({closeOnEscapeKey: false}).setLatLng([0, 0]).setContent('Null Island');
			map.openPopup(popup);

			expect(popup.isOpen()).to.be(true);

			happen.keydown(document,  {keyCode: KEYCODE_ESC});
			happen.keyup(document,    {keyCode: KEYCODE_ESC});

			expect(popup.isOpen()).to.be(true);
		});
	});

	describe("keys events binding", function () {
		it("keypress", function (done) {
			var keyDownSpy = sinon.spy();
			var keyPressSpy = sinon.spy();
			var keyUpSpy = sinon.spy();

			map.on('keypress', keyPressSpy);
			happen.keypress(container, {keyCode: KEYCODE_LOWERCASE_A});

			setTimeout(function () {
				expect(keyDownSpy.called).to.be(false);
				expect(keyPressSpy.called).to.be.ok();
				expect(keyUpSpy.called).to.be(false);
				done();
			}, 50);
		});

		it("keydown", function (done) {
			var keyDownSpy = sinon.spy();
			var keyPressSpy = sinon.spy();
			var keyUpSpy = sinon.spy();

			map.on('keydown', keyDownSpy);
			happen.keydown(container, {keyCode: KEYCODE_LOWERCASE_A});

			setTimeout(function () {
				expect(keyDownSpy.called).to.be.ok();
				expect(keyPressSpy.called).to.be(false);
				expect(keyUpSpy.called).to.be(false);
				done();
			}, 50);
		});

		it("keyup", function (done) {
			var keyDownSpy = sinon.spy();
			var keyPressSpy = sinon.spy();
			var keyUpSpy = sinon.spy();

			map.on('keyup', keyUpSpy);
			happen.keyup(container, {keyCode: KEYCODE_LOWERCASE_A});

			setTimeout(function () {
				expect(keyDownSpy.called).to.be(false);
				expect(keyPressSpy.called).to.be(false);
				expect(keyUpSpy.called).to.be.ok();
				done();
			}, 50);
		});
	});
});
