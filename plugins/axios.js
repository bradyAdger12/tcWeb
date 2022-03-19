import { mapActions } from 'vuex'
export default function ({ $axios, redirect, store }) {

  //Handle authenticating requests
  $axios.onRequest((config) => {
    if (store.state.auth.accessToken) {
      config.headers.Authorization = 'Bearer ' + store.state.auth.accessToken;
    }

    return config;
  });

  //Error handling
  $axios.onError(error => {
    if (!error.response.config.noShowSnackbar) {
      store.dispatch("snackbar/showSnack", {
        text: error.response?.data.message,
        color: "red",
        timeout: 3500,
      })
    }
  })
}