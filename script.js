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

/*
  data and stuff
*/

const PAD_DATA = {
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

/*
  document parsing
*/
function parse(str) {
  const lines = str.split("\n")
  const labeled = parseLabels(lines)
  if(!validateLines(labeled)) {
    alert("invalid song")
    return
  }
  const infered = infer(labeled)
  const data = buildData(infered)
  return data
}

function infer(labeledLines) {
  let uniqueKeys = []
  labeledLines.forEach(labeledLine => {
    const label = labeledLine.label
    const type = labeledLine.type
    if(type === "notes" && typeof label !== "undefined") {
      if(uniqueKeys.indexOf(label) === -1) {
        uniqueKeys.push(label)
      }
    }
  })

  let inferedData = []
  let currentSession = []
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
  return inferedData
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

/*
  rendering
*/

let renderer

class Renderer {
  constructor(context, songData, width, height) {
    // params
    this.context = context
    this.songData = songData
    this.width = width
    this.height = height

    // contants
    this.timeElapsed = -1
    this.noteEvery = 7
    this.movementSpeed = 10 // pixels per frame
    this.padLocation = this.height - 80 // on the y axis
    this.paused = false

    // note stuff
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
      console.log(key)
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

  calculateBoardPosition() {
    const totalSize = this.keys.length * this.padSize
    const spaceRemaining = this.width - totalSize
    this.leftPadding = Math.floor(spaceRemaining / 2)
  }

  update() {

    if(this.paused) {
      return
    }

    this.timeElapsed += 1

    // insert new notes on the board
    if(this.timeElapsed % this.noteEvery === 0) {
      let index = Math.floor(this.timeElapsed / this.noteEvery)
      if(index < this.noteCount) {
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

    // right-most bar
    let x = (this.leftPadding + (this.laneCount * this.padSize))
    this.context.fillStyle = "#000"
    this.context.fillRect(x, 0, 5, this.height)
  }
}

/*
  setup and stuff
*/
let isPlaying = false

function playClick() {
  const tab = document.querySelector("#tabArea").innerHTML
  const songData = parse(tab)
  console.log("returned")
  console.log(songData)

  const canvas = document.querySelector("#canvas")
  const context = canvas.getContext("2d")
  renderer = new Renderer(context, songData, canvas.width, canvas.height)

  if(!isPlaying) {
    isPlaying = true
    renderLoop()
  }
}

function pauseClick() {
  if(!isPlaying) {
    return
  }
  renderer.paused = !renderer.paused
}

function renderLoop() {
  renderer.update()
  renderer.render()
  window.requestAnimationFrame(renderLoop)
}
