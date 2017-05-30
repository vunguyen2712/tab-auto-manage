angular.module('myApp', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('myAppController', ['$scope', 'myAppFactory', function ($scope, myAppFactory) {

        $scope.autoClosedHistory = [];
        $scope.gridOptions = {
            data: [
              {
                tabId: 'tabId test',
                tabUrl: 'tab url',
                tabTitle: 'tab Title',
                tabFavIconUrl: 'tab favicon',
                tabIndex: 'tab index'
              }
            ],
            urlSync: false
        };

        $scope.gridActions = {};

        chrome.storage.sync.clear(function (callback){
            console.log('Clearing old sync data');
        });
        // myAppFactory.getData().then(function (responseData) {
        //     $scope.gridOptions.data = responseData.data;
        // });

        // function storeUserPrefs() {
        //     var testPrefs = {'val': 10};
        //         chrome.storage.sync.set({'myKey': testPrefs}, function() {
        //             console.log('Saved', 'myKey', testPrefs);
        //             getUserPrefs();
        //         });
        // }

        // update if the page is open
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                // sender is tab object and has all tab info
                console.log(sender.tab ?
                          "from a content script:" + sender.tab.url :
                          "from the extension");
                var tabInfo = {
                    tabId: sender.tab.id,
                    tabUrl: sender.tab.url,
                    tabTitle: sender.tab.title,
                    tabFavIconUrl: sender.tab.favIconUrl,
                    tabIndex: sender.tab.index
                };

                // avoid storing empty url and new tab pages in the history
                if (tabInfo.tabUrl && tabInfo.tabUrl.indexOf('chrome://') !== 0){
                    $scope.gridOptions.data.push(tabInfo);
                }
                console.log('$scope.gridOptions.data: ');
                console.log($scope.gridOptions.data);
                $scope.$apply();

                console.log('The message sent is:');
                console.log(request);
                if (request.action == "store"){
                    sendResponse({farewell: "goodbye"});
                }
                return true; // indicate sending a response asynchronously
        });

        // $scope.$watch('$scope.gridOptions.data', function(){
        //     console.log('grid option data changed!');
        //     $scope.gridActions.refresh();
        // });

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
