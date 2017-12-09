/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  C: {
    fileName: "./sounds/cymbal.ogg",
    volume: 0.1,
    color: "#a00",
    lightColor: "#faa",
    imageName: "./images/cymbal.png",
    width: 70,
    height: 70
  },
  B: {
    fileName: "./sounds/bass.ogg",
    volume: 0.07,
    color: "#0a0",
    lightColor: "#afa",
    imageName: "./images/foot.png",
    width: 30,
    height: 70
  },
  HH: {
    fileName: "./sounds/hihat.ogg",
    volume: 0.08,
    color: "#00a",
    lightColor: "#aaf"
  },
  S: {
    fileName: "./sounds/snare.ogg",
    volume: 0.05,
    color: "#aa0",
    lightColor: "#ffa"
  },
  FT: {
    fileName: "./sounds/floor_tom.ogg",
    volume: 0.2,
    color: "#0aa",
    lightColor: "#aff"
  },
  T: {
    fileName: "./sounds/tom.ogg",
    volume: 0.16,
    color: "#000",
    lightColor: "#aaa"
  }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  C = Crash
  HH = Hi-Hat
  T = Small Tom
  S = Snare
  FT = Floor Tom
  B = Bass

  f = flam
  o = loose hi-hats
*/

var parse = __webpack_require__(2);
var PAD_DATA = __webpack_require__(0);
var Countdown = __webpack_require__(3);
var Renderer = __webpack_require__(4);

/*
  rendering
*/

var renderer = void 0;

/*
  setup and stuff
*/
var isPlaying = false;
var context = void 0;
var canvas = void 0;

function readContext() {
  canvas = document.querySelector("#canvas");
  context = canvas.getContext("2d");
}

function startPlaying() {
  if (!context) {
    readContext();
  }
  var tab = document.querySelector("#tabArea").innerHTML;
  var songData = parse(tab);

  renderer = new Renderer(context, songData.notes, songData.sections, canvas.width, canvas.height);

  var frequency = document.querySelector("#iptFrequency").value;
  var speed = document.querySelector("#iptSpeed").value;
  var chars = document.querySelector("#chkCharacters");

  renderer.noteEvery = parseInt(frequency, 10);
  renderer.movementSpeed = parseInt(speed, 10);
  renderer.renderCharacters = chars.checked;

  if (!isPlaying) {
    isPlaying = true;
    renderLoop();
  }
}

/*
  SCREEN & GAME STATE MANAGEMENT
*/

var SCREEN_STATES = {
  MENU: 0,
  PREVIEW: 1,
  PLAYING: 2
  // PAUSED: 3,
};

var SCREENS = {
  // to be read on load
  menu: "",
  play: ""
};

var settings = {
  state: SCREEN_STATES.MENU,
  setState: function setState(newState) {
    settings.state = newState;
    updateDivs();
  }
};

function updateDivs() {
  if (settings.state === SCREEN_STATES.MENU) {
    if (renderer) {
      renderer.paused = true;
      renderer.shouldRender = false;
    }
    SCREENS.menu.classList.remove("hide");
    SCREENS.play.classList.add("hide");
  } else if (settings.state === SCREEN_STATES.PREVIEW) {
    SCREENS.menu.classList.remove("hide");
    SCREENS.play.classList.remove("hide");
    SCREENS.play.classList.add("preview");
  } else if (settings.state === SCREEN_STATES.PLAYING) {
    SCREENS.menu.classList.add("hide");
    SCREENS.play.classList.remove("hide");
    SCREENS.play.classList.remove("preview");
  }
}

function playClick() {
  settings.setState(SCREEN_STATES.PLAYING);
  if (isPlaying) {
    renderer.paused = true;
    renderer.shouldRender = false;
  }
  if (!context) {
    readContext();
  }
  var time = parseInt(document.querySelector("#iptCountdown").value, 10);
  var countDown = new Countdown(context, canvas.width, canvas.height, time, function () {
    startPlaying();
  });
  countDown.start();
}

function previewClick() {
  settings.setState(SCREEN_STATES.PREVIEW);
  startPlaying();
  renderer.setTimerToPreview();
}

function pauseClick() {
  if (!isPlaying) {
    return;
  }
  renderer.paused = !renderer.paused;
}

function backClick() {
  settings.setState(SCREEN_STATES.MENU);
}

function renderLoop() {
  renderer.update();
  renderer.render();
  window.requestAnimationFrame(renderLoop);
}

/*
  onLoad
*/

window.onload = function () {
  SCREENS.menu = document.querySelector(".menu-screen");
  SCREENS.play = document.querySelector(".play-screen");

  document.querySelector("#btnPreview").addEventListener("click", previewClick);
  document.querySelector("#btnPlay").addEventListener("click", playClick);
  document.querySelector("#btnBack").addEventListener("click", backClick);
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BEST_ORDER = ["C", "HH", "S", "B", "T", "FT"];

function parse(str) {
  var lines = str.split("\n");
  var labeled = parseLabels(lines);
  if (!validateLines(labeled)) {
    alert("invalid song");
    return;
  }
  var infered = infer(labeled);
  var data = buildData(infered.notes);
  var orderedData = reorder(data);
  return {
    notes: orderedData,
    sections: infered.sections
  };
}

function infer(labeledLines) {
  var uniqueKeys = [];
  var sections = [];
  labeledLines.forEach(function (labeledLine, index) {
    var label = labeledLine.label;
    var type = labeledLine.type;
    if (type === "notes" && typeof label !== "undefined") {
      if (uniqueKeys.indexOf(label) === -1) {
        uniqueKeys.push(label);
      }
    } else if (type === "section") {
      var exists = sections.filter(function (section) {
        return section.name === label;
      }).length > 0;
      if (exists) {
        // insert section into current position
      } else {
        sections.push({
          name: labeledLine.label,
          startLine: index,
          startIndex: -1
        });
      }
    }
  });

  var inferedData = [];
  var currentSession = [];
  var currentNoteIndex = 0;
  for (var i = 0; i < labeledLines.length; i += 1) {
    var currentLine = labeledLines[i];
    if (currentLine.type === "notes") {
      currentSession.push(currentLine);
    }
    if (currentLine.type === "section") {
      // nothing to do here yet
    }
    if (currentLine.type === "divisor") {
      (function () {
        // verify if there are all keys in the current section
        var keysInSession = {};
        uniqueKeys.forEach(function (key) {
          return keysInSession[key] = false;
        });
        currentSession.forEach(function (sessionLine) {
          keysInSession[sessionLine.label] = true;
        });

        // build empty line to insert where there were no notes
        var allLinesSameLength = true;
        var lineLength = -1;
        var emptyLine = "";
        currentSession.forEach(function (line) {
          var length = line.line.length;
          if (lineLength === -1) {
            lineLength = length;
          }
          if (lineLength !== length) {
            allLinesSameLength = false;
          }
        });
        if (!allLinesSameLength) {
          // TODO: handle errors better
          // throw Error("nope :(")
        }
        if (currentSession[0]) {
          currentSession[0].line.split("").forEach(function (char) {
            emptyLine += char === "|" ? char : "-";
          });
        }

        // insert empty line where necessary
        Object.keys(keysInSession).forEach(function (key) {
          if (!keysInSession[key]) {
            currentSession.push({ type: "notes", label: key, line: emptyLine });
          }
        });

        inferedData = inferedData.concat(currentSession);
        currentSession = [];
      })();
    }
  }
  return {
    notes: inferedData,
    sections: sections
  };
}

function buildData(labeledLines) {
  var data = {};
  labeledLines.forEach(function (line) {
    data[line.label] = []; // builds all the unique labels
  });

  labeledLines.forEach(function (line) {
    line.line.split("").forEach(function (char) {
      if (char !== "|") {
        data[line.label].push(char);
      }
    });
  });

  return data;
}

function validateLines(lines) {
  // for now, assume that everything is okay
  return true;
}

function parseLabels(lines) {
  var labeledLines = [];
  return lines.map(function (line) {
    var split = line.split("|");
    var label = split[0].replace(":", "");
    split.shift(); // remove label
    var content = split.join("|");
    if (label === "" && content === "") {
      return {
        type: "divisor"
      };
    }
    label = label.trim();
    if (line.length > 0 && line.match(/^([A-Za-z]|[-_ ])+$/)) {
      return {
        type: "section",
        label: label
      };
    }
    if (label === "H") {
      label = "HH";
    }
    return {
      type: "notes",
      label: label,
      line: content
    };
  });
}

function reorder(noteData) {
  var keys = Object.keys(noteData);
  var reordered = [];
  BEST_ORDER.forEach(function (item) {
    var index = keys.indexOf(item);
    if (index !== -1) {
      reordered[item] = noteData[item];
    }
  });
  return reordered;
}

module.exports = parse;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Countdown(context, width, height, time, onDone, interval) {
    _classCallCheck(this, Countdown);

    this.context = context;
    this.time = time;
    this.onDone = onDone;
    this.interval = interval || 1000;
    this.width = width;
    this.height = height;
  }

  _createClass(Countdown, [{
    key: "start",
    value: function start() {
      var _this = this;

      if (this.time <= 0) {
        this.context.font = "25px Arial";
        this.onDone();
      } else {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.font = "50px Arial";
        this.context.fillStyle = "#000";
        this.context.fillText(this.time, this.width / 2, this.height / 2);
        this.time -= 1;
        setTimeout(function () {
          _this.start();
        }, this.interval);
      }
    }
  }]);

  return Countdown;
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PAD_DATA = __webpack_require__(0);

module.exports = function () {
  function Renderer(context, songData, sectionLabels, width, height) {
    var _this = this;

    _classCallCheck(this, Renderer);

    // params
    this.context = context;
    this.songData = songData;
    this.width = width;
    this.height = height;
    this.sectionLabels = sectionLabels;

    // contants
    this.timeElapsed = -1;
    this.noteEvery = Infinity; // lol
    this.movementSpeed = 0; // pixels per frame
    this.renderCharacters = true;
    this.padLocation = this.height - 80; // on the y axis
    this.paused = false;
    this.shouldRender = true;
    this.backgroundImageData;

    // note stuff
    this.currentSectionId = 0;
    this.keys = Object.keys(songData);
    this.noteCount = songData[this.keys[0]].length;
    this.laneCount = this.keys.length;
    this.leftPadding = 160;
    this.padSize = 80;
    this.colorTimers = [];
    this.notes = [];
    for (var i = 0; i < this.laneCount; i++) {
      this.notes.push([]);
      this.colorTimers.push(0);
    }

    this.calculateBoardPosition();

    // load audio and image files
    this.soundFiles = {};
    this.imageFiles = {};
    this.keys.forEach(function (key) {
      var padData = PAD_DATA[key];
      var audio = new Audio(padData.fileName);
      var image = new Image();
      audio.mediaGroup = "drumulator";
      audio.volume = padData.volume;
      _this.soundFiles[key] = audio;
      if (padData.imageName) {
        image.src = padData.imageName;
        _this.imageFiles[key] = image;
      }
    });
  }

  _createClass(Renderer, [{
    key: "setTimerToPreview",
    value: function setTimerToPreview() {
      var _this2 = this;

      var disabledNotes = 0;
      var timer = 0;
      while (disabledNotes === 0) {
        timer += 1;
        this.update(true);
        this.notes.forEach(function (lane) {
          lane.forEach(function (note) {
            if (note.content && note.active && note.position >= _this2.padLocation - _this2.movementSpeed * 2) {
              disabledNotes += 1;
            }
          });
        });
      }
      this.render();
    }
  }, {
    key: "calculateBoardPosition",
    value: function calculateBoardPosition() {
      var totalSize = this.keys.length * this.padSize;
      var spaceRemaining = this.width - totalSize;
      this.leftPadding = Math.floor(spaceRemaining / 2);
    }
  }, {
    key: "update",
    value: function update(forceUpdate) {
      var _this3 = this;

      if (this.paused) {
        if (!forceUpdate) {
          return;
        }
      }

      this.timeElapsed += 1;

      // insert new notes on the board
      if (this.timeElapsed % this.noteEvery === 0) {
        var index = Math.floor(this.timeElapsed / this.noteEvery);
        if (index < this.noteCount) {
          // update section label
          var nextSection = this.sectionLabels[this.currentSectionId + 1];
          if (nextSection) {
            if (nextSection.startLine >= index) {
              this.currentSectionId += 1;
            }
          }

          // insert notes
          this.keys.forEach(function (k, keyIndex) {
            var content = _this3.songData[k][index] === "-" ? "" : _this3.songData[k][index];
            _this3.notes[keyIndex].push({
              content: content,
              position: -1, // it's going to be added 1 before the first render
              active: true // I'll probably implement a pool later
            });
          });
        }
      }

      // update existing notes
      this.notes.forEach(function (laneInfo, laneIndex) {
        laneInfo.forEach(function (note) {
          if (note.position <= _this3.height) {
            note.position += _this3.movementSpeed;
          }
          // check if note is at the bottom (should play sound and blink)
          if (note.content && note.active && note.position >= _this3.padLocation) {
            note.active = false;
            _this3.colorTimers[laneIndex] = 3;
            var key = _this3.keys[laneIndex];
            var audio = _this3.soundFiles[key];
            audio.play();
            if (audio.ended) {
              audio.play();
            } else {
              audio.currentTime = 0;
            }
          }
        });
      });
    }
  }, {
    key: "renderBackground",
    value: function renderBackground(forceRerender) {
      var _this4 = this;

      this.context.clearRect(0, 0, this.width, this.height);
      this.context.fillStyle = "#000";

      if (this.backgroundImageData && !forceRerender) {
        this.context.putImageData(this.backgroundImageData, 0, 0);
        return;
      }

      var writeToBuffer = true;

      // left-most bar
      this.context.fillRect(this.leftPadding, 0, 5, this.height);

      // background (bars dividing lanes)
      this.context.fillStyle = "#000";
      for (var i = 0; i < this.laneCount; i++) {
        var x = this.leftPadding + i * this.padSize;
        this.context.fillRect(x, 0, 5, this.height);
      }

      // images (foot, crash, etc)
      if (window.location.protocol === "file:") {
        this.context.fillText("Can't render images on 'file:' protocol", 40, this.height - 30);
      } else {
        this.keys.forEach(function (key, laneIndex) {
          var image = _this4.imageFiles[key];
          if (image) {
            if (image.width === 0) {
              writeToBuffer = false;
              image.onload = function () {
                _this4.renderBackground(true);
              };
            }
            var _x = _this4.leftPadding + laneIndex * _this4.padSize + 7;
            var y = 0;
            while (true) {
              _this4.context.drawImage(image, _x, y);
              y += _this4.imageFiles[key].height;
              y += 20; // some padding
              if (y >= _this4.height) {
                break;
              }
            }
          }
        });
      }

      // pad
      this.context.fillRect(0, this.padLocation, this.width, 10);

      // save the background image to buffer to prevent rerendering
      if (!this.backgroundImageData && writeToBuffer) {
        this.backgroundImageData = this.context.getImageData(0, 0, this.width, this.height);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;

      if (!this.shouldRender) {
        return;
      }

      this.renderBackground();

      // hit colors
      this.colorTimers.forEach(function (timer, laneIndex) {
        var x = _this5.leftPadding + laneIndex * _this5.padSize;
        var w = _this5.padSize;
        var key = _this5.keys[laneIndex];
        var color = "#fff";
        if (timer > 0) {
          _this5.colorTimers[laneIndex] -= 1;
          color = PAD_DATA[key].color;
        }
        _this5.context.globalAlpha = 0.3;
        _this5.context.fillStyle = color;
        _this5.context.fillRect(x, 0, w, _this5.height);
        _this5.context.globalAlpha = 1;
      });

      // notes
      this.notes.forEach(function (laneInfo, laneIndex) {
        var key = _this5.keys[laneIndex];
        laneInfo.forEach(function (note) {
          if (note.position >= _this5.height) {
            return;
          }
          if (note.content) {
            // empty string evaluates as false lol
            var _x2 = _this5.leftPadding + laneIndex * _this5.padSize + 10;
            var color = PAD_DATA[key].color;
            _this5.context.fillStyle = color;
            if (_this5.renderCharacters) {
              _this5.context.fillRect(_x2, note.position - 20, _this5.padSize - 20, 20);
              _this5.context.fillStyle = "#fff";
              _this5.context.fillText(note.content, _x2 + _this5.padSize / 2 - 18, note.position - 3);
            } else {
              _this5.context.fillRect(_x2, note.position - 8, _this5.padSize - 20, 8);
            }
          }
        });
      });

      // section name
      // it's wrong, so I commented it out
      // const sectionName = this.sectionLabels[this.currentSectionId].name
      // this.context.fillStyle = "#000"
      // this.context.fillText(sectionName, 10, 20)

      // right-most bar
      var x = this.leftPadding + this.laneCount * this.padSize;
      this.context.fillStyle = "#000";
      this.context.fillRect(x, 0, 5, this.height);
    }
  }]);

  return Renderer;
}();

/***/ })
/******/ ]);