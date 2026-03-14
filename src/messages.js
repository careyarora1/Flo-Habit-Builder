// Compassionate messaging system

const encouragements = [
  "Progress isn't a straight line. You're still moving forward.",
  "One tough day doesn't erase the work you've put in.",
  "The fact that you're here tracking this says a lot about you.",
  "Bad days are part of the process, not a sign you've failed.",
  "You're not starting over. You're starting from experience.",
  "This is exactly what real change looks like — messy and human.",
  "Be as kind to yourself as you'd be to a friend doing this.",
  "Your trendline is what matters, not any single day.",
]

const celebrations = [
  "Look at you go. That's real progress.",
  "You showed up for yourself today. That matters.",
  "The trend is heading exactly where you want it.",
  "Small wins compound. This is how change actually works.",
  "You're proving to yourself that you can do this.",
]

const neutrals = [
  "Right on track. Steady wins the race.",
  "Consistency over perfection — you're doing it.",
  "Another day of showing up. That's the whole game.",
]

export function getMessage(actual, goal, habit) {
  const isReduce = habit.direction === 'reduce'
  const didWell = isReduce ? actual <= goal : actual >= goal
  const wentOff = isReduce ? actual > goal * 1.5 : actual < goal * 0.5

  if (wentOff) {
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }
  if (didWell) {
    return celebrations[Math.floor(Math.random() * celebrations.length)]
  }
  return neutrals[Math.floor(Math.random() * neutrals.length)]
}

export function getCheckInMessage(difficulty) {
  if (difficulty === 'too-hard') {
    return "No shame in that. Let's dial it back a bit today."
  }
  if (difficulty === 'too-easy') {
    return "Nice — let's push a little further today."
  }
  return "Solid. Let's keep this pace going."
}
