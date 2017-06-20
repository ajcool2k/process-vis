import { _ } from 'underscore'

export class StateMachine {
  constructor () {
    this.initialState = 'none'
    this.actualState = 'none'
    this.states = {}
  }

  getStates () {
    return this.states
  }

  addState (stateName) {
    this.states[stateName] = {
      name: stateName,
      events: []
    }

    return this.states[stateName]
  }

  addEvent (state, stateNext, event) {
    if (!state || !stateNext) {
      console.warn('FSM: States not defined')
      return
    }

    if (!event) {
      console.warn('FSM: Event not defined')
      return
    }

    if (!event.hasOwnProperty('name') || !event.hasOwnProperty('action')) {
      console.warn('FSM: Event required property missing')
      return
    }

    // One-Action - add event to this state
    event.stateNext = stateNext
    state.events.push(event)

    // Transition - add event to next state as well
    if (event.hasOwnProperty('type') && event.type === 'transition') {
      stateNext.events.push(event)
    }
  }

  start (initialState) {
    let obj = (typeof initialState === 'string') ? this.states[initialState] : initialState

    this.initialState = obj
    console.log('FSM: starting with initialState = ' + initialState.name)
    this.actualState = this.initialState
  }

  hasEvent (eventName) {
    let stateEvent = _.find(this.actualState.events, e => e.name === eventName)
    console.log('hasEvent: ' + eventName)
    return typeof stateEvent === 'object'
  }

  async run (eventName, domEvent) {
    console.log('FSM: ' + eventName)

    // find state
    let state = this.actualState
    if (!state) {
      console.warn('FSM: state ' + this.actualState + ' not found')
      return
    }

    // find event
    let stateEvent = _.find(state.events, e => e.name === eventName)
    if (!stateEvent) {
      console.log('FSM: unknown event ' + eventName + ' called for state ' + this.actualState)
      return
    }

    // define event action
    const doAction = async function () {
      console.log('FSM: action for state ' + state.name + ' - ' + stateEvent.name)
      await stateEvent.action(domEvent)
    }

    try {
      // run and wait for event action to complete
      await doAction()
      console.log('FSM: action done')

      // change state to next state
      this.actualState = stateEvent.stateNext
      console.log('FSM: new state: ' + this.actualState.name)
    } catch (e) {
      console.error('FSM: could not execute action: ' + e)
    }
  }

  getState () {
    return this.actualState
  }

  t1 () {
    console.log('t1')
  }

  t2 () {
    console.log('t2')
  }

  addTestData () {
    let idle = this.addState('idle')
    let a1 = this.addState('a1')
    let a2 = this.addState('a2')
    let a3 = this.addState('a3')

    this.addEvent(idle, a1, {
      name: 'onMouseDownLeft',
      action: () => {
        console.log('FSM: onMouseDownLeft - idle - action')
      }
    })

    this.addEvent(a1, a2, {
      name: 'onMouseDownLeft',
      action: () => { console.log('FSM: onMouseDownLeft - a1 - action') }
    })

    this.addEvent(a1, idle, {
      name: 'onMouseDownRight',
      action: () => { console.log('FSM: onMouseDownRight - a1 - action') }
    })

    this.addEvent(a2, a3, {
      name: 'onMouseDownLeft',
      action: () => { console.log('FSM: onMouseDownLeft - a2 - action') }
    })

    this.addEvent(a2, a1, {
      name: 'onMouseDownRight',
      action: () => { console.log('FSM: onMouseDownRight - a2 - action') }
    })

    this.addEvent(a3, idle, {
      name: 'onMouseDownLeft',
      action: () => { console.log('FSM: onMouseDownLeft - a3 - action') }
    })

    this.addEvent(a3, a2, {
      name: 'onMouseDownRight',
      action: () => { console.log('FSM: onMouseDownRight - a2 - action') }
    })

    console.log(this)
    console.log('FSM: Testdata added')
  }
}
