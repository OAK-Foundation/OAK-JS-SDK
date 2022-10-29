const _ = require('lodash');
const { WsProvider, ApiPromise, Keyring } = require('@polkadot/api');
const { waitReady } = require('@polkadot/wasm-crypto');
const { Scheduler, Observer, oakConstants } = require('oak-js-library');

const { RECEIVER_ADDRESS, TRANSFER_AMOUNT } = require('./constants');

const { OakChains, OakChainWebsockets } = oakConstants;

/**
 * getPolkadotApi: Get a polkadot API
 * @returns polkadotApi
 */
const getPolkadotApi = async () => {
  const providerUrl = process.env.PROVIDER_URL || OakChainWebsockets[OakChains.STUR]; // PROVIDER_URL environment variable for local testing
  const wsProvider = new WsProvider(providerUrl);
  const polkadotApi = await ApiPromise.create({ provider: wsProvider });
  return polkadotApi;
}

/**
 * getKeyringPair: Get keyring pair for testing
 * @returns keyring pair
 */
const getKeyringPair = async () => {
  await waitReady();
  if (_.isEmpty(process.env.SENDER_MNEMONIC)) {
    throw new Error('The SENDER_MNEMONIC environment variable is not set.')
  }
  // Generate sender keyring pair from mnemonic
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 51 });
  const keyringPair = keyring.addFromMnemonic(process.env.SENDER_MNEMONIC);
  return keyringPair;
}

/**
 * generateProviderId: Generate a provider Id
 * @returns providerId
 */
const generateProviderId = () => `functional-test-${new Date().getTime()}-${_.random(0, Number.MAX_SAFE_INTEGER, false)}`;


/**
 * sendExtrinsic: Send extrinsic to chain
 * @param scheduler 
 * @param extrinsicHex 
 * @returns promise
 */
const sendExtrinsic = async (scheduler, extrinsicHex) => {
  return new Promise(async (resolve, reject) => {
    try {
      const txHash = await scheduler.sendExtrinsic(extrinsicHex, ({ status, events, dispatchError }) => {
        if (status?.isFinalized) {
          const { api } = scheduler;

          if (!_.isNil(dispatchError)) {
            if (dispatchError.isModule) {
                const metaError = api.registry.findMetaError(dispatchError.asModule);
                const { name, section } = metaError;
                reject(new Error(`${section}.${name}`));
                return;
            } else {
                reject(new Error(dispatchError.toString()));
                return;
            }
          }

          const event = _.find(events, ({ event }) => api.events.system.ExtrinsicSuccess.is(event));
          if (event) {
            resolve({ extrinsicHash: txHash, blockHash: status?.asFinalized?.toString() });
          } else {
            reject(new Error('The event.ExtrinsicSuccess is not found'));
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * scheduleDynamicDispatchTask
 * @param object schedule 
 * @returns taskID
 */
const scheduleDynamicDispatchTask = async (schedule) => {
	const polkadotApi = await getPolkadotApi();
	const keyringPair = await getKeyringPair();
	const providerUrl = process.env.PROVIDER_URL;
	const scheduler = new Scheduler(OakChains.STUR, { providerUrl });
	const observer = new Observer(OakChains.STUR, { providerUrl });

	// Create dynamic dispatch task and send
	const providedID = generateProviderId();
	const call = polkadotApi.tx['balances']['transfer'](RECEIVER_ADDRESS, TRANSFER_AMOUNT);

  const hexString = await scheduler.buildScheduleDynamicDispatchTask(keyringPair, providedID, schedule, call);
  const { extrinsicHash, blockHash } = await sendExtrinsic(scheduler, hexString);
	
	console.log('extrinsicHash: ', extrinsicHash);
	console.log('blockHash: ', blockHash);

  const firstExecutionTime = schedule.recurring ? schedule.recurring.nextExecutionTime : schedule.fixed.executionTimes[0];

  // Make use the task has been scheduled
  const taskID = (await scheduler.getTaskID(keyringPair.address, providedID)).toString();
	console.log('firstExecutionTime: ', firstExecutionTime);
  const tasks = await observer.getAutomationTimeScheduledTasks(firstExecutionTime);
	console.log('tasks: ', tasks);
	console.log('taskID: ', taskID);
  const task = _.find(tasks, ([_account, scheduledTaskId]) => scheduledTaskId === taskID);
	console.log('scheduled task: ', task);

  return taskID;
}

module.exports = { getPolkadotApi, getKeyringPair, generateProviderId, sendExtrinsic, scheduleDynamicDispatchTask };