/********************************
The following store is intended to be updated by passing in a property name
- state updates are additive / write over values e.g. { ...old, ...new }
- if no prop name is passed, you will replace any values at the root with new state
- a prop name can be nested anywhere in the state tree
- to delete, use undefined or go one level up and replace the parent object
- if you add new json objects, you can update them by prop name in a subsequent dispatch
********************************/
import React, { createContext, useReducer } from 'react'

const initialState = {
    app: {
        mounted: false,
        preserved: true,
        nested: {
            mounted: false,
        }
    },
    near: {}
}

const store = createContext(initialState)
const { Provider } = store


/********************************
find deeply nested state via dot notation
e.g. app.nav.drawer = { isVisible: true } is what we want by calling
update({ isVisible: true }, 'app.nav.drawer')
********************************/
const updateProp = (newState, newPropState, prop = '') => {
    if (prop.length === 0) return
    prop = prop.split('.')
    const path = Object.keys(newState).find((k) => prop[0] === k)
    if (!path) {
        console.warn('path not found', path)
    }
    if (prop.length > 1) {
        return updateProp(newState[path], newPropState, prop.slice(1).join('.'))
    }
    newState[path] = { ...newState[path], ...newPropState}
}

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, newPropState) => {
        const { __prop: prop } = newPropState
        delete newPropState.__prop
        if (!prop) {
            return { ...state, ...newPropState }
        }
        const newState = { ...state }
        updateProp(newState, newPropState, prop)
        return newState
    }, initialState)
    
    const dispatchWithProp = (newPropState, prop) => {
        if (prop) {
            newPropState.__prop = prop
        }
        dispatch(newPropState)
    }

    const wrappedDispatch = async (fn) => fn(state, dispatchWithProp)

    return <Provider value={{ state, dispatch: wrappedDispatch, update: dispatchWithProp }}>{children}</Provider>
}

export { store, StateProvider }