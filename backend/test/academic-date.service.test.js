import assert from "node:assert/strict";
import { describe, it } from "node:test";

import academicDateService from "../src/services/academic-date.service.js";

const dateOnly = (date) => date.toISOString().substring(0, 10);

describe("academic-date", () => {
  it("mantiene fechas fuera del receso", () => {
    const result = academicDateService.moveToNextAcademicDate(
      new Date(2026, 10, 20),
    );

    assert.equal(dateOnly(result), "2026-11-20");
  });

  it("ajusta una fecha que cae en diciembre", () => {
    const result = academicDateService.moveToNextAcademicDate(
      new Date(2026, 11, 20),
    );

    assert.equal(dateOnly(result), "2027-02-01");
  });

  it("ajusta una fecha que cae en enero", () => {
    const result = academicDateService.moveToNextAcademicDate(
      new Date(2027, 0, 15),
    );

    assert.equal(dateOnly(result), "2027-02-01");
  });

  it("no modifica la fecha original", () => {
    const original = new Date(2026, 11, 20);

    academicDateService.moveToNextAcademicDate(original);

    assert.equal(dateOnly(original), "2026-12-20");
  });

  it("suma días académicos fuera del receso", () => {
    const result = academicDateService.addAcademicDays(
      new Date(2026, 10, 1),
      10,
    );

    assert.equal(dateOnly(result), "2026-11-11");
  });

  it("omite el receso institucional al sumar días", () => {
    const result = academicDateService.addAcademicDays(
      new Date(2026, 11, 10),
      10,
    );

    assert.equal(dateOnly(result), "2027-02-06");
  });

  it("no modifica la fecha inicial", () => {
    const startDate = new Date(2026, 11, 10);

    academicDateService.addAcademicDays(startDate, 10);

    assert.equal(dateOnly(startDate), "2026-12-10");
  });
})