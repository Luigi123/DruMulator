const PAD_DATA = require("./padData")

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
    this.renderCharacters = true
    this.padLocation = this.height - 80 // on the y axis
    this.paused = false
    this.shouldRender = true
    this.backgroundImageData

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
        if(note.position <= this.height) {
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

  renderBackground(forceRerender) {
    this.context.clearRect(0, 0, this.width, this.height)
    this.context.fillStyle = "#000"

    if(this.backgroundImageData && !forceRerender) {
      this.context.putImageData(this.backgroundImageData, 0, 0)
      return
    }

    let writeToBuffer = true

    // left-most bar
    this.context.fillRect(this.leftPadding, 0, 5, this.height)

    // background (bars dividing lanes)
    this.context.fillStyle = "#000"
    for(let i = 0; i < this.laneCount; i++) {
      let x = this.leftPadding + (i * this.padSize)
      this.context.fillRect(x, 0, 5, this.height)
    }

    // images (foot, crash, etc)
    if(window.location.protocol === "file:") {
      this.context.fillText("Can't render images on 'file:' protocol", 40, this.height - 30)
    }
    else {
      this.keys.forEach((key, laneIndex) => {
        const image = this.imageFiles[key]
        if(image) {
          if(image.width === 0) {
            writeToBuffer = false
            image.onload = () => { this.renderBackground(true) }
          }
          const x = (this.leftPadding + (laneIndex * this.padSize)) + 7
          let y = 0
          while(true) {
            this.context.drawImage(image, x, y)
            y += this.imageFiles[key].height
            y += 20 // some padding
            if(y >= this.height) {
              break
            }
          }
        }
      })
    }

    // pad
    this.context.fillRect(0, this.padLocation, this.width, 10)

    // save the background image to buffer to prevent rerendering
    if(!this.backgroundImageData && writeToBuffer) {
      this.backgroundImageData = this.context.getImageData(0, 0, this.width, this.height)
    }
  }

  render() {
    if(!this.shouldRender) {
      return
    }

    this.renderBackground()

    // hit colors
    this.colorTimers.forEach((timer, laneIndex) => {
      const x = this.leftPadding + (laneIndex * this.padSize)
      const w = this.padSize
      const key = this.keys[laneIndex]
      let color = "#fff"
      if(timer > 0) {
        this.colorTimers[laneIndex] -= 1
        color = PAD_DATA[key].color
      }
      this.context.globalAlpha = 0.3
      this.context.fillStyle = color
      this.context.fillRect(x, 0, w, this.height)
      this.context.globalAlpha = 1
    })

    // notes
    this.notes.forEach((laneInfo, laneIndex) => {
      const key = this.keys[laneIndex]
      laneInfo.forEach(note => {
        if(note.position >= this.height) {
          return
        }
        if(note.content) { // empty string evaluates as false lol
          let x = (this.leftPadding + (laneIndex * this.padSize)) + 10
          const color = PAD_DATA[key].color
          this.context.fillStyle = color
          if(this.renderCharacters) {
            this.context.fillRect(x, note.position - 20, this.padSize - 20, 20)
            this.context.fillStyle = "#fff"
            this.context.fillText(note.content, (x + (this.padSize / 2) - 18), note.position - 3)
          }
          else {
            this.context.fillRect(x, note.position - 8, this.padSize - 20, 8)
          }
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
