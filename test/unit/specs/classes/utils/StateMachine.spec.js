import { StateMachine } from '@/classes/utils/StateMachine'

const _ = require('lodash')
require('es6-shim') // for non supported browsers like phantom.js

describe('StateMachine.js (init)', () => {
  it('should be type of StateMachine', () => {
    let fsm = new StateMachine()
    expect(fsm instanceof StateMachine).to.equal(true)
  })

  it('should not have states', () => {
    let fsm = new StateMachine()
    expect(fsm.states).to.be.an('object')
    expect(_.isEqual(fsm.states, {})).to.equal(true)
  })

  it('should not have initial state', () => {
    let fsm = new StateMachine()
    expect(fsm.initialState).to.equal('none')
  })

  it('should not have actual state', () => {
    let fsm = new StateMachine()
    expect(fsm.actualState).to.equal('none')
  })
})

describe('StateMachine.js (addState)', () => {
  it('should add states', () => {
    let fsm = new StateMachine()
    fsm.addState('idle')
    expect(fsm.states.hasOwnProperty('idle')).to.equal(true)
  })

  it('should return created state', () => {
    let fsm = new StateMachine()
    let idle = fsm.addState('idle')
    expect(idle.name).to.equal('idle')
  })
})

describe('StateMachine.js (isState)', () => {
  it('should detect state', () => {
    let fsm = new StateMachine()

    let obj = { name: '', events: [] }
    expect(fsm.isState(obj)).to.equal(true)

    let idle = fsm.addState('idle')
    expect(fsm.isState(idle)).to.equal(true)
  })

  it('should not detect state', () => {
    let fsm = new StateMachine()

    expect(fsm.isState(undefined)).to.equal(false)
    expect(fsm.isState(null)).to.equal(false)
    expect(fsm.isState('idle')).to.equal(false)
    expect(fsm.isState({})).to.equal(false)
    expect(fsm.isState({ name: 'noEvent' })).to.equal(false)
    expect(fsm.isState({ name: 'noEvent', events: 'noEvent' })).to.equal(false)
    expect(fsm.isState({ name: 'noEvent', events: {} })).to.equal(false)
    expect(fsm.isState({ events: [] })).to.equal(false)
  })
})

describe('StateMachine.js (getStates)', () => {
  it('should return states', () => {
    let fsm = new StateMachine()
    let states = ['q0', 'q1', 'q2']

    states.forEach(element => {
      fsm.addState(element)
    })

    let fsmStates = fsm.getStates()
    let stateArray = Object.keys(fsmStates)

    expect(stateArray.length).to.equal(3)
    expect(_.isEqual(stateArray, states)).to.equal(true)
  })
})

describe('StateMachine.js (addEvent)', () => {
  it('should add Event', () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')

    fsm.addEvent(state, state, {
      name: 'onEventX',
      action: (event) => {}
    })

    fsm.addEvent(state, state, {
      name: 'onEventY',
      action: (event) => {}
    })

    let keys = Object.keys(state.events)
    expect(keys.length).to.equal(2)

    expect(state.events[0]).to.be.an('object')
    expect(state.events[0].name).to.equal('onEventX')
    expect(state.events[1]).to.be.an('object')
    expect(state.events[1].name).to.equal('onEventY')
  })

  it('should not add without params', () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    let event = {
      name: 'onEventX',
      action: (event) => {}
    }

    fsm.addEvent(undefined, undefined, undefined)
    fsm.addEvent(undefined, undefined, event)
    fsm.addEvent(undefined, state, undefined)
    fsm.addEvent(undefined, state, event)
    fsm.addEvent(state, undefined, undefined)
    fsm.addEvent(state, undefined, event)
    fsm.addEvent(state, state, undefined)
    fsm.addEvent(state, state, {})

    let keys = Object.keys(state.events)
    expect(keys.length).to.equal(0)
  })
})

describe('StateMachine.js (start)', () => {
  it('should set initial state by string', () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    fsm.start('q0')
    expect(fsm.actualState).to.equal(state)
  })

  it('should set initial state by state object', () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    fsm.start(state)
    expect(fsm.actualState).to.equal(state)
  })
})

describe('StateMachine.js (getState)', () => {
  it('should return actualState', () => {
    let fsm = new StateMachine()

    expect(fsm.getState()).to.equal('none')

    let state = fsm.addState('q0')
    fsm.start('q0')

    expect(fsm.getState()).to.equal(state)
  })
})

describe('StateMachine.js (hasEvent)', () => {
  it('should has event for state', () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')

    fsm.addEvent(state, state, {
      name: 'onEventX',
      action: (event) => {}
    })

    fsm.start(state)

    expect(fsm.hasEvent('onEventX')).to.equal(true)
  })

  it('should not has event for state', () => {
    let fsm = new StateMachine()
    let q0 = fsm.addState('q1')
    let q1 = fsm.addState('q1')

    let event = {
      name: 'onEventX',
      action: (event) => {}
    }

    fsm.addEvent(q1, q1, event)

    fsm.addEvent(q1, q0, event)

    fsm.start(q0)

    expect(fsm.hasEvent('onEventX')).to.equal(false)
  })
})

describe('StateMachine.js (run)', () => {
  it('should run event for state', async () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    let lastRun = ''

    fsm.addEvent(state, state, {
      name: 'onEvent',
      action: (event) => {
        lastRun = 'onEvent'
      }
    })

    fsm.start(state)
    await fsm.run('onEvent')
    expect(lastRun).to.equal('onEvent')
  })

  it('should not run event before start', async () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    let lastRun = ''

    fsm.addEvent(state, state, {
      name: 'onEvent',
      action: (event) => {
        lastRun = 'onEvent'
      }
    })

    await fsm.run('onEvent')
    expect(lastRun).to.equal('')
  })

  it('should not run unknownevent for state', async () => {
    let fsm = new StateMachine()
    let state = fsm.addState('q0')
    let lastRun = ''

    fsm.addEvent(state, state, {
      name: 'onEvent',
      action: (event) => {
        lastRun = 'onEvent'
      }
    })

    fsm.start(state)
    await fsm.run(null)
    await fsm.run()
    await fsm.run('')
    await fsm.run('unknownEvent')
    expect(lastRun).to.equal('')
  })

  it('should run event and switch states', async () => {
    let fsm = new StateMachine()
    let q0 = fsm.addState('q0')
    let q1 = fsm.addState('q1')

    fsm.addEvent(q0, q1, {
      name: 'onEvent',
      action: (event) => {}
    })

    fsm.start(q0)

    // before transition
    let actualState = fsm.getState()
    expect(actualState.name).to.equal('q0')

    // transition
    await fsm.run('onEvent')

    // after transition
    actualState = fsm.getState()
    expect(actualState.name).to.equal('q1')
  })
})
