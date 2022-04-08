import moment from 'moment'
export function zwoFile(blocks, thresholdValue, me, workout) {
  let workoutName = ''
  let author = ''
  let workoutDescription = ''
  workoutName = workout?.name ?? ''
  workoutDescription = workout?.description ?? ''
  author = me?.display_name ?? ''

  return `<workout_file>
    <author>${author}</author>
    <name>${workoutName}</name>
    <description>${workoutDescription}</description>
    <sportType>bike</sportType>
    <tags/>
    ${formatZWOWorkout(blocks, thresholdValue)}
  </workout_file>
`
}

function formatZWOWorkout(blocks, thresholdValue) {
  const entries = []
  for (const block of blocks) {
    if (block.numSets == 1) {
      entries.push(`<SteadyState Duration="${moment.duration(block.sets[0].duration).asSeconds()}" Power="${((block.sets[0].value / thresholdValue)).toFixed(4)}" pace="0" />`)
    } else {
      let onDuration = moment.duration(block.sets[0].duration).asSeconds()
      let offDuration = moment.duration(block.sets[1].duration).asSeconds()
      let onPower = block.sets[0].value / thresholdValue
      let offPower = block.sets[1].value / thresholdValue
      entries.push(`<IntervalsT Repeat="${block.numSets}" OnDuration="${onDuration}" OffDuration="${offDuration}" OnPower="${onPower.toFixed(4)}" OffPower="${offPower.toFixed(4)}" pace="0" show_avg="1" />`)
    }
  }
  const format = `<workout>
  ${entries.join('\n')}
  </workout>`
  return format
}