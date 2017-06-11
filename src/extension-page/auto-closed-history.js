angular.module('myApp', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('myAppController', ['$scope', 'myAppFactory', function ($scope, myAppFactory) {

        $scope.autoClosedHistory = [];
        $scope.gridOptions = { // gridOptions data must be defined at least
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
            chrome.runtime.sendMessage({action: 'getInitData'}, function(response) {
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
