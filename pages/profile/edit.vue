<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12" sm="8" class="text-center">
      <div class="mb-12">
        <p class="black--text text-h2">Update Account</p>
      </div>
      <v-text-field
        v-model="displayName"
        label="Display Name*"
        placeholder="Enter Display Name"
      />
      <v-text-field
        v-model.number="maxHr"
        label="Max Heart Rate"
        type="number"
        placeholder="Enter Max Heart Rate"
      />
      <v-text-field
        v-model.number="restingHr"
        label="Resting Heart Rate"
        type="number"
        placeholder="Enter Resting Heart Rate"
      />
      <v-text-field
        v-model.number="thresholdHr"
        label="Threshold Heart Rate"
        type="number"
        placeholder="Enter Threshold Heart Rate"
      />
      <v-text-field
        v-model="thresholdPace"
        label="Threshold Running Pace"
        type="text"
        placeholder="Enter Threshold Pace (pace for 10k. Ex. 8:30)"
      />
      <v-text-field
        v-model.number="ftp"
        label="Functional Threshold Power"
        type="number"
        placeholder="Enter Functional Threshold Power"
      />
      <v-select v-model="gender" :items="genderChoices" label="Gender" />
      <div class="text-left mt-5">
        <v-btn @click="updateMe">
          Update
          <v-progress-circular
            v-if="saving"
            indeterminate
            size="15"
            width="2"
            class="ml-2"
          />
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import axios from "axios";
export default {
  name: "EditMePage",
  head: {
    title: "Edit Me",
  },
  data() {
    return {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      gender: "none",
      genderChoices: ["none", "male", "female"],
      restingHr: null,
      thresholdHr: null,
      thresholdPace: null,
      maxHr: null,
      ftp: null,
      seePassword: false,
      saving: false,
      rules: {
        min: (v) => v.length >= 4 || "Min 4 characters",
      },
    };
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  mounted() {
    this.displayName = this.me.display_name;
    this.maxHr = this.me.max_hr;
    this.restingHr = this.me.resting_hr;
    this.ftp = this.me.threshold_power;
    this.thresholdHr = this.me.threshold_hr;
    this.thresholdPace = new Date(this.me.running_threshold_pace * 1000).toISOString().substring(14, 19)
    this.gender = this.me.gender;
  },
  methods: {
    isValid() {
      return this.displayName;
    },
    async updateMe() {
      let totalSeconds = null;
      if (this.thresholdPace && this.thresholdPace.includes(":")) {
        const actualTime = this.thresholdPace.split(":");
        if (actualTime.length !== 2) {
          return this.$store.dispatch("snackbar/showSnack", {
            text: "Invalid pace format!",
            color: "red",
            timeout: 3500,
          });
        }
        totalSeconds = parseInt(actualTime[0]) * 60 + parseInt(actualTime[1]);
      }
      if (this.isValid()) {
        this.saving = true;
        const payload = {
          display_name: this.displayName,
          gender: this.gender == "None" ? null : this.gender.toLowerCase(),
          resting_hr: this.restingHr ?? null,
          threshold_hr: this.thresholdHr ?? null,
          running_threshold_pace: totalSeconds,
          max_hr: this.maxHr ?? null,
          threshold_power: this.ftp ?? null,
        };
        try {
          await this.$store.dispatch("auth/updateUser", { payload });
          this.$store.dispatch("snackbar/showSnack", {
            text: "Account updated!",
            color: "green",
            timeout: 3500,
          });
        } catch (e) {}

        this.$router.push("/profile");
        this.saving = false;
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
