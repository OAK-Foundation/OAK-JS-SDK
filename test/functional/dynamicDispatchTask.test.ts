import _ from 'lodash';
import { getContext, scheduleDynamicDispatchTaskAndVerify, getRecurringDynamicDispatchExtrinsicParams, cancelTaskAndVerify, getFixedDynamicDispatchExtrinsicParams } from './helpFn';

beforeEach(() => { jest.setTimeout(540000); });

test('dynamicDispatchTask.fixedSchedule works', async () => {
  const { scheduler, observer, keyringPair } = await getContext();
  const extrinsicParams = await getFixedDynamicDispatchExtrinsicParams();
  const { schedule: { Fixed: { executionTimes } } } = extrinsicParams;

  const taskID = await scheduleDynamicDispatchTaskAndVerify(scheduler, observer, keyringPair, extrinsicParams);

  // Cancel task and verify
  await cancelTaskAndVerify(scheduler, observer, keyringPair, taskID, executionTimes[0]);
});

test('dynamicDispatchTask.recurringSchedule works', async () => {
  const { scheduler, observer, keyringPair } = await getContext();
  const extrinsicParams = await getRecurringDynamicDispatchExtrinsicParams();
  const { schedule: { Recurring: { nextExecutionTime } } } = extrinsicParams;

  const taskID = await scheduleDynamicDispatchTaskAndVerify(scheduler, observer, keyringPair, extrinsicParams);

  // Cancel task and verify
  await cancelTaskAndVerify(scheduler, observer, keyringPair, taskID, nextExecutionTime);
});
