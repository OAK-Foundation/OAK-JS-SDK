import _ from 'lodash';
import { getContext, scheduleDynamicDispatchTaskAndVerify, cancelTaskAndVerify, getDynamicDispatchExtrinsicParams, SECTION_NAME, sendExtrinsic } from './helpFn';

beforeEach(() => { jest.setTimeout(540000); });

/**
 * Test fixed dynamic dispatch task
 */
test('dynamicDispatchTask.fixedSchedule works', async () => {
  const { scheduler, observer, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('fixed');
  const { schedule: { fixed: { executionTimes } } } = extrinsicParams;

  const taskID = await scheduleDynamicDispatchTaskAndVerify(scheduler, observer, keyringPair, extrinsicParams);

  // Cancel task and verify
  await cancelTaskAndVerify(scheduler, observer, keyringPair, taskID, executionTimes[0]);
});

/**
 * Test recurring dynamic dispatch task
 */
test('dynamicDispatchTask.recurringSchedule works', async () => {
  const { scheduler, observer, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('recurring');
  const { schedule: { recurring: { nextExecutionTime } } } = extrinsicParams;

  const taskID = await scheduleDynamicDispatchTaskAndVerify(scheduler, observer, keyringPair, extrinsicParams);

  // Cancel task and verify
  await cancelTaskAndVerify(scheduler, observer, keyringPair, taskID, nextExecutionTime);
});

/**
 * scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency
 */
 test('scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency', async () => {
  const { scheduler, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('recurring');
  const { providedID, schedule, call } = extrinsicParams;
  schedule.recurring.frequency -= 1;

  // scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency
  const extrinsicHex = await scheduler.buildScheduleDynamicDispatchTask(keyringPair, providedID, schedule, call);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${SECTION_NAME}.InvalidTime`);
});


/**
 * scheduler.buildScheduleDynamicDispatchTask will fail with invalid executionTimes
 */
 test('scheduler.buildScheduleDynamicDispatchTask will fail with invalid executionTimes', async () => {
  const { scheduler, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('fixed');
  const { providedID, schedule, call } = extrinsicParams;
  schedule.fixed.executionTimes[0] -= 1;

  // scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency
  const extrinsicHex = await scheduler.buildScheduleDynamicDispatchTask(keyringPair, providedID, schedule, call);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${SECTION_NAME}.InvalidTime`);
});


/**
 * scheduler.buildScheduleDynamicDispatchTask will fail with invalid nextExecutionTime
 */
 test('scheduler.buildScheduleDynamicDispatchTask will fail with invalid timestamps', async () => {
  const { scheduler, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('recurring');
  const { providedID, schedule, call } = extrinsicParams;
  schedule.recurring.nextExecutionTime -= 1;

  // scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency
  const extrinsicHex = await scheduler.buildScheduleDynamicDispatchTask(keyringPair, providedID, schedule, call);
  await expect(sendExtrinsic(scheduler, extrinsicHex)).rejects.toThrow(`${SECTION_NAME}.InvalidTime`);
});

/**
 * scheduler.buildScheduleDynamicDispatchTask will fail with invalid call
 */
 test('scheduler.buildScheduleDynamicDispatchTask will fail with invalid call', async () => {
  const { scheduler, keyringPair } = await getContext();
  const extrinsicParams = await getDynamicDispatchExtrinsicParams('recurring');
  const { providedID, schedule } = extrinsicParams;

  // scheduler.buildScheduleDynamicDispatchTask will fail with invalid frequency
  await expect(scheduler.buildScheduleDynamicDispatchTask(keyringPair, providedID, schedule, null)).rejects.toThrowError();
});
