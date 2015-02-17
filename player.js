Number.prototype.toMMSS = function() {
  var str = "", time = this;
  if (time < 0) {
    time = -time;
    str = "-";
  }
  var x = Math.floor(time / 60);
  var y = Math.floor(time % 60);

  if (x < 10) { x = '0' + x; }
  if (y < 10) { y = '0' + y; }
  return str + x + ':' + y;
}

Number.prototype.toBe01 = function() {
  return this>1 ? 1 : this<0 ? 0 : this;
}

Number.prototype.toPercent = function() {
  return (this*100).toFixed(2) + '%';
}

angular.module("ngAppPlayer", [])
.controller("MusicListController", ["$scope", function MusicListController($scope) {
  $scope.current = {
    title: "Title",
    artist: "Artist",
    album: "Album",
    rawtime: 63.4,
    rawduration: 251,
    bufferstyle: {'width':'100%'},
  };

  $scope.$watch('current.rawtime', function(){
    $scope.current.time = $scope.current.rawtime.toMMSS();
    var per = ($scope.current.rawtime / $scope.current.rawduration).toBe01().toPercent();
    $scope.current.currentstyle = {'width': per};
    $scope.current.handlestyle = {'left': per};
  });
  $scope.$watch('current.rawduration', function(){
    if ($scope.current.rawduration == 0) {
      $scope.current.rawduration = -1;
    }
    $scope.current.duration = $scope.current.rawduration.toMMSS();
    var per = ($scope.current.rawtime / $scope.current.rawduration).toBe01().toPercent();
    $scope.current.currentstyle = {'width': per};
    $scope.current.handlestyle = {'left': per};
  });

  $scope.musiclist = [
    {id: 0, title: "Love&Loyalty", author: "Juji Gu", album: "", duration: "3:45"},
    {id: 1, title: "If I were a Boy", author: "Beyonce", album: "", duration: "4:12"},
    {id: 2, title: "Dragon Knight", author: "Jay Chou", album: "", duration: "5:07"},
  ];
}]);
