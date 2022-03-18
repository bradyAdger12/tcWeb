export const state = () => ({
  access_token: null, // JWT access token
  me: null, //User object
})

export const mutations = {
  // store the logged in user in the state
  setUser (state, user) {
    state.me = user
  },

  // store new or updated token fields in the state
  setToken (state, { token }) {
    state.access_token = token
  },

  // clear our the state, essentially logging out the user
  logout (state) {
    state.me = null
    state.access_token = null
  },
}

export const actions = {
  async updateUser({ commit, state }, { payload }) {
    console.log(state.access_token)
    const response = await this.$axios.put('/users/update/me', payload, { headers: { 'Authorization': 'Bearer ' + state.access_token }})
    if (response.data) {
      commit('setUser', response.data)
    }
  },
  async getUser({ commit }) {
    const response = await this.$axios.get('/users/me');
    console.log(response)
},
  async login ({ commit, dispatch }, { email, password }) {
    let token = null
    let user = null
    // make an API call to login the user with an email address and password
    const response = await this.$axios.post('/users/login', 
      { email, password }
    )

    if (response && response.data) {
      token = response.data.token
      
      delete response.data.token
      console.log(response.data)
    }

    // commit the user and tokens to the state
    commit('setUser', response.data)
    commit('setToken', { token })
  },

  async register ({ commit }, { email, password }) {
    // make an API call to register the user
    const { data: { data: { user, payload } } } = await this.$axios.post(
      this.$axios.defaults.BASE_URL + '/users/register', 
      { email, password }
    )
    
    // commit the user and tokens to the state
    commit('setUser', { user })
    commit('setToken', { payload })
  },

  // logout the user
  logout ({ commit, state }) {
    commit('logout')
  },
}

export const getters = {
  // determine if the user is authenticated based on the presence of the access token
  isAuthenticated: (state) => {
    return state.access_token && state.access_token !== ''
  },
}