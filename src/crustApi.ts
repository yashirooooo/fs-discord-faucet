import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { chainAddr, seeds } from './consts';
import { sendTx } from './util/tx';
import { parseObj } from './util';
import { applyCount } from './consts'; 

export async function makeFree(address: string, count: number = applyCount) {
    try {
        // 1. Try connect to Crust Network
        const api = new ApiPromise({
            provider: new WsProvider(chainAddr),
            typesBundle: typesBundleForPolkadot,
        });
        await api.isReadyOrError;
        const accountOrders = parseObj(await api.query.market.freeOrderAccounts(address));
        if (accountOrders) {
            return {
                status: false,
                message: 'Error',
                details: ' The account already in free accounts'
            }
        }
        const tx = api.tx.market.addIntoFreeOrderAccounts(
            address,
            count
        );

        const res = await sendTx(api, tx, seeds as string);
        if (res?.status) {
            console.log(`Make ${address} free strorage success`);
        } else {
            console.error(
                `Make ${address} free strorage failed with Send ${res?.details}`
            );
            //   throw new Error(`Make ${address} free strorage failed with ${res?.details}`);
        }
        api.disconnect();
        return res;
    } catch (e) {
        return {
            status: false,
            message: 'Error',
            details: e.message
        };
    }
}
