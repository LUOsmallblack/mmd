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
    rawtime: 0,
    rawduration: 0,
    rawbuffer: 0,
    bufferstyle: {'width':'100%'},
  };

  $scope.musiclist = [
    {id: 0, title: "Love&Loyalty", author: "Juji Gu", album: "", duration: "3:45"},
    {id: 1, title: "If I were a Boy", author: "Beyonce", album: "", duration: "4:12"},
    {id: 2, title: "Dragon Knight", author: "Jay Chou", album: "", duration: "5:07"},
  ];

  $scope.audio = new Audio();
  $scope.audio.src = "http://yinyueshiting.baidu.com/data2/music/124535166/2456900158400128.mp3?xcode=4ce61f5789ca300eae5e10908488460f64e8544c01ac648a";
  console.log($scope.audio);
  $scope.ctrl = {
    play: function() { $scope.audio.play(); },
    pause: function() { $scope.audio.pause(); },
  }

  $scope.audio.addEventListener("loadstart", function(){
    $scope.current.uri = this.currentSrc;
    $scope.$apply();
  })
  $scope.audio.addEventListener("timeupdate", function() {
    $scope.current.rawtime = this.currentTime;
    $scope.current.rawduration = this.duration;
    for (var i = this.buffered.length - 1; i >= 0; i--) {
      if(this.buffered.start(i) <= this.currentTime && this.buffered.end(i) >= this.currentTime) {
        $scope.current.rawbuffer = this.buffered.end(i);
        break;
      }
    };
    $scope.$apply();
  })
  $scope.audio.addEventListener("play", function() {
    $scope.current.playing = true
    $scope.$apply();
  })
  $scope.audio.addEventListener("pause", function() {
    $scope.current.playing = false
    $scope.$apply();
  })
  $scope.audio.addEventListener("ended", function() {
    $scope.current.playing = false
    $scope.$apply();
  })
  $scope.$watch('current.rawtime', function(){
    $scope.current.time = $scope.current.rawtime.toMMSS();
    var per = ($scope.current.rawtime / ($scope.current.rawduration||1)).toBe01().toPercent();
    $scope.current.currentstyle = {'width': per};
    if (!$(".progress-handle").hasClass("ui-draggable-dragging"))
      $scope.current.handlestyle = {'left': per};
  });
  $scope.$watch('current.rawbuffer', function(){
    var per = ($scope.current.rawbuffer / ($scope.current.rawduration||1)).toBe01().toPercent();
    $scope.current.bufferstyle = {'width': per};
  });
  $scope.$watch('current.rawduration', function(){
    $scope.current.duration = $scope.current.rawduration.toMMSS();
    var per = ($scope.current.rawtime / ($scope.current.rawduration||1)).toBe01().toPercent();
    $scope.current.currentstyle = {'width': per};
    if (!$(".progress-handle").hasClass("ui-draggable-dragging"))
      $scope.current.handlestyle = {'left': per};
    var per1 = ($scope.current.rawbuffer / ($scope.current.rawduration||1)).toBe01().toPercent();
    $scope.current.bufferstyle = {'width': per1};
  });
  $(document).ready(function() {
    console.log($(".progress-handle"));
    $(".progress-handle").draggable({
      cursor: 'pointer',
      opacity: 0.85,
      containment: 'parent',
      axis: 'x',
      stop: function(event, ui) {
        console.log($scope.current.rawduration * ui.position.left / $(this).parent().width());
        $scope.audio.currentTime = $scope.current.rawduration * ui.position.left / $(this).parent().width();
        $scope.$apply();
      },
    });
  });
}]);
