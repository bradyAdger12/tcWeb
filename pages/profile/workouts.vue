<template>
  <div class="my-16">
    <v-row justify="center">
      <v-col cols="12" sm="7">
        <p class="text-h4">My Workouts</p>
        <WorkoutsList />
      </v-col>
    </v-row>
  </div>
</template>


<script>
export default {
  name: "Workouts",
  head: {
    title: "Workouts",
  },
};
</script>