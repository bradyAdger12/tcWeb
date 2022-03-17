export default {
  namespaced: true,
  state: {
    text: "",
    color: "",
    timeout: "",
  },
  mutations: {
    SHOW_MESSAGE(state, payload) {
      state.text = payload.text;
      state.color = payload.color;
      state.timeout = payload.timeout;
    },
  },
  actions: {
    showSnack({ commit }, payload) {
      commit("SHOW_MESSAGE", payload);
    },
  },
};