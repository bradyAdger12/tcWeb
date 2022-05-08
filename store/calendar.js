import _ from 'lodash'
import moment from 'moment'
export const state = () => ({
  dates: [],
  dateOfWorkoutUpdate: null
})

export const mutations = {
  deleteWorkout(state, { workout, date }) {
    const found = _.find(state.dates, (item) => {
      if (item.date) {
        return item.date.format('D MMMM YYYY') == date.format('D MMMM YYYY')
      }
    })
    if (found) {
      _.remove(found.workouts, (item) => {
        return item.id == workout.id
      })
      state.dateOfWorkoutUpdate = date
    }
  },
  addWorkout(state, { workout, date }) {
    const found = _.find(state.dates, (item) => {
      if (item.date) {
        return item.date.format('D MMMM YYYY') == date.format('D MMMM YYYY')
      }
    })
    if (found) {
      found.workouts.push(workout)
      state.dateOfWorkoutUpdate = date
    }
  },
  setWorkouts(state, dates) {
    state.dates = dates
  },
  moveWorkout(state, { workout, newDate, oldDate }) {
    const foundNewDate = _.find(state.dates, (item) => {
      if (item.date) {
        return item.date.format('D MMMM YYYY') == newDate.format('D MMMM YYYY')
      }
    })
    const foundOldDate = _.find(state.dates, (item) => {
      if (item.date) {
        return item.date.format('D MMMM YYYY') == oldDate.format('D MMMM YYYY')
      }
    })
    if (foundOldDate) {
      _.remove(foundOldDate.workouts, (item) => {
        return item.id == workout.id
      })
    }
    if (foundNewDate) {
      workout.started_at = newDate.toString()
      foundNewDate.workouts.push(workout)
    }
  },
  updateWorkout(state, { workout }) {
    const found = _.find(state.dates, (item) => {
      if (item.date) {
        return item.date.format('D MMMM YYYY') == moment(workout.started_at).format('D MMMM YYYY')
      }
    })
    if (found) {
      const index = _.findIndex(found.workouts, (item) => {
        return item.id == workout.id
      })
      if (index != -1) {
        Object.assign(found.workouts[index], workout)
        state.dateOfWorkoutUpdate = moment(workout.started_at)
      }
    }
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
    const response = await this.$axios.put('/workouts/' + id, payload, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response && response.data) {
      const workout = response.data
      commit('updateWorkout', { workout })
    }
  },
  async getCalendar({ commit, dispatch, state }, { token, startDate, endDate, isPrepend }) {
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
      const datesToAdd = [];

      // Add incoming dates to temporary list
      for (let item of response.data) {
        if (item.date) {
          item.date = moment(item.date.toString());
        }
        datesToAdd.push(item);
      }

      // If the dates are before initial month, prepend, if not, push to end
      if (isPrepend) {
        for (let date of datesToAdd.reverse()) {
          commit('unshift', date)
        }
      } else {
        for (let date of datesToAdd) {
          commit('push', date)
        }
      }
    }
  }
}