const _ = require('lodash');
const { Recurrer, oakConstants } = require('oak-js-library');

const { scheduleDynamicDispatchTask } = require('./helpFn');

const RECURRING_FREQUENCY = 3600;
const { MS_IN_SEC } = oakConstants;

const main = async () => {
  const [nextExecutionTime] = _.map(new Recurrer().getHourlyRecurringTimestamps(Date.now(), 1), (time) => time / MS_IN_SEC);
  await scheduleDynamicDispatchTask({ recurring: { nextExecutionTime, frequency: RECURRING_FREQUENCY } });
}

main();
