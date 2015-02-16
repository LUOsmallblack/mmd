angular.module("ngAppPlayer", [])
.controller("MusicListController", ["$scope", function MusicListController($scope) {
    $scope.current = {}
    $scope.current.title = "tit";
    $scope.current.artist = "art";
    $scope.current.album = "alb";
  }]);
