<template>
    <div id="navbar">
    
      <v-app-bar app
        dense
        dark
        tabs
        color="white"
        class="black--text"
      >
        
        <img src="../assets/logo.svg" height="90"  alt="" class="mt-12">
        <div><v-divider vertical/></div>
        
        <v-toolbar-title class="mt-12" style="color: #4B4B46;">CO2 Footprint Tracker</v-toolbar-title>
 
        <template v-slot:extension>
          <v-tabs
            color="#4B4B46"
            right
          >
            <v-tab 
              to="/global" >
              Global
            </v-tab> 
            <v-tab to="/region" >
              Region
            </v-tab>
            <v-tab to="/country" >
              Country
            </v-tab>
            <v-tab to="/location">
              Location
            </v-tab>       

            <v-tabs-slider color="#D7004B"></v-tabs-slider>
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
.theme--dark.v-tabs > .v-tabs-bar .v-tab:not(.v-tab--active)  {
  color: #4B4B46;
}
</style>
