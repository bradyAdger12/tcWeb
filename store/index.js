export const actions = {
    async nuxtServerInit({ state, commit, dispatch }) {
        const cookie = this.$cookies.get('auth');
        if (cookie?.auth) {
            console.log(cookie.auth)
            const token = cookie.auth.access_token
            const me = cookie.auth.me
            commit('auth/setToken', { token });
            commit('auth/setUser', me);
        } else {
            dispatch('auth/logout')
        }


        const { accessToken, refreshToken } = state.auth;
        if (accessToken && refreshToken) {
            try {
                await dispatch('auth/refresh');
            } catch (e) {
                commit('auth/logout');
            }
        }
    }
};