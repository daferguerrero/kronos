import assert from "node:assert/strict";

import { describe, it } from "node:test";

import { isHolidayPeriod } from "../src/utils/academic-calendar.js";

const localDate = (year, month, day) => new Date(year, month - 1, day);

describe("academic-calendar", () => {
  it("detecta fechas dentro del receso", () => {
    assert.equal(isHolidayPeriod(localDate(2026, 12, 15)), true);

    assert.equal(isHolidayPeriod(localDate(2026, 12, 20)), true);

    assert.equal(isHolidayPeriod(localDate(2027, 1, 1)), true);

    assert.equal(isHolidayPeriod(localDate(2027, 1, 31)), true);
  });

  it("detecta fechas fuera del receso", () => {
    assert.equal(isHolidayPeriod(localDate(2026, 12, 14)), false);

    assert.equal(isHolidayPeriod(localDate(2027, 2, 1)), false);
  });
});
