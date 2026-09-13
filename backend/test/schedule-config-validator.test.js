import assert from "node:assert/strict";
import { describe, it } from "node:test";
import validator from "../src/services/schedule-config-validator.service.js";

describe("schedule-config-validator", () => {
  it("acepta una configuración válida", () => {
    const config = {
      ficha: "123456",
      startProgramDate: "2026-01-05",
      startTrainingDate: "2026-01-12",
      endProgramDate: "2026-06-30",
      weekStartDay: "MONDAY",
    };

    assert.deepEqual(validator.validate(config), []);
  });

  it("reporta los campos obligatorios ausentes", () => {
    const errors = validator.validate({});

    assert.deepEqual(errors, [
      "La ficha es obligatoria.",
      "La fecha de inicio del programa es obligatoria.",
      "La fecha de inicio de formación es obligatoria.",
      "La fecha final del programa es obligatoria.",
    ]);
  });

  it("rechaza un día de inicio de semana inválido", () => {
    const errors = validator.validate({
      ficha: "123456",
      startProgramDate: "2026-01-05",
      startTrainingDate: "2026-01-12",
      endProgramDate: "2026-06-30",
      weekStartDay: "Día inválido",
    });

    assert.deepEqual(errors, ["El día de inicio de semana no es válido."]);
  });

  it("rechaza una fecha de formación anterior al inicio del programa", () => {
    const errors = validator.validate({
      ficha: "123456",
      startProgramDate: "2026-02-01",
      startTrainingDate: "2026-01-31",
      endProgramDate: "2026-06-30",
    });

    assert.deepEqual(errors, [
      "La fecha de inicio de formación no puede ser anterior a la fecha de inicio del programa.",
    ]);
  });

  it("rechaza una fecha final igual al inicio del programa", () => {
    const errors = validator.validate({
      ficha: "123456",
      startProgramDate: "2026-02-01",
      startTrainingDate: "2026-02-01",
      endProgramDate: "2026-02-01",
    });

    assert.deepEqual(errors, [
      "La fecha final del programa debe ser posterior a la fecha de inicio del programa.",
    ]);
  });

  it("rechaza una fecha final anterior al inicio del programa", () => {
    const errors = validator.validate({
      ficha: "123456",
      startProgramDate: "2026-02-02",
      startTrainingDate: "2026-02-02",
      endProgramDate: "2026-02-01",
    });

    assert.deepEqual(errors, [
      "La fecha final del programa debe ser posterior a la fecha de inicio del programa.",
    ]);
  });
});
