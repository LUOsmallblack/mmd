angular.module("ngAppPlayer", [])
.controller("MusicListController", ["$scope", function MusicListController($scope) {
  $scope.current = {}
  $scope.current.title = "Title";
  $scope.current.artist = "Artist";
  $scope.current.album = "Album";
  $scope.current.time = "00:00";
  $scope.current.duration = "04:11";
  $scope.current.bufferstyle = {'width':'100%'};
  $scope.current.currentstyle = {'width':'30%'};
  $scope.current.handlestyle = {'left':'30%'};

  $scope.musiclist = [
    { id: 0, title: "Love&Loyalty", author: "Juji Gu", duration: "3:45"},
    { id: 1, title: "If I were a Boy", author: "Beyonce" ,duration: "4:12"},
    { id: 2, title: "Dragon Knight", author: "Jay Chou", duration: "5:07"}
  ];
}]);
