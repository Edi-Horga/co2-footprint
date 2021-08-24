import Vue from 'vue'
import VueRouter from 'vue-router'
import Region from '../views/Region.vue'
import LocationDetail from '../views/LocationDetail.vue'
import Global from '../views/Global.vue'
import Country from '../views/Country.vue'
import Location from '../views/Location.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/global'
  },
  {
    path: '/region',
    name: 'Region',
    component: Region
  },
  {
    path: '/global',
    name: 'global',
    component: Global
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/location',
    name: 'Location',
    component: Location
  },
  {
    path: '/country',
    name: 'Country',
    component: Country    
  },
  {
    path: '/location/:loc_name',
    name: 'LocationDetail',
    //props: true,
    components: { default: LocationDetail},
    props: { default: true }
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
