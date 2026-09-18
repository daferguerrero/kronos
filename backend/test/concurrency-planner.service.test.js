import assert from "node:assert/strict";
import { describe, it } from "node:test";

import concurrencyPlannerService from "../src/services/concurrency-planner.service.js";

describe("concurrency-planner", () => {
  it("calcula las semanas concurrentes", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 12,
      transversalWeeks: 4,
    });

    assert.equal(result.canRunConcurrently, true);
    assert.equal(result.concurrencyWeeks, 4);
  });

  it("detecta programas sin concurrencia", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 12,
      transversalWeeks: 0,
    });

    assert.equal(result.canRunConcurrently, false);
    assert.equal(result.concurrencyWeeks, 0);
  });

  it("calcula las semanas restantes de cada grupo", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 12,
      transversalWeeks: 4,
    });

    assert.equal(result.technicalRemainingWeeks, 8);
    assert.equal(result.transversalRemainingWeeks, 0);
  });

  it("maneja grupos de igual duración", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 6,
      transversalWeeks: 6,
    });

    assert.equal(result.concurrencyWeeks, 6);
    assert.equal(result.technicalRemainingWeeks, 0);
    assert.equal(result.transversalRemainingWeeks, 0);
  });

  it("define el modo concurrente", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 12,
      transversalWeeks: 4,
    });

    assert.equal(result.executionMode, "CONCURRENT");
  });

  it("define el modo secuencial", () => {
    const result = concurrencyPlannerService.buildConcurrencyPlan({
      technicalWeeks: 12,
      transversalWeeks: 0,
    });

    assert.equal(result.executionMode, "SEQUENTIAL");
  });
})

describe("construcción de fases de ejecución", () => {
  it("genera fases concurrentes y técnicas", () => {
    const result = concurrencyPlannerService.buildExecutionPhases({
      technicalWeeks: 12,
      transversalWeeks: 4,
    });

    assert.equal(result.length, 2);
    assert.equal(result[0].phase, "CONCURRENT");
    assert.equal(result[0].weeks, 4);
    assert.equal(result[1].phase, "TECHNICAL_ONLY");
    assert.equal(result[1].weeks, 8);
  });

  it("genera únicamente fase concurrente cuando la duración es igual", () => {
    const result = concurrencyPlannerService.buildExecutionPhases({
      technicalWeeks: 6,
      transversalWeeks: 6,
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].phase, "CONCURRENT");
    assert.equal(result[0].weeks, 6);
  });

  it("genera únicamente fase técnica cuando no existe concurrencia", () => {
    const result = concurrencyPlannerService.buildExecutionPhases({
      technicalWeeks: 8,
      transversalWeeks: 0,
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].phase, "TECHNICAL_ONLY");
    assert.equal(result[0].weeks, 8);
  });
});

describe("Asignación de fechas a cada fase", () => {
  it("asigna fechas a las fases de ejecución", () => {
    const phases = [
      {
        phase: "CONCURRENT",
        weeks: 4,
      },

      {
        phase: "TECHNICAL_ONLY",
        weeks: 8,
      },
    ];

    const result = concurrencyPlannerService.scheduleExecutionPhases(
      phases,
      new Date(2026, 1, 2),
    );

    assert.equal(result.length, 2);
    assert.ok(result[0].startDate);
    assert.ok(result[0].endDate);
  });

  it("encadena fases sin solapamientos", () => {
    const phases = [
      {
        phase: "CONCURRENT",
        weeks: 4,
      },

      {
        phase: "TECHNICAL_ONLY",
        weeks: 8,
      },
    ];

    const result = concurrencyPlannerService.scheduleExecutionPhases(
      phases,
      new Date(2026, 1, 2),
    );

    const expectedStart = new Date(result[0].endDate);

    expectedStart.setDate(expectedStart.getDate() + 1);

    assert.equal(
      result[1].startDate.toISOString().substring(0, 10),
      expectedStart.toISOString().substring(0, 10),
    );
  });
})

describe("construcción del plan de concurrencia con fases y fechas programadas", () => {
  it("construye un plan concurrente calendarizado", () => {
    const result = concurrencyPlannerService.buildScheduledConcurrencyPlan(
      {
        technicalWeeks: 12,
        transversalWeeks: 4,
      },

      new Date(2026, 1, 2),
    );

    assert.equal(result.executionMode, "CONCURRENT");
    assert.equal(result.phases.length, 2);
    assert.equal(result.phases[0].phase, "CONCURRENT");
    assert.ok(result.phases[0].startDate);
    assert.ok(result.phases[0].endDate);
  });

  it("mantiene la información del plan y las fases", () => {
    const result = concurrencyPlannerService.buildScheduledConcurrencyPlan(
      {
        technicalWeeks: 6,
        transversalWeeks: 6,
      },

      new Date(2026, 1, 2),
    );

    assert.equal(result.concurrencyWeeks, 6);
    assert.equal(result.phases.length, 1);
  });

  it("calcula métricas globales del plan concurrente", () => {
    const result = concurrencyPlannerService.buildScheduledConcurrencyPlan(
      {
        technicalWeeks: 12,
        transversalWeeks: 4,
      },
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalWeeks, 12);
  });

  it("calcula el inicio y fin del plan", () => {
    const result = concurrencyPlannerService.buildScheduledConcurrencyPlan(
      {
        technicalWeeks: 12,
        transversalWeeks: 4,
      },
      new Date(2026, 1, 2),
    );

    assert.ok(result.startPlanDate);
    assert.ok(result.endPlanDate);
  });
});

describe("asociación de competencias al plan de concurrencia", () => {
  it("asocia competencias al plan concurrente", () => {
    const plan = {
      executionMode: "CONCURRENT",
    };

    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
      },

      {
        competencyCode: "240201526",
        competencyType: "TRANSVERSAL",
      },
    ];

    const result = concurrencyPlannerService.attachCompetenciesToPlan(
      plan,
      competencies,
    );

    assert.equal(result.technicalCompetencies.length, 1);
    assert.equal(result.transversalCompetencies.length, 1);
  });

  it("mantiene la información original del plan", () => {
    const plan = {
      executionMode: "CONCURRENT",
    };

    const result = concurrencyPlannerService.attachCompetenciesToPlan(plan, []);

    assert.equal(result.executionMode, "CONCURRENT");
  });
})

describe("construcción del resumen del plan de concurrencia", () => {
  it("genera un resumen del plan concurrente", () => {
    const plan = {
      executionMode: "CONCURRENT",
      phases: [{}, {}],
      technicalCompetencies: [{}, {}],
      transversalCompetencies: [{}],
      startPlanDate: new Date(2026, 1, 2),
      endPlanDate: new Date(2026, 4, 30),
    };

    const result = concurrencyPlannerService.buildConcurrencySummary(plan);

    assert.equal(result.totalPhases, 2);
    assert.equal(result.totalTechnicalCompetencies, 2);
    assert.equal(result.totalTransversalCompetencies, 1);
  });

  it("mantiene las fechas del plan", () => {
    const plan = {
      executionMode: "CONCURRENT",
      phases: [{}],
      technicalCompetencies: [{}],
      transversalCompetencies: [{}],
      startPlanDate: new Date(2026, 1, 2),
      endPlanDate: new Date(2026, 4, 30),
    };

    const result = concurrencyPlannerService.buildConcurrencySummary(plan);

    assert.ok(result.startPlanDate);
    assert.ok(result.endPlanDate);
    assert.equal(
      result.startPlanDate.toISOString().substring(0, 10),
      "2026-02-02",
    );

    assert.equal(
      result.endPlanDate.toISOString().substring(0, 10),
      "2026-05-30",
    );
  });
})

describe("creación del cronograma concurrente completo", () => {
  it("construye un cronograma concurrente completo", () => {
    const result = concurrencyPlannerService.createConcurrentSchedule(
      {
        technicalWeeks: 12,
        transversalWeeks: 4,
        competencies: [
          {
            competencyCode: "220501092",
            competencyType: "TECHNICAL",
          },

          {
            competencyCode: "240201526",
            competencyType: "TRANSVERSAL",
          },
        ],
      },

      new Date(2026, 1, 2),
    );

    assert.equal(result.executionMode, "CONCURRENT");
    assert.equal(result.summary.totalTechnicalCompetencies, 1,
    );

    assert.equal(result.summary.totalTransversalCompetencies, 1,
    );
  });

  it("incluye fases calendarizadas en el cronograma", () => {
    const result = concurrencyPlannerService.createConcurrentSchedule(
      {
        technicalWeeks: 12,
        transversalWeeks: 4,
        competencies: [],
      },

      new Date(2026, 1, 2),
    );

    assert.ok(result.phases.length > 0);
    assert.ok(result.phases[0].startDate);
    assert.ok(result.phases[0].endDate);
  });
})