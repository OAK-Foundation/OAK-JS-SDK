"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OakChains = exports.OakChainSchedulingLimit = exports.OakChainWebsockets = exports.TURING_WEBSOCKET = exports.NEUMANN_WEBSOCKET = exports.LOWEST_TRANSFERRABLE_AMOUNT = exports.RECURRING_TASK_LIMIT = exports.NO_DIFF = exports.ADDITIONAL_UNIT = exports.DAYS_IN_WEEK = exports.HOUR_IN_DAY = exports.MIN_IN_HOUR = exports.SEC_IN_MIN = exports.MS_IN_SEC = void 0;
exports.MS_IN_SEC = 1000;
exports.SEC_IN_MIN = 60;
exports.MIN_IN_HOUR = 60;
exports.HOUR_IN_DAY = 24;
exports.DAYS_IN_WEEK = 7;
exports.ADDITIONAL_UNIT = 1;
exports.NO_DIFF = 0;
exports.RECURRING_TASK_LIMIT = 24;
exports.LOWEST_TRANSFERRABLE_AMOUNT = 1000000000;
exports.NEUMANN_WEBSOCKET = 'wss://rpc.testnet.oak.tech';
exports.TURING_WEBSOCKET = 'wss://rpc.turing.oak.tech';
var OakChainWebsockets;
(function (OakChainWebsockets) {
    OakChainWebsockets["NEU"] = "wss://rpc.testnet.oak.tech";
    OakChainWebsockets["TUR"] = "wss://rpc.turing.oak.tech";
})(OakChainWebsockets = exports.OakChainWebsockets || (exports.OakChainWebsockets = {}));
var OakChainSchedulingLimit;
(function (OakChainSchedulingLimit) {
    OakChainSchedulingLimit[OakChainSchedulingLimit["NEU"] = 604800000] = "NEU";
    OakChainSchedulingLimit[OakChainSchedulingLimit["TUR"] = 15552000000] = "TUR";
})(OakChainSchedulingLimit = exports.OakChainSchedulingLimit || (exports.OakChainSchedulingLimit = {}));
var OakChains;
(function (OakChains) {
    OakChains["NEU"] = "NEU";
    OakChains["TUR"] = "TUR";
})(OakChains = exports.OakChains || (exports.OakChains = {}));
//# sourceMappingURL=constants.js.map