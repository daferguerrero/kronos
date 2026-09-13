import assert from "node:assert/strict";
import { it, describe } from "node:test";

import academicScheduleService from "../src/services/academic-schedule.service.js";

const dateOnly = (date) => date.toISOString().substring(0, 10);

describe ("academicScheduleService", () => {
  it("calcula el rango para una AA sin atravesar receso", () => {
    const result = academicScheduleService.calculateRange(
      new Date(2026, 9, 1),
      4,
    );

    assert.equal(dateOnly(result.endDate), "2026-10-29");
  });

  it("omite el receso al calcular la fecha final", () => {
    const result = academicScheduleService.calculateRange(
      new Date(2026, 11, 10),
      4,
    );

    assert.equal(dateOnly(result.endDate), "2027-02-24");
  });

  it("no modifica la fecha inicial", () => {
    const startDate = new Date(2026, 11, 10);

    academicScheduleService.calculateRange(startDate, 4);

    assert.equal(dateOnly(startDate), "2026-12-10");
  });
})
