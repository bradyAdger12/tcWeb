<template>
  <div v-if="updatedWorkout">
    <v-text-field v-model="updatedWorkout.name" label="Name" />
    <v-textarea
      v-model="updatedWorkout.description"
      label="Description"
      filled
      rounded
      class="rounded-lg"
    />
    <WorkoutsActivityDropdown :currentActivity="updatedWorkout.activity" @onActivityChange="(e) => updatedWorkout.activity = e" />
    <v-card-actions>
      <v-btn @click="save">
        Save
        <v-progress-circular
          v-if="saving"
          size="15"
          width="2"
          indeterminate
          class="ml-1"
        />
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
export default {
  props: {
    workout: {
      type: Object,
      required: true,
    },
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
  },
  data() {
    return {
      updatedWorkout: null,
      saving: false,
      activities: ['run', 'ride']
    };
  },
  mounted() {
    this.updatedWorkout = JSON.parse(JSON.stringify(this.workout));
  },
  methods: {
    async save() {
      this.saving = true;
      try {
        const id = this.updatedWorkout.id;
        const token = this.authenticated;
        const payload = {
          name: this.updatedWorkout.name,
          description: this.updatedWorkout.description,
          activity: this.updatedWorkout.activity
        };
        await this.$store.dispatch("workouts/updateWorkout", {
          id,
          token,
          payload,
        });

        this.$store.dispatch("snackbar/showSnack", {
          text: "Successfully updated workout!",
          color: "green",
          timeout: 3500,
        });
        this.$emit("onUpdate", this.updatedWorkout);
      } catch (e) {
        console.log(e);
      }
      this.saving = false;
    },
  },
};
</script>