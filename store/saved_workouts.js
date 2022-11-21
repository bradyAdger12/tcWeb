import _ from 'lodash'
import moment from 'moment'
export const state = () => ({
  saved_workouts: []
})

export const mutations = {

  deleteSavedWorkout (state, id) {
    _.remove(state.saved_workouts, (item) => item.id === id)
    state.saved_workouts = [...state.saved_workouts]
  },

  // set saved_workouts array
  setSavedWorkouts(state, workouts) {
    state.saved_workouts = workouts
  },

  addSavedWorkouts(state, savedWorkout) {
    state.saved_workouts = [savedWorkout, ...state.saved_workouts]
  }

}

export const actions = {
  async deleteSavedWorkout({ commit, state }, { token, id }) {
    const response = await this.$axios.delete(`/saved_workouts/${id}`, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response && response.data) {
      commit('deleteSavedWorkout', id)
    }
  },
  async createSavedWorkout({ commit, state }, { token, savedWorkout }) {
    const response = await this.$axios.post('/saved_workouts/create', savedWorkout, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response && response.data) {
      commit('addSavedWorkouts', response.data)
    }
  },
  async getSavedWorkouts({ commit, state }, { token }) {
    const response = await this.$axios.get('/saved_workouts/me', { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data) {
      commit('setSavedWorkouts', response.data)
    }
  }
}