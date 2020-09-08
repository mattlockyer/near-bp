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
        login: false,
    },
    near: {}
}

const store = createContext(initialState)
const { Provider } = store

const updateProp = (newState, newPropState, prop) => {
    Object.keys(newState).forEach((k) => {
        if (k === prop) {
            newState[k] = { ...newState[k], ...newPropState}
            return
        }
        if (typeof newState[k] === 'object') {
            return updateProp(newState[k], newPropState, prop)
        }
    })
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