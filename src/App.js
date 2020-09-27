import 'regenerator-runtime/runtime';
import React, { useContext, useEffect } from 'react';

import { store } from './state/store';
import { initNear } from './state/near';

import logo from './assets/logo.svg';
import nearlogo from './assets/gray_near_logo.svg';
import near from './assets/near.svg';
import './App.css';

const App = () => {
    const { state, dispatch, update } = useContext(store)

    const onMount = async () => {
        await dispatch(initNear())
    }
    useEffect(onMount, [])

    console.log(state)
    
    const signedInFlow = async () => {
        if (!state.near.contract || state.app.login) return
        console.log("come in sign in flow")
        update({ login: true }, 'app')
        if (window.location.search.includes("account_id")) {
            window.location.replace(window.location.origin + window.location.pathname)
        }
        await welcome()
    }
    useEffect(signedInFlow, [state.near.contract])

    const welcome = async () => {
        const { accountId } = state.near
        const response = await state.near.contract.welcome({ account_id: accountId });
        update({ speech: response.text }, 'app');
    }

    const requestSignIn = async () => {
        const appTitle = 'NEAR React template';
        await state.near.wallet.requestSignIn(
            state.near.contractName,
            appTitle
        )
    }

    const requestSignOut = async () => {
        state.near.wallet.signOut();
        setTimeout(signedOutFlow, 500);
        console.log("after sign out", state.near.wallet.isSignedIn())
    }

    const changeGreeting = async (message) => {
        await state.near.contract.set_greeting({ message });
        await welcome()
    }

    const signedOutFlow = async () => {
        if (window.location.search.includes("account_id")) {
            window.location.replace(window.location.origin + window.location.pathname)
        }
        update({
            login: false,
            speech: null
        }, 'app')
    }

    let style = {
        fontSize: "1.5rem",
        color: "#0072CE",
        textShadow: "1px 1px #D1CCBD"
    }

    return (
        <div className="App-header">
            <div className="image-wrapper">
                <img className="logo" src={nearlogo} alt="NEAR logo" />
                <p style={style}>{state.app.speech}</p>
            </div>
            <div>
                {state.app.login ?
                    <div>
                        <button onClick={() => requestSignOut()}>Log out</button>
                        <br />
                        <br />
                        <input id="message" />
                        <br />
                        <br />
                        <button onClick={() => changeGreeting(document.querySelector('#message').value)}>Change greeting</button>
                    </div>
                    : <button onClick={() => requestSignIn()}>Log in with NEAR</button>}
            </div>
            <div>
                <div className="logo-wrapper">
                    <img src={near} className="App-logo margin-logo" alt="logo" />
                    <img src={logo} className="App-logo" alt="logo" />
                </div>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
      </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
      </a>
                <p><span role="img" aria-label="net">🕸</span> <a className="App-link" href="https://nearprotocol.com">NEAR Website</a> <span role="img" aria-label="net">🕸</span>
                </p>
                <p><span role="img" aria-label="book">📚</span><a className="App-link" href="https://docs.nearprotocol.com"> Learn from NEAR Documentation</a> <span role="img" aria-label="book">📚</span>
                </p>
            </div>
        </div>
    )
}

export default App;
