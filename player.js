angular.module("ngAppPlayer", [])
.controller("MusicListController", ["$scope", function MusicListController($scope) {
    $scope.current = {}
    $scope.current.title = "Title";
    $scope.current.artist = "Artist";
    $scope.current.album = "Album";
    $scope.current.bufferstyle = {'width':'80%'};
    $scope.current.currentstyle = {'width':'30%'};
    $scope.current.handlestyle = {'left':'30%'};

    $scope.musiclist = [
    	{ id: 0, name: "Love&Loyalty", author: "Juji Gu", duration: "3:45"},
    	{ id: 1, name: "If I were a Boy", author: "Beyonce" ,duration: "4:12"},
    	{ id: 2, name: "Dragon Knight", author: "Jay Chou", duration: "5:07"}
    ];
  }]);
