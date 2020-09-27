import getConfig from '../config';
import * as nearlib from 'near-api-js';

export const initNear = () => async (state, dispatch) => {
    dispatch({ mounted: true }, 'app')

    dispatch({ mounted: true })
    dispatch({ mounted: true }, 'app')
    dispatch({ mounted: true }, 'app.nested')
    dispatch({ notInitial: {  mounted: false } }, 'app.nested')
    dispatch({ mounted: true }, 'app.nested.notInitial')

    // Initializing connection to the NEAR DevNet.
    const nearConfig = getConfig(process.env.NODE_ENV || 'development')
    const near = await nearlib.connect(Object.assign({ deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() } }, nearConfig));

    // Needed to access wallet login
    const wallet = new nearlib.WalletAccount(near);

    // Getting the Account ID. If unauthorized yet, it's just empty string.
    const accountId = wallet.getAccountId();

    // Initializing our contract APIs by contract name and configuration.
    let acct = await new nearlib.Account(near.connection, accountId);
    const { contractName } = nearConfig
    const contract = await new nearlib.Contract(acct, nearConfig.contractName, {
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['welcome'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['set_greeting'],
        // Sender is the account ID to initialize transactions.
        sender: accountId
    });

    dispatch({ contract, accountId, wallet, contractName }, 'near')
};