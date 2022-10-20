import _ from 'lodash'
import moment from 'moment'
export const state = () => ({
  workouts: [],
})

export const mutations = {
  removeWorkout(state, { id }) {
    const found = _.find(state.workouts, (item) => {
      return item.id === id
    })
    if (found) {
      _.remove(state.workouts, (item) => {
        return item.id == id
      })
    }
  },
  updateWorkout (state, { workout }) {
    state.updatedWorkout = null
    const index = _.findIndex(state.workouts, (item) => {
      return item.id === workout.id
    })
    if (index !== -1) {
      state.workouts[index] = workout
      state.workouts = [...state.workouts]
    }
  },
  addWorkout(state, { workout, date }) {
    const found = _.find(state.workouts, (item) => {
      return item.id === workout.id
    })
    if (!found) {
      state.workouts.push(workout)
    }
  },
  setWorkouts(state, dates) {
    state.dates = dates
  },
  addToCalendar(state, workout) {
    state.workouts.push(workout)
  },
  unshift(state, date) {
    state.dates.unshift(date)
  },
  push(state, date) {
    state.dates.push(date)
  },
  clearDates(state) {
    state.dates = []
  }
}

export const actions = {
  async moveWorkout({ commit, state }, { workout, token, newDate, oldDate }) {
    commit('moveWorkout', { workout, newDate, oldDate })
    await this.$axios.put('/workouts/' + workout.id, { started_at: newDate.toISOString() }, { headers: { 'Authorization': 'Bearer ' + token } })
  },
  async updateWorkout({ commit, dispatch }, { id, token, payload }) {
    await this.$axios.put('/workouts/' + id, payload, { headers: { 'Authorization': 'Bearer ' + token } })
  },
  async getCalendar({ commit, dispatch, state }, { token, startDate, endDate }) {
    const response = await this.$axios.get(
      this.$axios.defaults.baseURL +
      `/workouts/me/calendar?startsAt=${startDate.toISOString()}&endsAt=${endDate.toISOString()}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response && response.data) {
      for (let item of response.data) {
        commit('addToCalendar', item)
      }
    }
  }
}