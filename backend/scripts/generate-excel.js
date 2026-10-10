import { excelScheduleService } from "../src/services/excel-schedule.service.js";

const schedule = {
  competencies: [
    {
      competencyCode: "220501092",
      competencyName: "Analizar requisitos",
      competencyType: "TECHNICAL",
      totalWeeks: 4,
      totalLearningActivities: 2,
      totalEvidences: 3,
    },
  ],

  phases: [
    {
      phase: "ANÁLISIS",
      phaseType: "TECHNICAL",
      phaseDurationWeeks: 4,
    },
  ],

  totalCompetencies: 1,
  totalLearningActivities: 2,
  totalEvidences: 3,
  totalWeeks: 4,
};

const workbookDefinition =
  excelScheduleService.buildWorkbookDefinition(schedule);

const workbook = excelScheduleService.generateExcelWorkbook(workbookDefinition);

await excelScheduleService.generateExcelFile(
  workbook,
  "./generated/cronograma.xlsx",
);

console.log("Excel generado correctamente");