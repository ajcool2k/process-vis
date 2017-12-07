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

  isState (obj) {
    if (typeof obj !== 'object' || !obj) return false
    if (!obj.hasOwnProperty('name') || typeof obj.name !== 'string') return false
    if (!obj.hasOwnProperty('events') || obj.events instanceof Array === false) return false
    return true
  }

  start (initialState) {
    let obj = (typeof initialState === 'string') ? this.states[initialState] : initialState

    if (this.isState(obj) === false) {
      console.warn('FSM start: object is not a state')
      return
    }

    this.initialState = obj
    console.log('FSM: starting with initialState = ' + initialState.name)
    this.actualState = this.initialState
  }

  hasEvent (eventName) {
    if (this.actualState === 'none') {
      console.warn('FSM hasEvent: no actualState is set')
      return false
    }

    let stateEvent = this.actualState.events.find(e => {
      if (typeof e.name === 'string') return e.name === eventName
      if (e.name instanceof Array) return e.name.indexOf(eventName) > -1
      return false
    })
    console.log('FSM hasEvent: ' + eventName + ', actualState: ' + this.actualState.name)
    return typeof stateEvent === 'object'
  }

  async run (eventName, domEvent) {
    console.log('FSM: ' + eventName)

    // find state
    let state = this.actualState
    if (!state || state === 'none') {
      console.warn('FSM: state ' + this.actualState + ' not found')
      return
    }

    // find event
    let stateEvent = state.events.find(e => {
      if (typeof e.name === 'string') return e.name === eventName
      if (e.name instanceof Array) return e.name.indexOf(eventName) > -1
      return false
    })

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
