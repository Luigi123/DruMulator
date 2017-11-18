
const BEST_ORDER = ["C", "HH", "S", "B", "T", "FT"]

function parse(str) {
  const lines = str.split("\n")
  const labeled = parseLabels(lines)
  if(!validateLines(labeled)) {
    alert("invalid song")
    return
  }
  const infered = infer(labeled)
  const data = buildData(infered.notes)
  const orderedData = reorder(data)
  return {
    notes: orderedData,
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

function reorder(noteData) {
  const keys = Object.keys(noteData)
  let reordered = []
  BEST_ORDER.forEach(item => {
    const index = keys.indexOf(item) !== -1
    if(index !== -1) {
      console.log(item)
      reordered[item] = noteData[item]
    }
  })
  return reordered
}

module.exports = parse
