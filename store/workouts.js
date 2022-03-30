import _ from 'lodash'
export const state = () => ({
  workouts: []
})

export const mutations = {
  //
  updateWorkout(state, { workout }) {
    const index = _.findIndex(state.workouts, (item) => { return item.id == workout.id })
    if (index != -1) {
      state.workouts[index] = workout
    }
  },

  // set workouts array
  setWorkouts(state, workouts) {
    state.workouts = workouts
  },

  // delete a workout
  deleteWorkout(state, { id }) {
    _.remove(state.workouts, (item) => {
      return item.id == id
    })
  },


}

export const actions = {
  async updateWorkout({ commit, state }, { id, token, payload }) {
    const response = await this.$axios.put('/workouts/' + id, payload, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data && response.data.success) {
      const workout = response.data
      commit('updateWorkout', { workout })
    }
  },
  async deleteWorkout({ commit, state }, { id, token }) {
    const response = await this.$axios.delete('/workouts/' + id, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data && response.data.success) {
      commit('deleteWorkout', { id })
    }
  },
  async getWorkouts({ commit, state }, { me, token }) {
    const response = await this.$axios.get('/workouts/me', { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data) {
      commit('setWorkouts', response.data)
    }
  }
}