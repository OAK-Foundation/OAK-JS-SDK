"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recurrer = void 0;
const _ = require("lodash");
const constants_1 = require("./constants");
// For producing recurring timestamps
class Recurrer {
    /**
     * This function finds up to 24 daily recurring timestamps.
     * Input any timestamp in milliseconds along with desired hour of day.
     * Function will find next available hourly timestamp based on hour of day and
     * output up to 24 daily recurring timestamps in milliseconds
     * If startTimestamp is not on the hour, the first timestamp of the output will be rounded
     * to the day with the inputted hour of day
     * @param startTimestamp
     * @param numberRecurring
     * @param hourOfDay
     * @returns daily recurring timestamps
     */
    getDailyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay) {
        const startDate = new Date(startTimestamp);
        const startHour = startDate.getUTCHours();
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const startDay = startHour <= hourOfDay ? startDate.getUTCDate() : startDate.getUTCDate() + constants_1.ADDITIONAL_UNIT;
        const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
        const milliSecondsInDay = constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * milliSecondsInDay;
        });
    }
    /**
     * This function finds up to 24 hourly recurring timestamps.
     * Input starting timestamp in milliseconds.
     * Output up to 24 hourly recurring timestamps in milliseconds.
     * If startTimestamp is not on the hour, the first timestamp of the output will be rounded
     * to the next hour.
     * @param startTimestamp
     * @param numberRecurring
     * @returns hourly recurring timestamps
     */
    getHourlyRecurringTimestamps(startTimestamp, numberRecurring) {
        const secondsInHour = constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const firstEventTimestamp = startTimestamp - (startTimestamp % secondsInHour) + secondsInHour;
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * secondsInHour;
        });
    }
    findWeekdayStartDate(startWeekday, dayOfWeek, canStartSameDay) {
        const isSameDayOfWeek = startWeekday - dayOfWeek === constants_1.NO_DIFF;
        if (isSameDayOfWeek) {
            if (canStartSameDay) {
                return constants_1.NO_DIFF;
            }
            else {
                return constants_1.DAYS_IN_WEEK;
            }
        }
        else if (startWeekday > dayOfWeek) {
            return constants_1.DAYS_IN_WEEK - (startWeekday - dayOfWeek);
        }
        else {
            return dayOfWeek - startWeekday;
        }
    }
    /**
     * Input starting timestamp in milliseconds along with desired day of week and hour of day.
     * Output up to 24 weekly recurring timestamps in milliseconds.
     * If startTimestamp is not on the correct day of week, the function will find the next
     * available day where it is the correct day of week.
     * @param startTimestamp
     * @param numberRecurring
     * @param hourOfDay
     * @param dayOfWeek
     * @returns weekly recurring timestamps
     */
    getWeeklyRecurringTimestamps(startTimestamp, numberRecurring, hourOfDay, dayOfWeek) {
        const secondsInWeek = constants_1.DAYS_IN_WEEK * constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const startDate = new Date(startTimestamp);
        const startHour = startDate.getUTCHours();
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth();
        const startWeekday = startDate.getUTCDay();
        const startDay = startDate.getUTCDate() + this.findWeekdayStartDate(startWeekday, dayOfWeek, startHour < hourOfDay);
        const firstEventTimestamp = Date.UTC(startYear, startMonth, startDay, hourOfDay);
        return _.times(numberRecurring, (index) => {
            return firstEventTimestamp + index * secondsInWeek;
        });
    }
    /**
     * Input starting timestamp in milliseconds along with desired date of month and hour of day.
     * Output up to 6 monthly recurring timestamps in milliseconds.
     * If startTimestamp does not fit the hourOfDay or dateOfMonth requirements,
     * the first timestamp of the output will be rounded to the next hour with a valid hour of day on a valid date of the month.
     * @param startTimestamp
     * @param numberRecurring
     * @param hourOfDay
     * @param dateOfMonth
     * @returns monthly recurring timestamps
     */
    getMonthlyRecurringTimestampsByDate(startTimestamp, numberRecurring, hourOfDay, dateOfMonth) {
        const startDate = new Date(startTimestamp);
        const startYear = startDate.getUTCFullYear();
        const startDay = startDate.getUTCDate();
        const startMonth = startDay <= dateOfMonth ? startDate.getUTCMonth() : startDate.getUTCMonth() + constants_1.ADDITIONAL_UNIT;
        return _.times(numberRecurring, (index) => {
            return Date.UTC(startYear, startMonth + index, dateOfMonth, hourOfDay);
        });
    }
    findDayOfWeekInMonthForStartDate(startYear, startMonth, dayOfWeek, weekOfMonth) {
        const secondsInWeek = constants_1.DAYS_IN_WEEK * constants_1.HOUR_IN_DAY * constants_1.MIN_IN_HOUR * constants_1.SEC_IN_MIN * constants_1.MS_IN_SEC;
        const firstDayOfMonth = new Date(Date.UTC(startYear, startMonth));
        const firstDayOfMonthWeekday = firstDayOfMonth.getUTCDay();
        const dateOfFirstDayOfWeekInMonth = this.findWeekdayStartDate(firstDayOfMonthWeekday, dayOfWeek, false) + constants_1.ADDITIONAL_UNIT;
        const dateOfMonthTimestamp = Date.UTC(startYear, startMonth, dateOfFirstDayOfWeekInMonth) + secondsInWeek * (weekOfMonth - constants_1.ADDITIONAL_UNIT);
        return new Date(dateOfMonthTimestamp).getUTCDate();
    }
    /**
     * Input starting timestamp in milliseconds along with desired week of month, day of week and hour of day.
     * Output up to 6 monthly recurring timestamps in milliseconds.
     * If startTimestamp does not fit the hourOfDay, dayOfweek and weekOfMonth requirements,
     * the first timestamp of the output will be rounded to the next hour
     * with a valid hour of a valid day of week on a valid week of the month.
     * @param startTimestamp
     * @param numberRecurring
     * @param hourOfDay
     * @param dayOfWeek
     * @param weekOfMonth
     * @returns monthly recurring timestamps
     */
    getMonthlyRecurringTimestampsByWeekday(startTimestamp, numberRecurring, hourOfDay, dayOfWeek, weekOfMonth) {
        if (weekOfMonth > 4) {
            throw new Error('Can only schedule monthly recurring tasks based on week for the first 4 weeks of a month');
        }
        const inputDate = new Date(startTimestamp);
        const inputYear = inputDate.getUTCFullYear();
        const inputMonth = inputDate.getUTCMonth();
        const inputDay = this.findDayOfWeekInMonthForStartDate(inputYear, inputMonth, dayOfWeek, weekOfMonth);
        const inputMonthEventTimestamp = Date.UTC(inputYear, inputMonth, inputDay, hourOfDay);
        const firstEventMonth = inputMonthEventTimestamp >= startTimestamp ? inputMonth : inputMonth + constants_1.ADDITIONAL_UNIT;
        return _.times(numberRecurring, (index) => {
            const newMonth = firstEventMonth + index;
            const newDate = this.findDayOfWeekInMonthForStartDate(inputYear, newMonth, dayOfWeek, weekOfMonth);
            return Date.UTC(inputYear, newMonth, newDate, hourOfDay);
        });
    }
}
exports.Recurrer = Recurrer;
//# sourceMappingURL=recurrer.js.map