export function getPRs(bests, me) {
  const prs = []
  const timeRanges = [
    "1hr",
    "20min",
    "10min",
    "5min",
    "2min",
    "1min",
    "30sec",
    "5sec",
    "max",
  ]

  for (const time of timeRanges) {
    if (bests && bests['watts']) {
      if (bests['watts'][time] >= me.bests['watts'][time]) {
        prs.push({ type: 'watts', time: time, value: bests['watts'][time]})
      }
    }
    if (bests && bests['heartrate']) {
      if (bests['heartrate'][time] >= me.bests['heartrate'][time]) {
        prs.push({ type: 'heartrate', time: time, value: bests['heartrate'][time] })
      }
    }
  }
  return prs
}