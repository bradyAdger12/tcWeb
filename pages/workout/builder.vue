<template>
  <WorkoutsBuilder :date="date" :workout="workout" />
</template>


<script>
import moment from 'moment'
export default {
  async asyncData({ query, store, $axios }) {
    const id = query.id;
    let date = null
    if (query.date) {
      date = moment(query.date);
    }
    let workout = null;
    if (id) {
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
        console.log(workout)
      } catch (e) {
        console.log(e);
      }
    }
    
    return { date, workout }
  },
  name: "Builder",
  middleware: "auth",
  head: {
    title: "Calendar",
  },
};
</script>