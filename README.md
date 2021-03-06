# OAK-JS-SDK
This library was developed by [OAK Foundation](https://oak.tech) for the purposes of having easier access to the Neumann and Turing blockchain extrinsics. 
This library was built on top of the [polkadot-js/api library](https://github.com/polkadot-js/api) and wraps the polkadot JS APIs with more utility that may help with accessing our chain and using our APIs in more intuitive ways.

## Installation
For frontend, you will want to grab the frontend tag.
```
npm install git+ssh://git@github.com:OAK-Foundation/OAK-JS-SDK.git#0.1.0-frontend
```

For backend, you will want to grab the backend tag.
```
npm install git+ssh://git@github.com:OAK-Foundation/OAK-JS-SDK.git#0.1.0-backend
```

## Docs
There are comments in each class describing what the class does and how to use the methods in each class.

If more comprehensive documentation is required on how to use it, please visit our [documentation page on our website](https://docs.oak.tech/docs/automation-time-js-sdk/).

## Test

Run commands to test:

**Unit test**

```
npm run test
```

**Functional test**

We need to to setup a SENDER_MNEMONIC environment variable for the test and ensure that there are enough tokens in this account (recommended the balance is greater than or equals to 30 UNIT).

```
SENDER_MNEMONIC="<SENDER_MNEMONIC>" npm run test:functional
```

**Test all**

```
SENDER_MNEMONIC="<SENDER_MNEMONIC>" npm run test:all
```
