import _ from 'lodash'
export const state = () => ({
  workouts: []
})

export const mutations = {
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