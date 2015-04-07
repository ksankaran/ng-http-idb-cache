/*
 * Simple module to store data in IndexedDB. Not a big enhanced library but simple enough 
 * abstract the functionalities.
 */
angular.module('simpleIDB', []).provider('$simpleIDB', function() {
	var idbSupported = ("indexedDB" in window), name, version, upgrades, _self = this;
	this.config = function(obj) {
		this.name 		= obj.name;
		this.version	= obj.version;
		this.upgrades	= obj.upgrades;
		return this;
	};

	// Provider methods go inside.
	this.$get = ['$q', function($q) {
		var dbConnectionStatus 	= $q.defer(),
			dbConnectionPromise	= dbConnectionStatus.promise,
			connection = idbSupported ? window.indexedDB.open(_self.name, _self.version) : null,
			database,
			getTransaction = function() {
				return database.transaction([_self.name], "readwrite");
			},
			getStore		= function() {
				return getTransaction().objectStore(_self.name);
			};

		// Initiate connection based on configs.
		connection ? (function (){
			connection.onerror = function() {
				dbConnectionStatus.reject();
			};
			connection.onsuccess = function() {
				database = event.target.result;
				dbConnectionStatus.resolve();
			};
			// Create database as needed
			connection.onupgradeneeded = function(event) {
				database 	= event.target.result;
				currVersion	= event.oldVersion;

				angular.forEach(_self.upgrades, function(callback, ver) {
					if(currVersion < ver) {
						callback(database);
					}
				});
  			}
		})() : dbConnectionStatus.reject();

		return {
			get : function(key, callback) {
				dbConnectionPromise.then(function() {
					var request = getStore().get(key);
					request.onsuccess = function(event) {
						callback(request.result);
					};
					request.onerror	= function() {
						callback(null);
					};
				});
			},

			put : function(data) {
				dbConnectionPromise.then(function() {
					getStore().put(data);
				});
			}
		};
	}];
});