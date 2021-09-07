import { ApiPromise } from '@polkadot/api';
import { seeds } from './consts';
import { sendTx } from './util/tx';
import { trasferAmount } from './consts'; 
import BN from 'bn.js';

const UNIT = new BN(1_000_000_000_000);

export async function makeFree(api: ApiPromise, address: string, amount: number = trasferAmount) {
    try {
        // 1. Try connect to Crust Network
        await api.isReadyOrError;
        const tx = api.tx.balances.transfer(
            address,
            UNIT.mul(new BN(amount))
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
        return res;
    } catch (e) {
        return {
            status: false,
            message: 'Error',
            details: e
        };
    }
}
