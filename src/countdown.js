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
