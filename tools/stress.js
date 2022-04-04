
function average(array) {
  let sum = 0
  for (const item of array) {
    sum += item
  }
  return sum / array.length
}
function getNormalizedPower(watts) {
  const averages = []
  if (watts) {
    for (let index = 0; index + 30 < watts.length; index++) {
      const thirtySecondSlice = watts.slice(index, index + 30)
      averages.push(Math.round(Math.pow(average(thirtySecondSlice), 4)))
    }
  }
  const fourthPowerAverages = average(averages)
  return Math.round(Math.pow(fourthPowerAverages, .25))
}

export function findTSS({ me, values, duration }) {
  let tss = null
  const normalizedPower = getNormalizedPower(values)
  try {
    tss = Math.round(((duration * (normalizedPower * (normalizedPower / me.threshold_power)) / (me.threshold_power * 3600))) * 100)
    return tss
  } catch (e) {
    console.log(e)
  }
  return 0;
}


export function findHRTSS({ me, values }) {
  try {
    let hrtss = null
    const k = me.gender == 'male' ? 1.92 : 1.67
    const restinghr = me.resting_hr
    const maxhr = me.max_hr
    const thresholdhr = me.threshold_hr
    if (restinghr && maxhr && thresholdhr) {
      let sum = 0
      values.forEach((item, i) => {
        const hrr = (item - restinghr) / (maxhr - restinghr)
        sum += (hrr * 0.64 * Math.exp(k * hrr))
      })
      const lthrr = (thresholdhr - restinghr) / (maxhr - restinghr)
      const trimpthresh = (lthrr * 0.64 * Math.exp(k * lthrr)) * 3600
      hrtss = Math.round((sum / trimpthresh) * 100)
      return hrtss
    } else {
      return 0;
    }

  } catch (e) {
  }
  return 0;
}