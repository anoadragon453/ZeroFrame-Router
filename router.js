var Router = {
	routes: [],
	currentRoute: '',
	root: '/',
	config: function(options) {
		this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
		return this;
	},
	getURL: function() { // get's current query string/hash & clears slashes from beginning and end, Note: only for initial load
		var url = '';
		url = window.location.search.replace(/&wrapper_nonce=([A-Za-z0-9]+)/, "").replace(/\?\//, '');
		return this.clearSlashes(url);
	},
	clearSlashes: function(path) {
		return path.toString().replace(/\/$/, '').replace(/^\//, '');
	},
	add: function(path, controller) {
		if (typeof path == 'function') {
			controller = path;
			path = '';
		}
		this.routes.push({ path: path, controller: controller });
		return this;
	},
	remove: function(param) {
		for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
			if (r.controller === param || r.path.toString() === param.toString()) {
				this.routes.splice(i, 1);
				return this;
			}
		}
		return this;
	},
	flush: function() {
		this.routes = [];
		this.root = '/';
		return this;
	},
	check: function(hash) {
		var reg, keys, match, routeParams;
		for (var i = 0, max = this.routes.length; i < max; i++ ) {
			routeParams = {}
			keys = this.routes[i].path.match(/:([^\/]+)/g);
			match = hash.match(new RegExp(this.routes[i].path.replace(/:([^\/]+)/g, "([^\/]*)").replace(/\*/g, '(?:.*)') + '(?:\/|$)'));
			if (match) {
				match.shift();
				match.forEach(function (value, i) {
					routeParams[keys[i].replace(":", "")] = value;
				});
				this.routes[i].controller.call({}, routeParams);
				return this;
			}
		}
		return this;
	},
	listenForBack: function(cmd, message) { // Note: Call in the OnRequest function in ZeroFrame class.
		if (!cmd) console.log("[Router] Please pass in cmd and message into Router.listenForBack function");
		if (cmd == "wrapperPopState") {
			if (message.params.state) {
				if (!message.params.state.url) {
					message.params.state.url = message.params.href.replace(/.*\?/, "");
				}
				window.scroll(window.pageXOffset, message.params.state.scrollTop || 0)
				this.navigate(message.params.state.url.replace(/^\//, ''));
			}
		}
	},
	navigate: function(path) {
		path = path ? path : '';
		page.cmd('wrapperPushState', [{"route": path}, null, this.root + this.clearSlashes(path)]);
		this.check(path);
		return this;
	}
}

// Note: Call right after creating all of your routes.
Router.init = function() {
	Router.check(Router.getURL());
}