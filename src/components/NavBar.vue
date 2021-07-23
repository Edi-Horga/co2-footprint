<template>
    <div id="navbar">
    
      <v-app-bar app
        dense
        dark
        tabs
        color="white"
        class="black--text"
      >
        
        <v-toolbar-title>CO2 Footprint Tracker</v-toolbar-title>
 
        <template v-slot:extension>
          <v-tabs
            color="#4B4B46"
            align-with-title
          >
            <v-tab to="/" >
              Home
            </v-tab>       
            <v-tab to="/location" >
              Location
            </v-tab>
            <v-tabs-slider color="#F2E500"></v-tabs-slider>
          </v-tabs>
        </template>
      </v-app-bar>
    
  </div>    
</template>

<script>

export default {
    name: 'NavBar',
}
</script>

<style scoped>
.v-toolbar .v-toolbar__extension {
  border-bottom: 2px solid #f2e500 !important;
}
.theme--dark.v-tabs > .v-tabs-bar .v-tab:not(.v-tab--active) {
  color: #4B4B46;
}
</style>
