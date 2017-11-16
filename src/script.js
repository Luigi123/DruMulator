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

const parse = require("./documentParser")
const PAD_DATA = require("./padData")
const Countdown = require("./countdown")
const Renderer = require("./renderer")

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