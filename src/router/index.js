import Vue from 'vue'
import Router from 'vue-router'

// 1. Define route components.
import Index from '@/components/Index'
// import RouteDraw from '@/components/RouteDraw'
// import CyDemo from '@/components/CyDemo'
import D3demo from '@/components/D3demo'
import D3Gantt from '@/components/D3Gantt'
import Flexbox from '@/components/Flexbox'
import InteractJs from '@/components/InteractJs'


Vue.use(Router)

// 2. Define some routes
export default new Router({
  routes: [
    { name: 'Index', path: '/', component:  Index },
    // { name: 'Route zeichnen', path: '/draw', component: RouteDraw }, 
    // { name: 'CyDemo', path: '/draw2', component: CyDemo }, 
    { name: 'D3Gantt', path: '/gantt', component: D3Gantt },
    { name: 'Flexbox', path: '/flexbox', component: Flexbox }, 
    { name: 'D3demo', path: '/draw3', component: D3demo },
    { name: 'InteractJs', path: '/interact', component: InteractJs }, 
  ]
})
