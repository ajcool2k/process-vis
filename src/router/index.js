import Vue from 'vue'
import Router from 'vue-router'

// 1. Define route components.
import Index from '@/components/Index'
import Process from '@/components/Process'

// Routes for TestApplications
import RenderTest from '@/components/demos/RenderTest'
import VectorTest from '@/components/demos/VectorTest'
import StateMachine from '@/components/demos/StateMachine'

Vue.use(Router)

// 2. Define some routes
export default new Router({
  routes: [
    { name: 'Index', path: '/', component: Index },
    { name: 'Process (new)', path: '/process', component: Process },
    { name: 'Process (existing)', path: '/process/:id', component: Process },

    { name: 'RenderTest', path: '/RenderTest', component: RenderTest },
    { name: 'VectorTest', path: '/VectorTest', component: VectorTest },
    { name: 'StateMachine', path: '/state-machine', component: StateMachine }
  ]
})
