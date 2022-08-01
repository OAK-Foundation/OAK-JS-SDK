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
