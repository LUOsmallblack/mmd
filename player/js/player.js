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

String.prototype.truncate = function (strLen, separator) {
    if (this.length <= strLen) return this;

    separator = separator || '...';

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow*2/3),
        backChars = charsToShow - frontChars;

    return this.substr(0, frontChars) + 
           separator + 
           this.substr(this.length - backChars);
};

var app = angular.module("ngAppPlayer", []);

app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter, {'event': event});
        });
        event.preventDefault();
      }
    });
  };
});

app.directive('ngSetFocus',function($timeout) {
  return {
    restrict : 'A',
    link : function(scope,element,attr) {
      scope.$watch(attr.ngSetFocus,function(val) {
        $timeout(function() {
          val ? element.focus() :
            element.blur();
        });
      });
    }
  }
});

app.controller("MusicListController", ["$scope", function MusicListController($scope) {
  $scope.current = {
    cid: 0,
    time: 0,
    duration: 0,
    buffered: [],
    volume: 1,
  };

  $scope.musiclist = [
    {title: "喜欢你", artist: "邓紫棋", album: "喜欢你", uri: "http://yinyueshiting.baidu.com/data2/music/134380992/1226741191425362461128.mp3?xcode=d9b736e197d70aa10ef86512f5b9bb0ee70c8ba5d04fc31d"},
    {title: "回忆的沙漏", artist: "邓紫棋", album: "G.E.M.", uri: "http://yinyueshiting.baidu.com/data2/music/119085606/1267392172800128.mp3?xcode=6dd3a774e8a06036e7fd8d5c8ad4c4af7ce5516a177aab91"},
    {title: "蝴蝶", artist: "刘若英", album: "我的失败与伟大", uri: "http://yinyueshiting.baidu.com/data2/music/64095815/11111291425398461128.mp3?xcode=be5aa522b9635863995b9f37e4a03dd234b2a22da6d65275"},
  ];

  $scope.utils = {
    timeToPercent: function(time) {
      return (time / ($scope.current.duration||1)).toBe01().toPercent();
    },
    bufferspStyle: function(buffer) {
      return {
        'left': $scope.utils.timeToPercent(buffer.start),
        'width': $scope.utils.timeToPercent(buffer.end-buffer.start),
      }
    },
    getVClickValue: function(event) {
      // use magic!
      return (event.target.offsetHeight - event.offsetY) / event.currentTarget.offsetHeight;
    },
    getClickValue: function(event) {
      return event.offsetX / event.currentTarget.offsetWidth;
    }
  };
  $scope.audio = new Audio();
  $scope.ctrl = {
    play: function() { $scope.audio.play(); },
    pause: function() { $scope.audio.pause(); },
    set: function(uri) { $scope.audio.src = uri; },
    setvolume: function(vol) { $scope.audio.volume = vol; },
  }

  $($scope.audio).bind({
    "loadstart": function() {
      $scope.current.uri = this.currentSrc;
      $scope.$apply();
    },
    "loadedmetadata": function() {
      $scope.current.duration = this.duration;
      $scope.$apply();
    },
    "timeupdate": function() {
      $scope.current.time = this.currentTime;
      $scope.current.duration = this.duration;
      $scope.$apply();
    },
    "play": function() {
      $scope.current.playing = true;
      $scope.$apply();
    },
    "pause": function() {
      $scope.current.playing = false;
      $scope.$apply();
    },
    "ended": function() {
      $scope.current.playing = false;
      $scope.current.cid = $scope.current.cid + 1;
      $scope.$apply();
    },
    "progress": function() {
      var buffered = [];
      for (var i = this.buffered.length - 1; i >= 0; i--) {
        buffered.push({start: this.buffered.start(i), end: this.buffered.end(i)});
      };
      $scope.current.buffered = buffered;
      $scope.$apply();
    },
    "volumechange": function() {
      $scope.current.volume = this.volume;
      $scope.$apply();
    },
  });
  $scope.$watch('current.uri', function() {
    $scope.current.showuri = $scope.current.uri;
  })
  $scope.$watch('current.time', function() {
    $scope.audio.currentTime = $scope.current.time;
  })
  $scope.$watch('current.playing', function(newval, oldval){
    if (newval == oldval) {
      return console.log("playing same");
    }
    if (newval)
      $scope.audio.play();
    else
      $scope.audio.pause();
  })
  $scope.$watch('current.volume', function() {
    $scope.audio.volume = $scope.current.volume;
  })
  $scope.$watch('current.cid', function() {
    $scope.current.cid %= $scope.musiclist.length;
    var i = $scope.current.cid;
    $scope.current.title = $scope.musiclist[i].title;
    $scope.current.artist = $scope.musiclist[i].artist;
    $scope.current.album = $scope.musiclist[i].album;
    $scope.audio.src = $scope.musiclist[i].uri;
    $scope.audio.play();
  })
  $(document).ready(function() {
    $(".progress-handle").draggable({
      cursor: 'pointer',
      opacity: 0.85,
      containment: 'parent',
      axis: 'x',
      start: function() {
        $scope.current.dragging = true;
      },
      stop: function(event, ui) {
        $scope.current.dragging = false;
        $scope.audio.currentTime = $scope.current.duration * ui.position.left / $(this).parent().width();
        $scope.$apply();
      },
    });
  });
}]);
