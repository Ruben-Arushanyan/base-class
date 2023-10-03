import { SingularEventEmitter } from 'secure-event-emitter'
import { isFunction, eq } from './utils'


class Store {
    #emitter_key = Symbol()
    #emitter = new SingularEventEmitter(this.#emitter_key)

    state
    prevState

    constructor(initialState) {
        this.state = this.prevState = initialState
    }

    updateState = (cb) => {
        if (!isFunction(cb)) {
            throw new TypeError('[[updateState()]] argument must be a function');
        }
        const newState = cb(this.state)
        if (!eq(newState, this.state)) {
            this.prevState = this.state
            this.state = newState
            this.#emitter.unlock(this.#emitter_key).emit(this.state, this.prevState)
        }
    }

    subscribe = (cb) => {
        const _cb = (...args) => cb(args)
        this.#emitter.on(_cb)
        return () =>  this.#emitter.off(_cb)
    }

    subscribeSelector = (selector, cb) => {
        return this.subscribe(() => {
            const prevValue = selector(this.prevState)
            const newValue = selector(this.state)
            if (!eq(newValue, prevValue)) {
                cb(newValue, prevValue);
            }
        })
    }
}

export {Store}