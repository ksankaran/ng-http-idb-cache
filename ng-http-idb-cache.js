/**
 * Author: ksankaran (Velu)
 * Date: 03/31/15
 * Time: 1:36 PM
 * Comments: A simple delegate to provide IndexedDB storage access over $http calls.
 */

angular.module('ng-http-idb-cache', ['simpleIDB']).config(['$provide', '$simpleIDBProvider', function($provide, $simpleIDBProvider) {
	// Configure the IndexedDB
	$simpleIDBProvider.config({
		name 		: 'ngcache',
		version 	: 1,
		upgrades 	: {
			1 : function(database) {
				database.createObjectStore("ngcache", { keyPath: "url" }).createIndex("expirationTime", "expirationTime", { unique: false });
			}
		}
	});
	$provide.decorator('$http', ['$delegate', '$templateCache', '$simpleIDB', '$q', function($delegate, $templateCache, $simpleIDB, $q) {
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
						$simpleIDB.put({url : url, value : {data : data.data}, expirationTime : (new Date().getTime()) + 600000});
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
				$simpleIDB.get(url, function(data) {
					// check in indexedDB and resolve/make call.
					(data && data.expirationTime > (new Date().getTime())) ? defer.resolve(data.value) : makeCall();
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