'use strict';

require('babel-polyfill');

var setUpAndTearDown = require('./set-up-and-tear-down');
var fetchHandler = require('./fetch-handler');
var inspecting = require('./inspecting');

var FetchMock = Object.assign({}, fetchHandler, setUpAndTearDown, inspecting);

FetchMock.config = {
	fallbackToNetwork: false,
	includeContentLength: true,
	sendAsJson: true,
	warnOnFallback: true,
	overwriteRoutes: undefined
};

FetchMock.createInstance = function () {
	var instance = Object.create(FetchMock);
	instance.routes = (this.routes || []).slice();
	instance.fallbackResponse = this.fallbackResponse || undefined;
	instance.config = Object.assign({}, this.config || FetchMock.config);
	instance._calls = {};
	instance._allCalls = [];
	instance._holdingPromises = [];
	instance.bindMethods();
	return instance;
};

FetchMock.bindMethods = function () {
	this.fetchHandler = FetchMock.fetchHandler.bind(this);
	this.restore = FetchMock.restore.bind(this);
	this.reset = FetchMock.reset.bind(this);
};

FetchMock.sandbox = function () {
	// this construct allows us to create a fetch-mock instance which is also
	// a callable function, while circumventing circularity when defining the
	// object that this function should be bound to
	var proxy = function proxy(url, options) {
		return sandbox.fetchHandler(url, options);
	};

	var sandbox = Object.assign(proxy, // Ensures that the entire returned object is a callable function
	FetchMock, // prototype methods
	this.createInstance() // instance data
	);

	sandbox.bindMethods();
	sandbox.isSandbox = true;
	return sandbox;
};

module.exports = FetchMock;