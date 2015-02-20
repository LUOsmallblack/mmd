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
.directive('ngEnter', function() {
  return function($scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        $scope.$apply(function(){
          $scope.$eval(attrs.ngEnter, {'event': event});
        });

        event.preventDefault();
      }
    });
  };
})
.controller("MusicListController", ["$scope", function MusicListController($scope) {
  $scope.current = {
    title: "Title",
    artist: "Artist",
    album: "Album",
    rawtime: 0,
    rawduration: 0,
    rawbuffer: [],
    bufferstyle: {'width':'100%'},
  };

  $scope.musiclist = [
    {id: 0, title: "Love&Loyalty", author: "Juji Gu", album: "", duration: "3:45"},
    {id: 1, title: "If I were a Boy", author: "Beyonce", album: "", duration: "4:12"},
    {id: 2, title: "Dragon Knight", author: "Jay Chou", album: "", duration: "5:07"},
  ];

  var timeToPercent = function(time) {
    return (time / ($scope.current.rawduration||1)).toBe01().toPercent();
  }
  $scope.buffersp_style = function(buffer) {
    return {
      'left': timeToPercent(buffer.start),
      'width': timeToPercent(buffer.end-buffer.start),
    };
  };
  $scope.audio = new Audio();
  $scope.audio.src = "http://yinyueshiting.baidu.com/data2/music/124535166/2456900158400128.mp3?xcode=4ce61f5789ca300eae5e10908488460f64e8544c01ac648a";
  console.log($scope.audio);
  $scope.ctrl = {
    play: function() { $scope.audio.play(); },
    pause: function() { $scope.audio.pause(); },
    set: function() {
      $scope.audio.src = $scope.current.showuri;
      $(".musicinfo-uri>input").blur();
    },
  }

  $($scope.audio).bind({
    "loadstart": function() {
      $scope.current.uri = this.currentSrc;
      $scope.$apply();
    },
    "loadedmetadata": function() {
      $scope.current.rawduration = this.duration;
      $scope.$apply();
    },
    "timeupdate": function() {
      $scope.current.rawtime = this.currentTime;
      $scope.current.rawduration = this.duration;
      $scope.$apply();
    },
    "play": function() {
      $scope.current.playing = true;
      $scope.$apply();
    },
    "pause ended": function() {
      $scope.current.playing = false
      $scope.$apply();
    },
    "progress": function() {
      var buffered = [];
      for (var i = this.seekable.length - 1; i >= 0; i--) {
        buffered.push({start: this.buffered.start(i), end: this.buffered.end(i)});
      };
      $scope.current.rawbuffer = buffered;
      $scope.$apply();
    }
  });
  $scope.$watch('current.rawtime', function(){
    $scope.current.time = $scope.current.rawtime.toMMSS();
    var per = timeToPercent($scope.current.rawtime);
    $scope.current.currentstyle = {'width': per};
    if (!$(".progress-handle").hasClass("ui-draggable-dragging"))
      $scope.current.handlestyle = {'left': per};
  });
  $scope.$watch('current.rawbuffer', function(){
    var per = timeToPercent(($scope.current.rawbuffer[0]||{end:0}).end);
    $scope.current.bufferstyle = {'width': per};
  });
  $scope.$watch('current.rawduration', function(){
    $scope.current.duration = $scope.current.rawduration.toMMSS();
    var per = timeToPercent($scope.current.rawtime);
    $scope.current.currentstyle = {'width': per};
    if (!$(".progress-handle").hasClass("ui-draggable-dragging"))
      $scope.current.handlestyle = {'left': per};
    var per1 = timeToPercent(($scope.current.rawbuffer[0]||{end:0}).end);
    $scope.current.bufferstyle = {'width': per1};
  });
  $scope.$watch('current.uri', function(){
    $scope.current.showuri = $scope.current.uri;
  })
  $(document).ready(function() {
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
