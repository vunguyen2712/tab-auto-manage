angular.module('myApp', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('myAppController', ['$scope', 'myAppFactory', function ($scope, myAppFactory) {

        $scope.gridOptions = {
            data: [],
            urlSync: false
        };
        myAppFactory.getData().then(function (responseData) {
            $scope.gridOptions.data = responseData.data;
        });

        // function storeUserPrefs() {
        //     var testPrefs = {'val': 10};
        //         chrome.storage.sync.set({'myKey': testPrefs}, function() {
        //             console.log('Saved', 'myKey', testPrefs);
        //             getUserPrefs();
        //         });
        // }

        // update if the page is open
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                console.log(sender.tab ?
                          "from a content script:" + sender.tab.url :
                          "from the extension");
            if (request.greeting == "hello")
                sendResponse({farewell: "goodbye"});
        });

        function init(){
            // get the entire contents of storage.
            chrome.storage.sync.get(null, function (items) {
                console.log('contents of storage:');
                console.log(items);
            });
        }

        init();
        // function getUserPrefs() {
        //     chrome.storage.sync.get('myKey', function (obj) {
        //         console.log('myKey', obj);
        //     });
        // }

        // storeUserPrefs();

    }])
    .factory('myAppFactory', function ($http) {
        return {
            getData: function () {
                return $http({
                    method: 'GET',
                    url: 'https://angular-data-grid.github.io/demo/data.json'
                });
            }
        }
    });
