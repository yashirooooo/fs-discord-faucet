import pRetry from 'p-retry';
import { logger } from '@polkadot/util';
import { parseIssue } from './service/github';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { chainAddr, token, channel, githubRepoName } from './consts';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
const { Client, Intents } = require('discord.js');
import { githubUserName } from './consts';
import url from 'url';

const l = logger('main');

const keyring = new Keyring();

export const isValidAddr = (addr: string) => {
    try {
      keyring.decodeAddress(addr);
      return true;
    } catch (error) {
      return false;
    }
}

const bot = () => {
    const provider = new WsProvider(chainAddr);
    ApiPromise.create({
        provider,
        typesBundle: typesBundleForPolkadot,
    }).then(async (api) => {
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], restRequestTimeout: 60 * 6000 });
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });
        
        client.on('error', console.error);

        client.on('messageCreate', async (msg: { channelId: any; content: any; author: { id: any; }; reply: (arg0: string) => void; }) => {
            const channelId = msg.channelId;
            if (channel == channelId) {
              const address = msg.content;
              const authorId = msg.author.id;
              if (isValidAddr(address)) {
                
              }
            }
        });

        client.login(token);
    })
    .catch(() => process.exit(1))
    const uObj = url.parse('https://github.com/yuhui1208/test/issues/101');
    const prefix = `/${githubUserName}/${githubRepoName}/issues/`
    console.log('uObj', uObj)
    if (uObj.pathname?.startsWith(prefix)) {
        const issue = uObj.pathname?.substr(prefix.length) 
        console.log('issue', issue)
        parseIssue(Number(issue))
    }

}

// TODO: add error handling
const main = async () => {

    await pRetry(bot, {
      onFailedAttempt: error => {
        console.log(
          `${error.message} - Retry attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        );
      },
      retries: 10,
    }) 
};

main().catch(e => {
    l.error(e);
    process.exit(1);
});