<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12" sm="8" class="text-center">
      <div class="mb-12">
        <p class="black--text text-h2">Register an Account</p>
        <p class="mt-7">
          Begin your fitness journey by creating an account with us.
        </p>
      </div>
      <v-text-field
        v-model="email"
        label="Email*"
        placeholder="Enter Email"
        color="white"
      />
      <v-text-field
        v-model="displayName"
        label="Display Name*"
        placeholder="Enter Display Name"
        color="white"
      />
      <v-text-field
        v-model="password"
        label="Password*"
        placeholder="Enter Password"
        color="white"
        :rules="[rules.min]"
        :type="seePassword ? 'text' : 'password'"
        :append-outer-icon="
          seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
        "
        @click:append-outer="seePassword = !seePassword"
      />
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password*"
        placeholder="Enter Confirm Password"
        color="white"
        :rules="[rules.min]"
        :type="seePassword ? 'text' : 'password'"
        :append-outer-icon="
          seePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
        "
        @click:append-outer="seePassword = !seePassword"
      />
      <div class="mt-10 mb-2 text-h4 text-left">User Training Data</div>
      <div class="subtitle text-left mb-10">
        You don't need to enter this information at the moment, but in order to
        get the most out of your training we'll need these numbers
      </div>
      <v-text-field
        v-model="maxHr"
        label="Max Heart Rate"
        type="number"
        placeholder="Enter Max Heart Rate"
        color="white"
      />
      <v-text-field
        v-model="restingHr"
        label="Resting Heart Rate"
        type="number"
        placeholder="Enter Resting Heart Rate"
        color="white"
      />
      <v-text-field
        v-model="thresholdHr"
        label="Threshold Heart Rate"
        type="number"
        placeholder="Enter Threshold Heart Rate"
        color="white"
      />
      <v-text-field
        v-model="ftp"
        label="Functional Threshold Power"
        type="number"
        placeholder="Enter Functional Threshold Power"
        color="white"
      />
      <v-select
        v-model="gender"
        :items="genderChoices"
        label="Gender"
        color="white"
      />
      <div class="text-left mt-5">
        <v-btn @click="register">
          Register
          <v-progress-circular
            v-if="saving"
            indeterminate
            size="15"
            width="2"
            class="ml-2"
          />
        </v-btn>
      </div>
      <p class="text-left mt-10">
        Already have an account? login
        <NuxtLink to="/login" class="black--text">here</NuxtLink>
      </p>
    </v-col>
  </v-row>
</template>

<script>
import axios from "axios";
export default {
  head: {
    title: "Register",
  },
  data() {
    return {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      gender: "None",
      genderChoices: ["None", "Male", "Female"],
      restingHr: null,
      thresholdHr: null,
      maxHr: null,
      ftp: null,
      seePassword: false,
      saving: false,
      rules: {
        min: (v) => v.length >= 4 || "Min 4 characters",
      },
    };
  },
  name: "RegisterPage",
  methods: {
    isValid() {
      return (
        this.email &&
        this.password &&
        this.password == this.confirmPassword &&
        this.password.length > 5 &&
        this.displayName
      );
    },
    async register() {
      if (this.isValid()) {
        this.saving = true;
        try {
          await this.$axios.post(
            this.$axios.defaults.baseURL + "/users/register",
            {
              display_name: this.displayName,
              email: this.email,
              password: this.password,
              gender: this.gender == "None" ? null : this.gender.toLowerCase(),
              resting_hr: this.restingHr,
              threshold_hr: this.thresholdHr,
              max_hr: this.maxHr,
              threshold_power: this.ftp,
            }
          );
        } catch (e) {}
        this.$store.dispatch("snackbar/showSnack", {
          text: "Account registration successful!",
          color: "green",
          timeout: 3500,
        });
        const email = this.email
        const password = this.password
        await this.$store.dispatch("auth/login", { email, password });
        this.$router.push("/profile");
        this.saving = false;
      } else if (this.password != this.confirmPassword) {
        this.$store.dispatch("snackbar/showSnack", {
          text: "Passwords must match.",
          color: "red",
          timeout: 3500,
        });
      } else {
        this.$store.dispatch("snackbar/showSnack", {
          text: "Please enter in all required fields",
          color: "red",
          timeout: 3500,
        });
      }
    },
  },
};
</script>
