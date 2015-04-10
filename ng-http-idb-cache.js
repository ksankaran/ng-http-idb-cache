/**
 * Author: ksankaran (Velu)
 * Date: 03/31/15
 * Time: 1:36 PM
 * Comments: A simple delegate to provide IndexedDB storage access over $http calls.
 */

(function(expirationTime) {
	angular.module('ng-http-idb-cache', ['indexedDB'])
		.config(['$provide', '$indexedDBProvider', function($provide, $indexedDBProvider) {
			// Configure the IndexedDB
			$indexedDBProvider
				.connection('ngcache')
				.upgradeDatabase(1, function(event, db, tx){
			        var objStore = db.createObjectStore("ngcache", { keyPath: "url" });
			        objStore.createIndex("expirationTime", "expirationTime", { unique: false });
				});
				
			$provide.decorator('$http', ['$delegate', '$templateCache', '$indexedDB', '$q', function($delegate, $templateCache, $indexedDB, $q) {
				// Take backup of existing $http get method
				var _httpGet = $delegate.get;
		
				// overwrite $delegate.get
				$delegate.get = function(url) {
					// Always return a promise
					var defer = $q.defer(), 
						tplCache = $templateCache.get(url),
						makeCall = function() {
							_httpGet(url, {cache: $templateCache}).then(function(data) {
								// store data
								$indexedDB.openStore('ngcache', function(store) {
									store.upsert({url : url, value : {data : data.data}, expirationTime : (new Date().getTime()) + (expirationTime * 60000)});
								});
								// resolve data
								defer.resolve(data);
							});
						};
					// If templateCache have something, get from tplCache. Its not worth checking indexedDB at this point.
					if(tplCache) {
						makeCall();
					}
					else {
						// check in indexedDB
						$indexedDB.openStore('ngcache', function(store) {
							store.find(url).then(function(data) {
								// check in indexedDB and resolve/make call.
								(data && data.expirationTime > (new Date().getTime())) ? defer.resolve(data.value) : makeCall();
							}, function() {
								makeCall();
							});
						});
					}
					
					var promise = defer.promise;
					// Stub methods for ones using $http.get methods
					promise.success = function(callback) {
						return promise["then"](callback);
					};
					promise.error = function(callback) {
						return promise["fail"](callback);
					};
					// return promise to caller
					return defer.promise;
				};
		
				return $delegate;
			}]);
	}]);
})(window.tplExpirationTime || 1);