export default function auth({ store, redirect }) {
  if (!store.state.auth.access_token) {
    return redirect('/')
  }
  // if (!localStorage.getItem('jwt')) {
  //   return router.push({ name: 'login' });
  // }

  // return next();
}