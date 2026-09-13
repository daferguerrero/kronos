import assert from "node:assert/strict";
import { describe, it } from "node:test";

import academicStageService from "../src/services/academic-stage.service.js";

const dateOnly = (date) => date.toISOString().substring(0, 10);

describe("academic-stage", () => {
  it("calcula las fechas de las etapas académicas", () => {
    const result = academicStageService.calculate({
      endProgramDate: new Date(2026, 11, 30),
    });

    assert.equal(dateOnly(result.lectiveStageEndDate), "2026-06-30");
    assert.equal(dateOnly(result.productiveStageStartDate), "2026-07-01");
    assert.equal(dateOnly(result.productiveStageEndDate), "2026-12-30");
  });

  it("calcula la fecha límite a partir del fin de la etapa lectiva", () => {
    const result = academicStageService.calculate({
      endProgramDate: new Date(2026, 11, 30),
    });

    assert.equal(dateOnly(result.scheduleDeadline), "2026-06-23");
  });

  it("no modifica la fecha final recibida", () => {
    const endProgramDate = new Date(2026, 11, 30);

    academicStageService.calculate({ endProgramDate });

    assert.equal(dateOnly(endProgramDate), "2026-12-30");
  });

  it("calcula correctamente las etapas para el caso real ADSO", () => {
    const result = academicStageService.calculate({
      endProgramDate: new Date(2027, 5, 30),
    });

    assert.equal(dateOnly(result.lectiveStageEndDate), "2026-12-30");
    assert.equal(dateOnly(result.productiveStageStartDate), "2026-12-31");
    assert.equal(dateOnly(result.productiveStageEndDate), "2027-06-30");
  });

  it("ubica la fecha límite real del caso ADSO", () => {
    const result = academicStageService.calculate({
      endProgramDate: new Date(2027, 5, 30),
    });

    assert.equal(dateOnly(result.scheduleDeadline), "2026-12-07");
  });

  it("mantiene la fecha límite esperada con una fecha ISO del request", () => {
    const result = academicStageService.calculate({
      endProgramDate: "2027-06-30",
    });

    assert.equal(dateOnly(result.scheduleDeadline), "2026-12-07");
  });
});
