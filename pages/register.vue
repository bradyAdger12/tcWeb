<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12" sm="4" class="text-center">
      <div class="mb-12">
        <p class="white--text text-h2">Register an Accont</p>
        <p class="mt-7">
          Begin your fitness journey by creating an account with us.
        </p>
      </div>
      <v-text-field
        v-model="email"
        label="Email"
        placeholder="Placeholder"
        color="white"
      />
      <v-text-field
        v-model="password"
        label="Password"
        placeholder="Placeholder"
        color="white"
        :rules="[rules.min]"
        :type="seePassword ? 'text' : 'password'"
        :append-outer-icon="
          seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
        "
        @click:append-outer="seePassword = !seePassword"
      />
      <div class="text-left mt-5">
        <v-btn @click="login"> Login </v-btn>
      </div>
      <p class="text-left mt-10">
        Already have an account? login
        <NuxtLink to="/login" class="white--text">here</NuxtLink>
      </p>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";
export default {
  head: {
    title: "Register",
  },
  data() {
    return {
      email: "",
      password: "",
      seePassword: false,
      rules: {
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
    };
  },
  name: "RegisterPage",
  methods: {
    ...mapActions("snackbar", ["showSnack"]),
    login() {
      console.log("hi");
      this.showSnack({
        text: "Successfully Saved!",
        color: "green",
        timeout: 3500,
      });
    },
  },
};
</script>
