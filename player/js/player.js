function errlog(str) {
  return function(err) {console.log(str + " : " + err)}
}

var db = new Dexie("MusicPlayer");
db.version(1).stores({musiclist:"++id,title,artist,uri,date,deleted,&order,random,*tags"});
db.open().catch(errlog("Open database failed"));
db.musiclist.hook("creating", function(PK, obj, tran) {
  obj.date = new Date().toISOString();
  obj.order = PK;
  obj.random = Math.random();
  obj.tags = obj.tags || []
})

// db.musiclist.orderBy("order").limit(1).toArray(function(){});

var MusicList = function(m) {}

MusicList.prototype.toArray = function(mode, func) {
  if (mode == "random" || mode == "order") {
    return db.musiclist.orderBy(mode).toArray(func).catch(errlog("toArray failed"));
  }
  return db.musiclist.toArray(func).catch(errlog("toArray failed"));
}

MusicList.prototype.push = function(entry) {
  // title, artist, uri, date, deleted(optional), order, random
  // TODO: music-artist, lyc-artist, and lyc-content, origin-url
  // TODO: tag
  db.musiclist.add(entry);
}

musiclist = new MusicList();

if (typeof(Storage) == "undefined") {
  console.log("WARNING: can't storage!")
  localStorage = {
    getItem: function(){},
    setItem: function(){}
  }
}

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

  return this.substr(0, frontChars) + separator + this.substr(this.length - backChars);
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

  // retrive volumn in local storage
  if (localStorage["music_volume"] != null) {
    $scope.current.volume = localStorage["music_volume"]*1;
  }

  function setMusiclist(ml) {
    $scope.currentlist = ml || $scope.currentlist || [];
  }

  // retrive music list in local storage
  $scope.musiclist = musiclist;
  $scope.currentlist = [];
  musiclist.toArray("order", setMusiclist);

  $scope.listctrl = {
    add: function(tmp) {
      var x = {};
      if (tmp) {
        x.title = tmp.title;
        x.artist = tmp.artist;
        x.uri = tmp.uri;
      } else {
        x.title = $("#tmp-title").val();
        x.artist = $("#tmp-artist").val();
        x.uri = $("#tmp-uri").val();
        $("#songInfoModal").modal('hide');
      }
      $scope.musiclist.push(x);
    },
  }
  playLast = function() {
    $scope.current.cid = -1;
    $scope.$apply();
  }

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
  $scope.$watch('current.playing', function(newval, oldval) {
    if (newval)
      $scope.audio.play();
    else
      $scope.audio.pause();
  })
  $scope.$watch('current.volume', function() {
    $scope.audio.volume = $scope.current.volume;
    localStorage["music_volume"] = $scope.current.volume;
  })
  $scope.$watch('current.cid', function() {
    var i = $scope.current.cid, len = $scope.currentlist.length;
    if (len == 0) {
      $scope.current.title = "Empty";
      $scope.current.artist = "";
      $scope.audio.src = "";
      $scope.audio.pause();
      return;
    }
    i = (i % len + len) % len;
    $scope.current.cid = i;
    $scope.current.title = $scope.currentlist[i].title;
    $scope.current.artist = $scope.currentlist[i].artist;
    $scope.audio.src = $scope.currentlist[i].uri;
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
