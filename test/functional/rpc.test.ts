import _ from 'lodash';

import { OakChains, AutomationAction } from '../../src/constants'
import { Scheduler } from '../../src/scheduler';

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
	const result = await scheduler.calculateOptimalAutostaking(10000000000, "691Fmzb8rhYmBxLvaqYEUApK22s3o6eCzC4whDY7dZZ83YYQ");
	expect(_.isNil(result)).toEqual(false);
});

test('scheduler.getAutoCompoundDelegatedStakeTaskIds works', async () => {
  const scheduler = new Scheduler(OakChains.STUR);
	const result = await scheduler.getAutoCompoundDelegatedStakeTaskIds("68vqVx27xVYeCkqJTQnyXrcMCaKADUa7Rywn9TSrUZyp4NGP");
  expect(_.isArray(result)).toEqual(true);
});
