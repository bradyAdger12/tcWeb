<template>
  <div v-if="workout">
    <WorkoutsDetail :workout="workout" />
  </div>
</template>


<script>
export default {
  name: "Workout",
  async asyncData({ store, params, $axios }) {
    const id = params.id;
    let workout = null;
    try {
      const response = await $axios.get(
        $axios.defaults.baseURL + `/workouts/${id}`,
        {
          headers: {
            Authorization: "Bearer " + store.state.auth.access_token,
          },
        }
      );
      workout = response.data;
    } catch (e) {
      console.log(e);
    }
    return {
      workout
    };
  }
};
</script>
