import Vue from 'vue'
import Router from 'vue-router'

// 1. Define route components.
import Index from '@/components/Index'
import Hello from '@/components/Hello'
import RouteDraw from '@/components/RouteDraw'
import CyDemo from '@/components/CyDemo'

Vue.use(Router)

// 2. Define some routes
export default new Router({
  routes: [
    { name: 'Index', path: '/', component:  Index },
    { name: 'Hello Vue', path: '/hello', component:  Hello },
    { name: 'Route zeichnen', path: '/draw', component: RouteDraw }, 
    { name: 'CyDemo', path: '/draw2', component: CyDemo } 

  ]
})
