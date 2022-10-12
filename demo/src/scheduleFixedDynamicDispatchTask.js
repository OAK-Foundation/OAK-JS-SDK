const _ = require('lodash');
const { Recurrer, oakConstants } = require('oak-js-library');

const { scheduleDynamicDispatchTask } = require('./helpFn');

const { MS_IN_SEC } = oakConstants;

const main = async () => {
  const executionTimes = _.map(new Recurrer().getDailyRecurringTimestamps(Date.now(), 3, 7), (time) => time / MS_IN_SEC);
  await scheduleDynamicDispatchTask({ fixed: { executionTimes } });
}

main();
