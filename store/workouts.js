import _ from 'lodash'
import moment from 'moment'
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
  async updateWorkout({ commit, dispatch }, { id, token, payload }) {
    const response = await this.$axios.put('/workouts/' + id, payload, { headers: { 'Authorization': 'Bearer ' + token } })
    await dispatch("calendar/updateWorkout", {
      id,
      token,
      payload,
    }, { root: true });
    if (response.data && response.data.success) {
      const workout = response.data
      commit('updateWorkout', { workout })

    }
  },
  async deleteWorkout({ commit, state }, { id, token, workout }) {
    
    const response = await this.$axios.delete(`/workouts/${id}`, { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data && response.data.success) {
      commit('deleteWorkout', { id })
      if (workout) {
        commit('calendar/removeWorkout', {
          id
        }, { root: true })
      }
    }
  },
  async getWorkoutById({ commit, state }, { id, token }) {
      const response = await this.$axios.get(
        this.$axios.defaults.baseURL + `/workouts/${id}`,
        {
          headers: {
            Authorization: "Bearer " + token
          },
        }
      );
      this.workout = response.data; 
      return this.workout
  },
  async getWorkouts({ commit, state }, { me, token }) {
    const response = await this.$axios.get('/workouts/me', { headers: { 'Authorization': 'Bearer ' + token } })
    if (response.data) {
      commit('setWorkouts', response.data)
    }
  }
}