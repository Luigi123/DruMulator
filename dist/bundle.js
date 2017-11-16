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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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

const parse = __webpack_require__(1)
const PAD_DATA = __webpack_require__(2)
const Countdown = __webpack_require__(3)
const Renderer = __webpack_require__(4)

/*
  rendering
*/

let renderer

/*
  setup and stuff
*/
let isPlaying = false
let context
let canvas

function readContext() {
  canvas = document.querySelector("#canvas")
  context = canvas.getContext("2d")
}

function startPlaying() {
  if(!context) {
    readContext()
  }
  const tab = document.querySelector("#tabArea").innerHTML
  const songData = parse(tab)

  renderer = new Renderer(context, songData.notes, songData.sections, canvas.width, canvas.height)

  const frequency = document.querySelector("#iptFrequency").value
  const speed = document.querySelector("#iptSpeed").value

  renderer.noteEvery = parseInt(frequency, 10)
  renderer.movementSpeed = parseInt(speed, 10)

  if(!isPlaying) {
    isPlaying = true
    renderLoop()
  }
}

/*
  SCREEN & GAME STATE MANAGEMENT
*/

const SCREEN_STATES = {
  MENU: 0,
  PREVIEW: 1,
  PLAYING: 2,
  // PAUSED: 3,
}

const SCREENS = {
  // to be read on load
  menu: "",
  play: ""
}

let settings = {
  state: SCREEN_STATES.MENU,
  setState: (newState) => {
    settings.state = newState
    updateDivs()
  }
}

function updateDivs() {
  if(settings.state === SCREEN_STATES.MENU) {
    if(renderer) {
      renderer.paused = true
      renderer.shouldRender = false
    }
    SCREENS.menu.classList.remove("hide")
    SCREENS.play.classList.add("hide")
  }
  else if(settings.state === SCREEN_STATES.PREVIEW) {
    SCREENS.menu.classList.remove("hide")
    SCREENS.play.classList.remove("hide")
    SCREENS.play.classList.add("preview")
  }
  else if(settings.state === SCREEN_STATES.PLAYING) {
    SCREENS.menu.classList.add("hide")
    SCREENS.play.classList.remove("hide")
    SCREENS.play.classList.remove("preview")
  }
}

function playClick() {
  settings.setState(SCREEN_STATES.PLAYING)
  if(isPlaying) {
    renderer.paused = true
    renderer.shouldRender = false
  }
  if(!context) {
    readContext()
  }
  const time = parseInt(document.querySelector("#iptCountdown").value, 10)
  const countDown = new Countdown(context, canvas.width, canvas.height, time, () => { startPlaying() })
  countDown.start()
}

function previewClick() {
  settings.setState(SCREEN_STATES.PREVIEW)
  startPlaying()
  renderer.setTimerToPreview()
}

function pauseClick() {
  if(!isPlaying) {
    return
  }
  renderer.paused = !renderer.paused
}

function backClick() {
  settings.setState(SCREEN_STATES.MENU)
}

function renderLoop() {
  renderer.update()
  renderer.render()
  window.requestAnimationFrame(renderLoop)
}

/*
  onLoad
*/

window.onload = () => {
  SCREENS.menu = document.querySelector(".menu-screen")
  SCREENS.play = document.querySelector(".play-screen")

  document.querySelector("#btnPreview").addEventListener("click", previewClick)
  document.querySelector("#btnPlay").addEventListener("click", playClick)
  document.querySelector("#btnBack").addEventListener("click", backClick)
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {


function parse(str) {
  const lines = str.split("\n")
  const labeled = parseLabels(lines)
  if(!validateLines(labeled)) {
    alert("invalid song")
    return
  }
  const infered = infer(labeled)
  const data = buildData(infered.notes)
  return {
    notes: data,
    sections: infered.sections
  }
}

function infer(labeledLines) {
  let uniqueKeys = []
  let sections = []
  labeledLines.forEach((labeledLine, index) => {
    const label = labeledLine.label
    const type = labeledLine.type
    if(type === "notes" && typeof label !== "undefined") {
      if(uniqueKeys.indexOf(label) === -1) {
        uniqueKeys.push(label)
      }
    }
    else if(type === "section") {
      const exists = sections.filter(section => section.name === label).length > 0
      if(exists) {
        // insert section into current position
      }
      else {
        sections.push({
          name: labeledLine.label,
          startLine: index,
          startIndex: -1,
        })
      }
    }
  })

  let inferedData = []
  let currentSession = []
  let currentNoteIndex = 0
  for(let i = 0; i < labeledLines.length; i += 1) {
    const currentLine = labeledLines[i]
    if(currentLine.type === "notes") {
      currentSession.push(currentLine)
    }
    if(currentLine.type === "section") {
      // nothing to do here yet
    }
    if(currentLine.type === "divisor") {
      // verify if there are all keys in the current section
      let keysInSession = {}
      uniqueKeys.forEach(key => keysInSession[key] = false)
      currentSession.forEach(sessionLine => {
        keysInSession[sessionLine.label] = true
      })

      // build empty line to insert where there were no notes
      let allLinesSameLength = true
      let lineLength = -1
      let emptyLine = ""
      currentSession.forEach(line => {
        const length = line.line.length
        if(lineLength === -1) {
          lineLength = length
        }
        if(lineLength !== length) {
          allLinesSameLength = false
        }
      })
      if(!allLinesSameLength) {
        // TODO: handle errors better
        // throw Error("nope :(")
      }
      if(currentSession[0]) {
        currentSession[0].line.split("").forEach(char => {
          emptyLine += char === "|" ? char : "-"
        })
      }

      // insert empty line where necessary
      Object.keys(keysInSession).forEach(key => {
        if(!keysInSession[key]) {
          currentSession.push({ type: "notes", label: key, line: emptyLine })
        }
      })

      inferedData = inferedData.concat(currentSession)
      currentSession = []
    }
  }
  return {
    notes: inferedData,
    sections,
  }
}

function buildData(labeledLines) {
  let data = {}
  labeledLines.forEach(line => {
    data[line.label] = [] // builds all the unique labels
  })

  labeledLines.forEach(line => {
    line.line.split("").forEach(char => {
      if(char !== "|") {
        data[line.label].push(char)
      }
    })
  })

  return data
}

function validateLines(lines) {
  // for now, assume that everything is okay
  return true
}

function parseLabels(lines) {
  let labeledLines = []
  return lines.map(line => {
    const split = line.split("|")
    let label = split[0].replace(":", "")
    split.shift() // remove label
    const content = split.join("|")
    if(label === "" && content === "") {
      return {
        type: "divisor",
      }
    }
    label = label.trim()
    if(line.length > 0 && line.match(/^([A-Za-z]|[-_ ])+$/)) {
      return {
        type: "section",
        label
      }
    }
    if(label === "H") { label = "HH" }
    return {
      type: "notes",
      label,
      line: content,
    }
  })
}

module.exports = parse


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
  C: {
    fileName: "./mp3/cymbal.mp3",
    volume: 0.02,
    color: "#a00",
    lightColor: "#faa",
    // imageName: "./images/cymbal.png"
  },
  B: {
    fileName: "./mp3/bass.mp3",
    volume: 0.2,
    color: "#0a0",
    lightColor: "#afa",
    // imageName: "./images/foot.png"
  },
  HH: {
    fileName: "./mp3/hihat.mp3",
    volume: 0.06,
    color: "#00a",
    lightColor: "#aaf",
  },
  S: {
    fileName: "./mp3/snare.mp3",
    volume: 0.05,
    color: "#aa0",
    lightColor: "#ffa",
  },
  FT: {
    fileName: "./mp3/snare.mp3",
    volume: 0.05,
    color: "#0aa",
    lightColor: "#aff",
  },
  T: {
    fileName: "./mp3/snare.mp3",
    volume: 0.05,
    color: "#000",
    lightColor: "#aaa",
  },
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = class Countdown {
  constructor(context, width, height, time, onDone, interval) {
    this.context = context
    this.time = time
    this.onDone = onDone
    this.interval = interval || 1000
    this.width = width
    this.height = height
  }

  start() {
    if(this.time <= 0) {
      this.onDone()
    }
    else {
      this.context.clearRect(0, 0, this.width, this.height)
      this.context.font = "50px Arial"
      this.context.fillStyle = "#000"
      this.context.fillText(this.time, this.width / 2, this.height / 2)
      this.time -= 1
      setTimeout(() => { this.start() }, this.interval)
    }
  }
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const PAD_DATA = __webpack_require__(2)

module.exports = class Renderer {
  constructor(context, songData, sectionLabels, width, height) {
    // params
    this.context = context
    this.songData = songData
    this.width = width
    this.height = height
    this.sectionLabels = sectionLabels

    // contants
    this.timeElapsed = -1
    this.noteEvery = Infinity // lol
    this.movementSpeed = 0 // pixels per frame
    this.padLocation = this.height - 80 // on the y axis
    this.paused = false
    this.shouldRender = true

    // note stuff
    this.currentSectionId = 0
    this.keys = Object.keys(songData)
    this.noteCount = songData[this.keys[0]].length
    this.laneCount = this.keys.length
    this.leftPadding = 160
    this.padSize = 80
    this.colorTimers = []
    this.notes = []
    for(let i = 0; i < this.laneCount; i++) {
      this.notes.push([])
      this.colorTimers.push(0)
    }

    this.calculateBoardPosition()

    // load audio and image files
    this.soundFiles = {}
    this.imageFiles = {}
    this.keys.forEach(key => {
      const padData = PAD_DATA[key]
      let audio = new Audio(padData.fileName)
      let image = new Image()
      audio.mediaGroup = "drumulator"
      audio.volume = padData.volume
      this.soundFiles[key] = audio
      if(padData.imageName) {
        image.src = padData.imageName
        this.imageFiles[key] = image
      }
    })
  }

  setTimerToPreview() {
    let disabledNotes = 0
    let timer = 0
    while(disabledNotes === 0) {
      timer += 1
      this.update(true)
      this.notes.forEach(lane => {
        lane.forEach(note => {
          if(note.content && note.active && note.position >= (this.padLocation - (this.movementSpeed * 2))) {
            disabledNotes += 1
          }
        })
      })
    }
    this.render()
  }

  calculateBoardPosition() {
    const totalSize = this.keys.length * this.padSize
    const spaceRemaining = this.width - totalSize
    this.leftPadding = Math.floor(spaceRemaining / 2)
  }

  update(forceUpdate) {

    if(this.paused) {
      if(!forceUpdate) {
        return
      }
    }

    this.timeElapsed += 1

    // insert new notes on the board
    if(this.timeElapsed % this.noteEvery === 0) {
      let index = Math.floor(this.timeElapsed / this.noteEvery)
      if(index < this.noteCount) {
        // update section label
        const nextSection = this.sectionLabels[this.currentSectionId + 1]
        if(nextSection) {
          if(nextSection.startLine >= index) {
            this.currentSectionId += 1
          }
        }

        // insert notes
        this.keys.forEach((k, keyIndex) => {
          const content = this.songData[k][index] === "-" ? "" : this.songData[k][index]
          this.notes[keyIndex].push({
            content,
            position: -1, // it's going to be added 1 before the first render
            active: true, // I'll probably implement a pool later
          })
        })
      }
    }

    // update existing notes
    this.notes.forEach((laneInfo, laneIndex) => {
      laneInfo.forEach(note => {
        if(note.position < this.height) {
          note.position += this.movementSpeed
        }
        // check if note is at the bottom (should play sound and blink)
        if(note.content && note.active && note.position >= this.padLocation) {
          note.active = false
          this.colorTimers[laneIndex] = 3
          const key = this.keys[laneIndex]
          const audio = this.soundFiles[key]
          audio.play()
          if(audio.ended) {
            audio.play()
          }
          else {
            audio.currentTime = 0
          }
        }
      })
    })
  }

  render() {
    if(!this.shouldRender) {
      return
    }
    this.context.clearRect(0, 0, this.width, this.height)
    this.context.fillStyle = "#000"

    // left-most bar
    this.context.fillRect(this.leftPadding, 0, 5, this.height)

    // hit colors
    this.colorTimers.forEach((timer, laneIndex) => {
      const x = this.leftPadding + (laneIndex * this.padSize)
      const w = this.padSize
      const key = this.keys[laneIndex]
      let color = "#fff"
      if(timer > 0) {
        this.colorTimers[laneIndex] -= 1
        color = PAD_DATA[key].lightColor
      }
      this.context.fillStyle = color
      this.context.fillRect(x, 0, w, this.height)
    })

    // background (bars dividing lanes)
    this.context.fillStyle = "#000"
    for(let i = 0; i < this.laneCount; i++) {
      let x = this.leftPadding + (i * this.padSize)
      this.context.fillRect(x, 0, 5, this.height)
    }

    // pad
    this.context.fillRect(0, this.padLocation, this.width, 10)
    this.keys.forEach((key, laneIndex) => {
      const image = this.imageFiles[key]
      if(image) {
        const y = this.padLocation - (image.height / 2)
        const x = (this.leftPadding + (laneIndex * this.padSize)) + 10
        this.context.drawImage(image, x, y)
      }
    })

    // notes
    this.notes.forEach((laneInfo, laneIndex) => {
      const key = this.keys[laneIndex]
      laneInfo.forEach(note => {
        if(note.content) { // empty string evaluates as false lol
          let x = (this.leftPadding + (laneIndex * this.padSize)) + 10
          const color = PAD_DATA[key].color
          this.context.fillStyle = color
          this.context.fillRect(x, note.position, this.padSize - 20, 5)
        }
      })
    })

    // section name
    // it's wrong, so I commented it out
    // const sectionName = this.sectionLabels[this.currentSectionId].name
    // this.context.fillStyle = "#000"
    // this.context.fillText(sectionName, 10, 20)

    // right-most bar
    let x = (this.leftPadding + (this.laneCount * this.padSize))
    this.context.fillStyle = "#000"
    this.context.fillRect(x, 0, 5, this.height)
  }
}


/***/ })
/******/ ]);