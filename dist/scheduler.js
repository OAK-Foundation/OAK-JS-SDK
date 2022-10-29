"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const api_1 = require("@polkadot/api");
const _ = require("lodash");
const constants_1 = require("./constants");
/**
 * The constructor takes the input to create an API client to connect to the blockchain.
 * Further commands are performed via this API client in order to reach the blockchain.
 * @param chain: OakChains
 */
class Scheduler {
    /**
     * constructor
     * @param chain
     * @param options { providerUrl }, You can specify a custom provider url.
     */
    constructor(chain, options) {
        const { providerUrl } = options || {};
        this.chain = chain;
        this.wsProvider = new api_1.WsProvider(providerUrl || constants_1.OakChainWebsockets[chain]);
        this.schedulingTimeLimit = constants_1.OakChainSchedulingLimit[chain];
    }
    /**
     * Creates the API client if one does not already exist
     * @returns ApiPromise
     */
    async getAPIClient() {
        if (_.isNil(this.api)) {
            this.api = await api_1.ApiPromise.create({
                provider: this.wsProvider,
                rpc: {
                    automationTime: {
                        generateTaskId: {
                            description: 'Getting task ID given account ID and provided ID',
                            params: [
                                {
                                    name: 'accountId',
                                    type: 'AccountId',
                                },
                                {
                                    name: 'providedId',
                                    type: 'Text',
                                },
                            ],
                            type: 'Hash',
                        },
                        getTimeAutomationFees: {
                            description: 'Retrieve automation fees',
                            params: [
                                {
                                    name: 'action',
                                    type: 'AutomationAction',
                                },
                                {
                                    name: 'executions',
                                    type: 'u32',
                                },
                            ],
                            type: 'Balance',
                        },
                        calculateOptimalAutostaking: {
                            description: 'Calculate the optimal period to restake',
                            params: [
                                {
                                    name: 'principal',
                                    type: 'i128',
                                },
                                {
                                    name: 'collator',
                                    type: 'AccountId',
                                },
                            ],
                            type: 'AutostakingResult',
                        },
                        getAutoCompoundDelegatedStakeTaskIds: {
                            description: 'Return autocompounding tasks by account',
                            params: [
                                {
                                    name: 'account_id',
                                    type: 'AccountId',
                                },
                            ],
                            type: 'Vec<Hash>',
                        },
                    },
                    xcmpHandler: {
                        fees: {
                            description: 'Return XCMP fee for a automationTime.scheduleXCMPTask',
                            params: [
                                {
                                    name: 'encoded_xt',
                                    type: 'Bytes',
                                },
                            ],
                            type: 'u64',
                        },
                        crossChainAccount: {
                            description: "Find OAK's cross chain access account from an account",
                            params: [
                                {
                                    name: 'account_id',
                                    type: 'AccountId32',
                                },
                            ],
                            type: 'AccountId32',
                        },
                    },
                },
                types: {
                    AutomationAction: {
                        _enum: ['Notify', 'NativeTransfer', 'XCMP', 'AutoCompoundDelegatedStake'],
                    },
                    AutostakingResult: {
                        period: 'i32',
                        apy: 'f64',
                    },
                },
            });
        }
        return this.api;
    }
    /**
     * Converts timestamps from milliseconds into seconds for Polkadot API consumption
     * @param startTimestamps
     * @returns timestamp[] in seconds
     */
    convertToSeconds(startTimestamps) {
        return _.map(startTimestamps, (startTimestamp) => {
            const isMillisecond = startTimestamp > 100000000000;
            if (isMillisecond)
                return startTimestamp / constants_1.MS_IN_SEC;
            return startTimestamp;
        });
    }
    /**
     * Default error handler for websockets updates for extrinsic
     * @param result
     * @returns null
     */
    async defaultErrorHandler(result) {
        console.log(`Tx status: ${result.status.type}`);
        if (result.status.isFinalized) {
            if (!_.isNil(result.dispatchError)) {
                if (result.dispatchError.isModule) {
                    const api = await this.getAPIClient();
                    const metaError = api.registry.findMetaError(result.dispatchError.asModule);
                    const { docs, name, section } = metaError;
                    const dispatchErrorMessage = JSON.stringify({ docs, name, section });
                    const errMsg = `Transaction finalized with error by blockchain ${dispatchErrorMessage}`;
                    console.log(errMsg);
                }
                else {
                    const errMsg = `Transaction finalized with error by blockchain ${result.dispatchError.toString()}`;
                    console.log(errMsg);
                }
            }
        }
    }
    /**
     * GetInclusionFees: gets the fees for inclusion ONLY.
     * This does not include execution fees.
     * @param extrinsic
     * @param address
     * @returns fee
     */
    async getInclusionFees(extrinsic, address) {
        const paymentInfo = await extrinsic.paymentInfo(address);
        return paymentInfo.partialFee;
    }
    /**
     * getTaskID: gets a txHash for a task.
     * Wallet Address and Provided ID are required inputs.
     * TxHash for a task will be returned.
     * @param address
     * @param providedID
     * @returns next available task ID
     */
    async getTaskID(address, providedID) {
        const polkadotApi = await this.getAPIClient();
        // TODO: hack until we can merge correct types into polkadotAPI
        const taskIdCodec = await polkadotApi.rpc.automationTime.generateTaskId(address, providedID);
        return taskIdCodec.toString();
    }
    /**
     * getTimeAutomationFees
     * @param action type
     * @param executions
     * @returns fee
     */
    async getTimeAutomationFees(action, executions) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.rpc.automationTime.getTimeAutomationFees(action, executions);
        return resultCodec.toJSON();
    }
    /**
     * calculateOptimalAutostaking
     * @param principal
     * @param collator
     * @returns duration and apy result
     */
    async calculateOptimalAutostaking(principal, collator) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.rpc.automationTime.calculateOptimalAutostaking(principal, collator);
        return resultCodec.toPrimitive();
    }
    /**
     * getAutoCompoundDelegatedStakeTaskIds
     * @param account
     * @returns list of autocompounding tasks
     */
    async getAutoCompoundDelegatedStakeTaskIds(account_id) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.rpc.automationTime.getAutoCompoundDelegatedStakeTaskIds(account_id);
        return resultCodec.toJSON();
    }
    /**
     * crossChainAccount: OAK's XCMP account on another chain.
     * Account ID is required input
     * Account ID will be returned.
     * @param accountId
     * @returns accountId
     */
    async crossChainAccount(accountId) {
        const polkadotApi = await this.getAPIClient();
        // TODO: hack until we can merge correct types into polkadotAPI
        const resultCodec = await polkadotApi.rpc.xcmpHandler.crossChainAccount(accountId);
        return resultCodec.toString();
    }
    /**
     * fees: Retreive fees required for scheduling an XCMP task
     * Encoded extrinsic is required input
     * Fee will be returned
     * @param encodedXt
     * @returns fee
     */
    async fees(encodedXt) {
        const polkadotApi = await this.getAPIClient();
        // TODO: hack until we can merge correct types into polkadotAPI
        const resultCodec = await polkadotApi.rpc.xcmpHandler.fees(encodedXt);
        return resultCodec.toPrimitive();
    }
    /**
     * validateTimestamps: validates timestamps. If not valid, will error.
     * If valid, nothing is returned. Called in buildScheduleNotifyExtrinsic
     * and buildScheduleNativeTransferExtrinsic.
     *
     * Timestamps must be:
     * 1. on the hour
     * 2. in a future time slot, but within a chain-dependent scheduling limit.
     * 3. limited to 24 time slots
     *
     * @param timestamps
     */
    validateTimestamps(timestamps) {
        if (timestamps.length > constants_1.RECURRING_TASK_LIMIT)
            throw new Error(`Recurring Task length cannot exceed ${constants_1.RECURRING_TASK_LIMIT}`);
        const currentTime = Date.now();
        const nextAvailableHour = (currentTime - (currentTime % (constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR * constants_1.MS_IN_SEC)) + constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR * constants_1.MS_IN_SEC) /
            1000;
        _.forEach(timestamps, (timestamp) => {
            if (timestamp < nextAvailableHour)
                throw new Error('Scheduled timestamp in the past');
            if (timestamp % (constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR) !== 0)
                throw new Error('Timestamp is not an hour timestamp');
            if (timestamp > currentTime + this.schedulingTimeLimit)
                throw new Error('Timestamp too far in future');
        });
    }
    /**
     * validateTransferParams: validates Native Transfer params. If not valid, will error.
     * If valid, nothing is returned. Called in buildScheduleNativeTransferExtrinsic.
     *
     * Native Transfer Params:
     * 1. Must send a baseline amount of 1_000_000_000 plancks (0.1 STUR/TUR).
     * 2. The receiving address must not be the same as that of the sender.
     *
     * @param amount
     * @param sendingAddress
     * @param receivingAddress
     */
    validateTransferParams(amount, sendingAddress, receivingAddress) {
        if (amount < constants_1.LOWEST_TRANSFERRABLE_AMOUNT)
            throw new Error(`Amount too low`);
        if (sendingAddress === receivingAddress)
            throw new Error(`Cannot send to self`);
    }
    /**
     * SendExtrinsic: sends built and signed extrinsic to the chain.
     * Accepts pre-built extrinsic hex string. You may provide your own error handler.
     * If none provided, a default error handler is provided, seen below.
     * A transaction hash should be returned as a result of the extrinsic.
     * @param extrinsic
     * @param handleDispatch
     * @returns transaction hash
     */
    async sendExtrinsic(extrinsicHex, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    handleDispatch) {
        const polkadotApi = await this.getAPIClient();
        const txObject = polkadotApi.tx(extrinsicHex);
        const unsub = await txObject.send(async (result) => {
            const { status } = result;
            if (_.isNil(handleDispatch)) {
                await this.defaultErrorHandler(result);
            }
            else {
                await handleDispatch(result);
            }
            if (status.isFinalized) {
                unsub();
            }
        });
        return txObject.hash.toString();
    }
    /**
     * BuildScheduleNotifyExtrinsic: builds and signs a schedule notify task extrinsic.
     * Function gets the next available nonce for user.
     * Therefore, will need to wait for transaction finalization before sending another.
     * Timestamps are converted into seconds if in milliseconds.
     *
     * Timestamps must be:
     * 1. on the hour
     * 2. in a future time slot, but within a chain-dependent scheduling limit.
     * 3. limited to 24 time slots
     *
     * @param address
     * @param providedID
     * @param timestamp
     * @param receivingAddress
     * @param amount
     * @returns extrinsic hex, format: `0x${string}`
     */
    async buildScheduleNotifyExtrinsic(address, providedID, timestamps, message, signer) {
        this.validateTimestamps(timestamps);
        const secondTimestamps = this.convertToSeconds(timestamps);
        const polkadotApi = await this.getAPIClient();
        const extrinsic = polkadotApi.tx['automationTime']['scheduleNotifyTask'](providedID, secondTimestamps, message);
        const signedExtrinsic = await extrinsic.signAsync(address, {
            signer,
            nonce: -1,
        });
        return signedExtrinsic.toHex();
    }
    /**
     * BuildScheduleNativeTransferExtrinsic: builds and signs native transfer task extrinsic.
     * Function gets the next available nonce for each wallet.
     * Therefore, will need to wait for transaction finalization before sending another.
     * Timestamps is an array of 1-24 unix timestamps, depending on recurrences needed.
     * ProvidedID needs to be a unique ID per wallet address.
     * Timestamps are converted into seconds if in milliseconds.
     *
     * Timestamps must be:
     * 1. on the hour
     * 2. in a future time slot, but within a chain-dependent scheduling limit.
     * 3. limited to 24 time slots
     *
     * Native Transfer Params:
     * 1. Must send a baseline amount of 1_000_000_000 plancks (0.1 STUR/TUR).
     * 2. The receiving address must not be the same as that of the sender.
     *
     * @param address
     * @param providedID
     * @param timestamp
     * @param receivingAddress
     * @param amount
     * @returns extrinsic hex, format: `0x${string}`
     */
    async buildScheduleNativeTransferExtrinsic(address, providedID, timestamps, receivingAddress, amount, signer) {
        this.validateTimestamps(timestamps);
        this.validateTransferParams(amount, address, receivingAddress);
        const secondTimestamps = this.convertToSeconds(timestamps);
        const polkadotApi = await this.getAPIClient();
        const extrinsic = polkadotApi.tx['automationTime']['scheduleNativeTransferTask'](providedID, secondTimestamps, receivingAddress, amount);
        const signedExtrinsic = await extrinsic.signAsync(address, {
            signer,
            nonce: -1,
        });
        return signedExtrinsic.toHex();
    }
    async buildScheduleDynamicDispatchTask(address, providedID, schedule, call, signer) {
        const polkadotApi = await this.getAPIClient();
        if (schedule.recurring) {
            const { frequency, nextExecutionTime } = schedule.recurring;
            if (!_.isNumber(frequency) || frequency <= 0) {
                throw new Error("frequency must be a positive integer");
            }
            if (!_.isNumber(nextExecutionTime) || nextExecutionTime <= 0) {
                throw new Error("nextExecutionTime must be a positive integer");
            }
        }
        else {
            const { executionTimes } = schedule.fixed;
            if (!_.isArray(executionTimes)) {
                throw new Error("executionTimes is not an array");
            }
            if (_.isEmpty(executionTimes)) {
                throw new Error("executionTimes is empty");
            }
        }
        if (_.isNil(call)) {
            throw new Error("call is null or undefined");
        }
        const extrinsic = polkadotApi.tx['automationTime']['scheduleDynamicDispatchTask'](providedID, schedule, call);
        const signedExtrinsic = await extrinsic.signAsync(address, {
            signer,
            nonce: -1,
        });
        return signedExtrinsic.toHex();
    }
    /**
     * BuildCancelTaskExtrinsic: builds extrinsic as a hex string for cancelling a task.
     * User must provide txHash for the task and wallet address used to schedule the task.
     * @param address
     * @param taskID
     * @returns extrinsic hex, format: `0x${string}`
     */
    async buildCancelTaskExtrinsic(address, taskID, signer) {
        const polkadotApi = await this.getAPIClient();
        const extrinsic = polkadotApi.tx['automationTime']['cancelTask'](taskID);
        const signedExtrinsic = await extrinsic.signAsync(address, {
            signer,
            nonce: -1,
        });
        return signedExtrinsic.toHex();
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map