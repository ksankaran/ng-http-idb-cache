# ng-http-idb-cache

The $http in angularJS uses templateCache to serve the files via the browser cache mechanism. How can we leverage the $http call and use indexedDB
  to get file/data across pages? This is a library to do that. For the demo purposes, simpleIDB takes care of indexedDB operations. Of course, changing it
  to flexible storage layer or a different indexedDB library is easy.
