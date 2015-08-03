# ng-http-idb-cache

The $http in angularJS uses templateCache to serve files via the browser cache mechanism. How can we leverage the $http call and use indexedDB
  to get file/data across pages? The answer is, ng-http-idb-cache library.
  
ng-http-idb-cache uses [angular-indexedDB](https://github.com/bramski/angular-indexedDB) to store values in and out of IndexedDB. If you do not want such a big library, a simplistic simple-idb.js factory is also provided to help access indexedDB.

Steps to use it


	// Load the file
	<script src="ng-http-idb-cache.js"></script>
	
	// Include the ng-http-idb-cache module as dependency
	angular.module('yourapp', ['ng-http-idb-cache']).....
	
	// Now on, all your template gets cached in indexedDB 
	// Either through $http.get
	$http.get('template.html').success(function(htmlContents) {
		$log.debug("Contents: ", htmlContents);
	});
	
	// OR through ng-include
	<div ng-include="'template.html'"></div>
	
	// Be default, it is cached for one minute. To override, just include this line before loading the script.
	window.tplExpirationTime = 5; // in minutes
