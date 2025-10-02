import {getNextRadioShowDate} from "./get-next-radio-show-date.ts";
import {describe, expect, test} from "vitest";

describe(getNextRadioShowDate, () => {
    const expectedDates = [
        "2025-01-25", // Jan
        "2025-02-22", // Feb
        "2025-03-22", // Mar
        "2025-04-26", // Apr
        "2025-05-24", // May
        "2025-06-28", // Jun
        "2025-07-26", // Jul
        "2025-08-23", // Aug
        "2025-09-27", // Sep
        "2025-10-25", // Oct
        "2025-11-22", // Nov
        "2025-12-27", // Dec
    ];

    expectedDates.forEach((expected, month) => {
        test(`should return ${expected} for 1st of month ${month + 1}`, () => {
            const input = new Date(2025, month, 1);
            const result = getNextRadioShowDate(input.getTime());
            const isoDate = result.toISOString().slice(0, 10);

            expect(isoDate).toBe(expected);
        });
    });
});