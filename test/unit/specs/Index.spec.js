import Vue from 'vue'
import Index from '@/components/Index'

import VueRouter from 'vue-router'

describe('Index.vue', () => {
  it('should render correct contents', () => {

    const Constructor = Vue.extend(Index)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('h1').textContent)
      .to.equal('Übersicht Module')
  })

  it('should calculate contents', () => {
    console.warn('Hello.vue')
    let a = 'a'
    expect(a).to.equal('a')
  })
})
