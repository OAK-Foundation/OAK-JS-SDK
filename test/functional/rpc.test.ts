import _ from 'lodash';

import { OakChains, AutomationAction } from '../../src/constants'
import { Scheduler } from '../../src/scheduler';
import { COLLATOR_ADDRESS } from './helpFn';

beforeEach(() => {
  jest.setTimeout(540000);
});

test('scheduler.getTimeAutomationFees works', async () => {
  const scheduler = new Scheduler(OakChains.STUR);
  const fee = await scheduler.getTimeAutomationFees(AutomationAction.Notify, 3);
  expect(fee > 0).toEqual(true);
});

test('scheduler.calculateOptimalAutostaking works', async () => {
  const scheduler = new Scheduler(OakChains.STUR);
  const result = await scheduler.calculateOptimalAutostaking(10000000000, COLLATOR_ADDRESS);
  expect(Object.keys(result).sort()).toEqual(["apy", "period"].sort());
});

test('scheduler.getAutoCompoundDelegatedStakeTaskIds works', async () => {
  const scheduler = new Scheduler(OakChains.STUR);
  const result = await scheduler.getAutoCompoundDelegatedStakeTaskIds("68vqVx27xVYeCkqJTQnyXrcMCaKADUa7Rywn9TSrUZyp4NGP");
  expect(_.isArray(result)).toEqual(true);
});
