import _ from 'lodash';
import { getContext, checkBalance, getPolkadotApi, generateProviderId, sendExtrinsic } from './helpFn';

beforeEach(() => {
  jest.setTimeout(540000);
});

test('dynamicDispatchTask.call works', async () => {
  const { scheduler, observer, keyringPair } = await getContext();
  await checkBalance(keyringPair);
  const polkadotApi = await getPolkadotApi();
  const extrinsic = polkadotApi.tx['balances']['transfer']('66fhJwYLiK87UDXYDQP9TfYdHpeEyMvQ3MK8Z6GgWAdyyCL3', 10000000000);
  const schedule = {
    "Fixed": {
      "executionTimes": [
        1665586800,
      ]
    }
  };
  
  const hexString = await scheduler.buildScheduleDynamicDispatchTask(keyringPair, generateProviderId(), schedule, extrinsic);
  console.log('hexString: ', hexString);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, hexString);
  console.log('extrinsicHash: ', extrinsicHash);
  console.log('blockHash: ', blockHash);
});
