angular.module("ngAppPlayer", [])
.controller("MusicListController", ["$scope", function MusicListController($scope) {
    $scope.current = {}
    $scope.current.title = "Title";
    $scope.current.artist = "Artist";
    $scope.current.album = "Album";
    $scope.current.bufferstyle = {'width':'80%'};
    $scope.current.currentstyle = {'width':'30%'};
    $scope.current.handlestyle = {'left':'30%'};
  }]);
