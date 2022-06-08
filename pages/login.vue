<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12" sm="5" class="text-center">
      <div class="mb-12">
        <p class="white--text text-h2">Login</p>
      </div>
      <v-text-field
        v-model="email"
        label="Email"
        placeholder="Enter email"
        color="white"
      />
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="Enter password"
        color="white"
        :rules="[rules.min]"
        :type="seePassword ? 'text' : 'password'"
        :append-outer-icon="
          seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
        "
        @click:append-outer="seePassword = !seePassword"
        @keyup.enter="login"
      />
      <div class="text-left mt-5">
        <v-btn @click="login">
          Login
          <v-progress-circular
            v-if="waiting"
            indeterminate
            size="15"
            width="2"
            class="ml-2"
          />
        </v-btn>
      </div>
      <p class="text-left mt-10">
        Dont have an account? register
        <NuxtLink to="/register" class="white--text">here</NuxtLink>
      </p>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions } from "vuex";
export default {
  head: {
    title: "Login",
  },
  data() {
    return {
      email: "",
      password: "",
      seePassword: false,
      waiting: false,
      rules: {
        min: (v) => v.length >= 4 || "Min 4 characters",
      },
    };
  },
  name: "LoginPage",
  methods: {
    ...mapActions("snackbar", ["showSnack"]),
    async login() {
      this.waiting = true
      try {
        const email = this.email;
        const password = this.password;
        await this.$store.dispatch("auth/login", { email, password });
        this.showSnack({
          text: "Login success!",
          color: "green",
          timeout: 3500,
        });
        this.$router.push("/profile");
      } catch (e) {}
      this.waiting = false
    },
  },
};
</script>
