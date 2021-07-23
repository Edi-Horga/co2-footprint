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

  data: () => ({
    //
  }),
  components: {
    NavBar
  }
};
</script>
