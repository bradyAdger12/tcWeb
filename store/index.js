export const actions = {
    async nuxtServerInit({ state, commit, dispatch }) {
        const token = this.$cookies.get('access_token')
        const me = this.$cookies.get('me')
        this.$cookies.remove('auth')
        console.log(this.$cookies.getAll())
        if (token && me) {
            if (token) {
                commit('auth/setToken', { token });
            }
            if (me) {
                commit('auth/setUser', me);
            }
        } else {
            dispatch('auth/logout')
        }


        const { accessToken, refreshToken } = state.auth;
        if (accessToken && refreshToken) {
            console.log('hi')
            try {
                await dispatch('auth/refresh');
            } catch (e) {
                commit('auth/logout');
            }
        }
    }
};