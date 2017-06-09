angular.module('myApp', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('myAppController', ['$scope', 'myAppFactory', function ($scope, myAppFactory) {

        $scope.autoClosedHistory = [];
        $scope.gridOptions = {
            data: [],
            urlSync: false
        };

        $scope.gridActions = {};

        // on recieve updated data
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
              if (request.action === 'sendUpdatedDataFromBg'){
                  $scope.gridOptions.data = request.updatedData;
                  $scope.$apply(); // update ui
                  sendResponse({recieveStatus: 'Successfully recieved data from backgroundjs'});
              }
        });

        function init(){
            // get the entire contents of storage.
            chrome.storage.sync.get(null, function (items) {
                console.log('contents of storage:');
                console.log(items);
            });

            chrome.runtime.sendMessage({action: 'getInitData'}, function(response) {
                console.log(response.data);
                $scope.gridOptions.data = response.data;
                $scope.$apply(); // update ui
            });
        }

        init();

    }])
    .factory('myAppFactory', function ($http) {
        return {

        }
    });
