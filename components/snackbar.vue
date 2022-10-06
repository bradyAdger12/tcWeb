<template>
  <div name="snackbars">
    <v-snackbar v-model="show" :color="color" :timeout="timeout" :top="'top'" app>
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
    
<script>
export default {
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "snackbar/SHOW_MESSAGE") {
        this.text = state.snackbar.text;
        this.color = state.snackbar.color;
        this.timeout = state.snackbar.timeout;
        this.show = true;
      }
    });
  },
  data() {
    return {
      show: false,
      color: "",
      text: "",
      timeout: -1,
    };
  },
};
</script>