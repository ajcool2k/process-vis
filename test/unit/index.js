import Vue from 'vue'

Vue.config.productionTip = false

// require all test files (files that ends with .spec.js)
console.log('testsuite')
const testsContext = require.context('./specs', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
console.log(JSON.stringify(testsContext.keys()))

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
console.log('source')
const srcContext = require.context('../../src', true, /^\.\/(?!main(\.js)?$)/)
srcContext.keys().forEach(srcContext)
console.log(JSON.stringify(srcContext.keys()))
