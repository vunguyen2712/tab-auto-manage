angular.module('myApp', ['dataGrid', 'pagination', 'ngMaterial'])
    .controller('myAppController', ['$scope', 'myAppFactory', function ($scope, myAppFactory) {

        var portToBg = chrome.extension.connect({
               name: "CommunicationWithBg"
        });
        $scope.autoClosedHistory = [];
        $scope.gridOptions = { // gridOptions data must be defined at least
            data: [],
            urlSync: false
        };

        // on recieve updated data
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
              if (request.action === 'sendUpdatedDataFromBg'){
                  $scope.gridOptions.data = request.updatedData;
                  $scope.$apply(); // update ui
                  sendResponse({recieveStatus: 'Successfully recieved data from backgroundjs'});
              }
        });

        //@param: item (from the UI) is a tabInfo
        $scope.openAutoClosedLink = function (item){
            findAndRemoveOpenLink(item);
        }

        function findAndRemoveOpenLink(tabInfo){
            for(var i = 0; i < $scope.gridOptions.data.length; ++i){
                if($scope.gridOptions.data[i].tabId === tabInfo.tabId){
                    console.log('Removing ' + tabInfo.tabUrl);
                    $scope.gridOptions.data.splice(i, 1);
                    var openLinkMsg = {
                        action: 'openLink',
                        updatedTabsData: $scope.gridOptions.data
                    };
                    portToBg.postMessage(openLinkMsg); // send to bg
                }
            }
        }

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
