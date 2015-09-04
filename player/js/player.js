function errlog(str) {
  return function(err) {console.log(str + " : " + err)}
}

var db = new Dexie("MusicPlayer");
// TODO: music-artist, lyc-artist, and lyc-content, origin-url
db.version(1).stores({musiclist:"++id,title,artist,uri,date,deleted,random,*tags"});
db.open().catch(errlog("Open database failed"));
db.musiclist.hook("creating", function(PK, obj, tran) {
  obj.date = new Date().toISOString();
  obj.random = Math.random();
  obj.tags = obj.tags || [];
});

db.musiclist.hook("creating", function() { UpdateMusicList(); });
db.musiclist.hook("updating", function() { UpdateMusicList(); });
db.musiclist.hook("deleting", function() { UpdateMusicList(); });

var MusicList = function() {}

MusicList.prototype.toArray = function(mode, func) {
  if (mode == "random") {
    return db.musiclist.orderBy(mode).toArray(func).catch(errlog("toArray failed"));
  }
  return db.musiclist.toArray(func).catch(errlog("toArray failed"));
}

MusicList.prototype.push = function(entry) {
  db.musiclist.add(entry).catch(errlog("add entry failed"));
  this.toArray()
}

MusicList.prototype.delete = function(cid) {
  console.log("deleting", cid);
  db.musiclist.delete(cid).catch(errlog("delete entry failed"));
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
    cii: null,
    cid: null,
    time: 0,
    duration: 0,
    buffered: [],
    volume: 1,
    mode: "order"
  };
  scope = $scope;

  // retrive volumn in local storage
  if (localStorage["music_volume"] != null) {
    $scope.current.volume = localStorage["music_volume"]*1;
  }

  UpdateMusicList = function() {
    musiclist.toArray($scope.mode, function(ml) {
      $scope.currentlist = ml || $scope.currentlist || [];
      if ($scope.current.cid == null && $scope.currentlist.length) {
        $scope.current.cid = $scope.currentlist[0].id;
      }
      $scope.$apply();
    });
  }

  // retrive music list in local storage
  $scope.musiclist = musiclist;
  $scope.currentlist = [];
  UpdateMusicList();

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
    checkcid: function() {
      var len = $scope.currentlist.length;
      if ($scope.current.cid == null || len == 0) {
        $scope.current.cii = null;
        $scope.current.cid = null;
        return i;
      }
      var i = $scope.current.cii, d = $scope.current.cid;
      if (i != null) {
        i=(i % len + len) % len;
        if ($scope.currentlist[i].id == d) {
          $scope.current.cii = i;
          return i;
        }
      }
      for (i = $scope.currentlist.length - 1; i >= 0; i--) {
        if ($scope.currentlist[i].id == d) {
          $scope.current.cii = i;
          return i;
        }
      }
      $scope.current.cii = null;
      $scope.current.cid = null;
      return null;
    },
    nextcid: function() {
      var i = $scope.ctrl.checkcid();
      if (i != null) {
        i = (i+1) % $scope.currentlist.length;
        $scope.current.cii = i;
        $scope.current.cid = $scope.currentlist[i].id;
      }
    },
    prevcid: function() {
      var i = $scope.ctrl.checkcid();
      if (i != null) {
        i = (i + $scope.currentlist.length - 1) % $scope.currentlist.length;
        $scope.current.cii = i;
        $scope.current.cid = $scope.currentlist[i].id;
      }
    },
    deletecid: function(cid) {
      if (cid == $scope.current.cid) {
        $scope.ctrl.nextcid();
      }
      $scope.musiclist.delete(cid);
      UpdateMusicList()
    }
  };

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
      $scope.ctrl.nextcid();
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
  });
  $scope.$watch('current.time', function() {
    $scope.audio.currentTime = $scope.current.time;
  });
  $scope.$watch('current.playing', function(newval, oldval) {
    if (newval)
      $scope.audio.play();
    else
      $scope.audio.pause();
  });
  $scope.$watch('current.volume', function() {
    $scope.audio.volume = $scope.current.volume;
    localStorage["music_volume"] = $scope.current.volume;
  });
  $scope.$watch('current.cid', function() {
    var i = $scope.ctrl.checkcid();
    if (i == null) {
      $scope.current.title = "Empty";
      $scope.current.artist = "";
      $scope.audio.src = "";
      $scope.audio.pause();
      return;
    }
    $scope.current.title = $scope.currentlist[i].title;
    $scope.current.artist = $scope.currentlist[i].artist;
    $scope.audio.src = $scope.currentlist[i].uri;
    $scope.audio.play();
  });
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
