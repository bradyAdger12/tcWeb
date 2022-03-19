import _ from 'lodash'
export const state = () => ({
  tracks: []
})

export const mutations = {
  // set tracks array
  setTracks(state, tracks) {
    state.tracks = tracks
  },

  // delete a track
  deleteTrack(state, { id }) {
    _.remove(state.tracks, (item) => {
      return item.id == id
    })
  },


}

export const actions = {
  async deleteTrack({ commit, state }, { id, token }) {
    const response = await this.$axios.delete('/recordings/' + id, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data && response.data.success) {
      commit('deleteTrack', { id })
    }
  },
  async getTracks({ commit, state }, { me, token }) {
    const response = await this.$axios.get('/recordings/me', { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data) {
      commit('setTracks', response.data)
    }
  }
}