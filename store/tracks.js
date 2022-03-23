import _ from 'lodash'
export const state = () => ({
  workouts: []
})

export const mutations = {
  // set workouts array
  setTracks(state, workouts) {
    state.workouts = workouts
  },

  // delete a workout
  deleteTrack(state, { id }) {
    _.remove(state.workouts, (item) => {
      return item.id == id
    })
  },


}

export const actions = {
  async deleteTrack({ commit, state }, { id, token }) {
    const response = await this.$axios.delete('/workouts/' + id, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data && response.data.success) {
      commit('deleteTrack', { id })
    }
  },
  async getTracks({ commit, state }, { me, token }) {
    const response = await this.$axios.get('/workouts/me', { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data) {
      commit('setTracks', response.data)
    }
  }
}