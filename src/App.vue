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
  created() {

    document.addEventListener('keyup', event => {
      if (event.key === 'Enter') { 
        this.loadData()
      }
    })
  },

  data: () => ({
    
  }),
  components: {
    NavBar
  }
};
</script>

<style>

.v-application .overflow-y-auto {
  
    height: 500px;
}

html {
  overflow: hidden;
}

</style>
