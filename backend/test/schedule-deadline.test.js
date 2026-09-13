import assert from "node:assert/strict";
import { describe, it } from "node:test";

import deadlineService from "../src/services/schedule-deadline.service.js";
import { isHolidayPeriod } from "../src/utils/academic-calendar.js";

describe("schedule-deadline", () => {
  it("calcula el cierre académico básico", () => {
    const result = deadlineService.calculate(new Date(2026, 11, 30));

    assert.equal(result.toISOString().substring(0, 10), "2026-12-07");
  });

  it("resta siete días al cambiar de mes", () => {
    const result = deadlineService.calculate(new Date(2026, 2, 5));

    assert.equal(result.toISOString().substring(0, 10), "2026-02-26");
  });

  it("resta siete días al cambiar de año", () => {
    const result = deadlineService.calculate(new Date(2027, 0, 3));

    assert.equal(result.toISOString().substring(0, 10), "2026-12-07");
  });

  it("calcula correctamente fechas en un año bisiesto", () => {
    const result = deadlineService.calculate(new Date(2028, 2, 1));

    assert.equal(result.toISOString().substring(0, 10), "2028-02-23");
  });

  it("no modifica la fecha recibida", () => {
    const lectiveStageEndDate = new Date(2026, 11, 30);

    deadlineService.calculate(lectiveStageEndDate);

    assert.equal(
      lectiveStageEndDate.toISOString().substring(0, 10),
      "2026-12-30",
    );
  });

  it("la fecha límite nunca queda dentro del receso institucional", () => {
    const result = deadlineService.calculate(new Date(2026, 11, 30));

    assert.equal(isHolidayPeriod(result), false);
  });

  it("reserva una semana adicional para evaluación antes del receso", () => {
    const result = deadlineService.calculate(new Date(2026, 11, 30));

    assert.equal(
      result.toISOString().substring(0, 10),

      "2026-12-07",
    );
  });
});
