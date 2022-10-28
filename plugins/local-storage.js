// import createPersistedState from 'vuex-persistedstate';

// export default ({ isDev, store, app }) => {
//   createPersistedState({
//     key: 'auth',
//     paths: [
//       'auth.access_token',
//       'auth.me'
//     ],
//     storage: {
//       getItem: key => app.$cookies.get(key),
//       setItem: (key, value) => app.$cookies.set(key, value, {
//         path: '/',
//         expires: new Date(Date.now() + 14 * 864e5),
//         secure: !isDev
//       }),
//       removeItem: key => app.$cookies.remove(key)
//     },
//     assertStorage() {
//       return !!app.$cookies;
//     }
//   })(store);
// };