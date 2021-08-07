<template>
  <v-app>
    <v-main>
      <NavBar />
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar'

export default {
  name: 'App',
  watch: {
      $route: {
          immediate: true,
          handler(to ) {
              document.title = to.meta.title || 'CO2 Footprint Tracker';
          }
      },
  },

  data: () => ({
    //
  }),
  components: {
    NavBar
  }
};
</script>
