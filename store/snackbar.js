export const state = () => ({
  text: "",
  color: "",
  timeout: "",
})

export const mutations = {
  SHOW_MESSAGE(state, payload) {
    state.text = payload.text;
    state.color = payload.color;
    state.timeout = payload.timeout;
  },
}

export const actions = {
  showSnack({ commit }, payload) {
    commit("SHOW_MESSAGE", payload);
  },
}
