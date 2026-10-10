import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import ExcelJS from "exceljs";

import { excelScheduleService } from "../src/services/excel-schedule.service.js";

describe("ExcelScheduleService", () => {
  // Verifica que las competencias se transformen en filas con los datos de exportación.
  it("genera filas para exportación a excel", () => {
    const result = excelScheduleService.buildExcelRows({
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
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].competencyCode, "220501092");
  });

  // Comprueba que no se generen filas cuando el cronograma no contiene competencias.
  it("genera una exportación vacía cuando no existen competencias", () => {
    const result = excelScheduleService.buildExcelRows({});

    assert.deepEqual(result, []);
  });

  // Valida las filas de resumen creadas a partir de los totales del cronograma.
  it("genera filas de resumen para excel", () => {
    const result = excelScheduleService.buildExcelSummaryRows({
      totalCompetencies: 5,
      totalLearningActivities: 10,
      totalEvidences: 8,
      totalWeeks: 16,
    });

    assert.equal(result.length, 4);
    assert.equal(result[0].value, 5);
  });

  // Comprueba que los indicadores ausentes del resumen tengan valor cero.
  it("genera resumen con valores por defecto", () => {
    const result = excelScheduleService.buildExcelSummaryRows({});
    assert.equal(result[0].value, 0);
    assert.equal(result[1].value, 0);
    assert.equal(result[2].value, 0);
    assert.equal(result[3].value, 0);
  });

  // Verifica que el modelo reúna las hojas de competencias, resumen y cronograma.
  it("construye un modelo de workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({
      competencies: [
        {
          competencyCode: "220501092",
        },
      ],

      totalCompetencies: 1,
      phases: [
        {
          phase: "ANÁLISIS",
          phaseStartDate: "2026-01-05",
          phaseEndDate: "2026-02-01",
          phaseDurationWeeks: 4,
          phaseType: "TECHNICAL",
        },
      ],
    });

    assert.ok(result.sheets);
    assert.equal(result.sheets.length, 3);
    assert.equal(result.sheets[0].name, "Competencias");
    assert.equal(result.sheets[1].name, "Resumen");
    assert.equal(result.sheets[2].name, "Cronograma");
    assert.equal(result.sheets[0].rows.length, 1);
    assert.equal(result.sheets[2].rows[0].phase, "ANÁLISIS");
  });

  // Comprueba la estructura y las filas de las hojas para un cronograma vacío.
  it("construye un workbook vacío", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.equal(result.sheets.length, 3);
    assert.deepEqual(result.sheets[0].rows, []);
    assert.equal(result.sheets[1].rows.length, 4);
    assert.deepEqual(result.sheets[2].rows, []);
  });

  // Valida el nombre y la fecha de generación incluidos en el modelo.
  it("incluye metadatos del workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.equal(result.workbookName, "Cronograma Académico");
    assert.ok(result.generatedAt);
  });

  // Comprueba que las hojas y sus filas se conserven junto a los metadatos.
  it("mantiene las hojas del workbook junto a los metadatos", () => {
    const result = excelScheduleService.buildWorkbookModel({
      competencies: [
        {
          competencyCode: "220501092",
        },
      ],
    });

    assert.equal(result.sheets[0].rows.length, 1);
    assert.equal(result.sheets[1].rows.length, 4);

  });

  // Valida que el constructor de hojas devuelva las tres hojas con sus nombres.
  it("construye hojas nombradas para el workbook", () => {
    const result = excelScheduleService.buildWorkbookSheets({
      competencies: [
        {
          competencyCode: "220501092",
        },
      ],

      totalCompetencies: 1,
    });

    assert.equal(result.length, 3);
    assert.equal(result[0].name, "Competencias");
    assert.equal(result[1].name, "Resumen");
    assert.equal(result[2].name, "Cronograma");
  });

  // Comprueba que el modelo incluya la colección de hojas generada.
  it("incluye las hojas nombradas en el workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.ok(result.sheets);
    assert.equal(result.sheets.length, 3);
  });

  // Valida los encabezados definidos para la hoja de competencias.
  it("genera columnas para la hoja de competencias", () => {
    const result = excelScheduleService.buildCompetenciesColumns();

    assert.equal(result.length, 6);
    assert.equal(result[0], "Código");
  });

  // Valida los encabezados definidos para la hoja de resumen.
  it("genera columnas para la hoja de resumen", () => {
    const result = excelScheduleService.buildSummaryColumns();

    assert.equal(result.length, 2);
    assert.equal(result[0], "Indicador");
  });

  // Comprueba que las hojas del modelo incluyan sus columnas.
  it("incluye columnas en las hojas del workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.ok(result.sheets[0].columns);
    assert.ok(result.sheets[1].columns);
  });

  // Valida los encabezados definidos para la hoja de cronograma.
  it("genera columnas para la hoja de cronograma", () => {
    const result = excelScheduleService.buildScheduleColumns();

    assert.equal(result.length, 5);
    assert.equal(result[0], "Fase");
  });

  // Verifica que las fases del cronograma se conviertan en filas de exportación.
  it("genera filas para la hoja de cronograma", () => {
    const result = excelScheduleService.buildScheduleRows({
      phases: [
        {
          phase: "ANÁLISIS",
          phaseDurationWeeks: 4,
          phaseType: "TECHNICAL",
        },
      ],
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].phase, "ANÁLISIS");
  });

  // Comprueba que el modelo incluya la hoja de cronograma en la posición esperada.
  it("incluye la hoja de cronograma en el workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.equal(result.sheets.length, 3);
    assert.equal(result.sheets[2].name, "Cronograma");
  });

  // Valida que el modelo genere un nombre de archivo con extensión XLSX.
  it("genera un nombre de archivo para exportación", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.ok(result.fileName);
    assert.equal(result.fileName.endsWith(".xlsx"), true,
    );
  });

  // Comprueba que el nombre del archivo se agregue sin perder los metadatos.
  it("mantiene los metadatos junto al nombre de archivo", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.equal(result.workbookName, "Cronograma Académico");
    assert.ok(result.generatedAt);
    assert.ok(result.fileName);
  });

  it("calcula estadísticas del workbook", () => {
    const result = excelScheduleService.buildWorkbookModel({
      competencies: [
        {
          competencyCode: "220501092",
        },
      ],

      phases: [
        {
          phase: "ANÁLISIS",
        },
      ],
      totalCompetencies: 1,
    });

    assert.equal(result.totalSheets, 3);
    assert.ok(result.totalRows > 0);
    assert.ok(result.totalColumns > 0);
  });

  it("calcula estadísticas de un workbook vacío", () => {
    const result = excelScheduleService.buildWorkbookModel({});

    assert.equal(result.totalSheets, 3);
    assert.equal(result.totalRows, 4);
    assert.equal(result.totalColumns, 13);
  });

  // Devuelve el nombre y las hojas con la estructura esperada por una librería Excel.
  it("construye una definición de workbook compatible con Excel", () => {
    const result = excelScheduleService.buildWorkbookDefinition({});

    assert.deepEqual(Object.keys(result), ["workbookName", "sheets"]);
    assert.equal(result.workbookName, "Cronograma Académico");
    assert.equal(result.sheets.length, 3);
    assert.deepEqual(Object.keys(result.sheets[0]), ["name", "columns", "rows"]);
  });

  // Conserva las columnas y filas generadas por el modelo para cada hoja.
  it("conserva los datos de las hojas en la definición del workbook", () => {
    const result = excelScheduleService.buildWorkbookDefinition({
      competencies: [{ competencyCode: "220501092" }],
      phases: [{ phase: "ANÁLISIS", phaseDurationWeeks: 4 }],
    });

    assert.equal(result.sheets[0].rows[0].competencyCode, "220501092");
    assert.equal(result.sheets[1].rows.length, 4);
    assert.equal(result.sheets[2].rows[0].phase, "ANÁLISIS");
    assert.deepEqual(result.sheets[0].columns, ["Código", "Competencia", "Tipo", "Semanas", "AA", "Evidencias"]);
  });

  it("genera metadatos de exportación", () => {
    const result = excelScheduleService.buildExportMetadata({
      workbookName: "Cronograma Académico",

      sheets: [{}, {}, {}],
    });

    assert.equal(result.workbookName, "Cronograma Académico");
    assert.equal(result.totalSheets, 3);
    assert.ok(result.exportedAt);
  });

  it("genera metadatos para una definición vacía", () => {
    const result = excelScheduleService.buildExportMetadata({
      workbookName: "Cronograma Académico",
      sheets: [],
    });

    assert.equal(result.totalSheets, 0);
  });

  it("construye un paquete completo de exportación", () => {
    const result = excelScheduleService.buildExcelExportPackage({});

    assert.ok(result.metadata);
    assert.ok(result.workbookDefinition);
  });

  it("mantiene sincronizados los metadatos con el workbook", () => {
    const result = excelScheduleService.buildExcelExportPackage({});

    assert.equal(
      result.metadata.totalSheets,
      result.workbookDefinition.sheets.length,
    );
  });

  it("genera una representación json del paquete de exportación", () => {
    const result = excelScheduleService.buildExcelExportJson({});

    assert.equal(typeof result, "string");
  });

  it("incluye el workbook en la representación json", () => {
    const result = excelScheduleService.buildExcelExportJson({});

    assert.equal(result.includes("Cronograma Académico"), true);
  });

  it("genera un nombre de archivo de exportación", () => {
    const result = excelScheduleService.buildExcelExportFileName(
      "Cronograma Académico",
      new Date(2026, 1, 1),
    );

    assert.equal(result, "cronograma-académico-2026-02-01.xlsx");
  });

  it("mantiene la extensión xlsx", () => {
    const result = excelScheduleService.buildExcelExportFileName(
      "Cronograma Académico",
    );

    assert.equal(result.endsWith(".xlsx"), true);
  });

  it("construye un payload de exportación", () => {
    const result = excelScheduleService.buildExcelExportPayload({});

    assert.ok(result.fileName);
    assert.ok(result.content);
    assert.equal(
      result.contentType,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  it("mantiene la extensión xlsx en el payload", () => {
    const result = excelScheduleService.buildExcelExportPayload({});

    assert.equal(result.fileName.endsWith(".xlsx"), true);
  });

  it("construye una respuesta de exportación", () => {
    const result = excelScheduleService.buildExcelExportResponse({});

    assert.equal(result.success, true);
    assert.ok(result.payload);
  });

  it("calcula la longitud del contenido exportado", () => {
    const result = excelScheduleService.buildExcelExportResponse({});

    assert.ok(result.contentLength > 0);
  });

  it("valida una definición de workbook correcta", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    assert.equal(
      excelScheduleService.validateWorkbookDefinition(workbookDefinition), true);
  });

  it("rechaza una definición de workbook inválida", () => {
    const result = excelScheduleService.validateWorkbookDefinition({});

    assert.equal(result, false);
  });

  it("indica que un cronograma está listo para exportarse", () => {
    const result = excelScheduleService.isReadyForExcelExport({});

    assert.equal(result, true);
  });

  it("detecta una definición inválida para exportación", () => {
    const result = excelScheduleService.validateWorkbookDefinition(null);

    assert.equal(result, false);
  });

  it("construye un workbook físico a partir de la definición", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const result =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    assert.equal(result.workbookName, "Cronograma Académico");
    assert.equal(result.sheetCount, 3);
  });

  it("genera un workbook real de ExcelJS a partir de la definición", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({
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
    });

    const result =
      excelScheduleService.generateExcelWorkbook(workbookDefinition);

    assert.ok(result instanceof ExcelJS.Workbook);
    assert.equal(result.title, "Cronograma Académico");
    assert.deepEqual(
      result.worksheets.map((worksheet) => worksheet.name),
      ["Competencias", "Resumen", "Cronograma"],
    );
    assert.equal(result.worksheets[0].getCell("A1").value, "Código");
    assert.equal(result.worksheets[0].getCell("A2").value, "220501092");
  });

  it("genera un buffer Excel válido a partir de un workbook", async () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});
    const workbook =
      excelScheduleService.generateExcelWorkbook(workbookDefinition);

    const result = await excelScheduleService.generateExcelBuffer(workbook);

    assert.equal(Buffer.isBuffer(result), true);
    assert.ok(result.length > 0);
  });

  it("mantiene las hojas dentro del workbook físico", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const result =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    assert.equal(result.sheets.length, 3);
  });

  it("construye el contenido de un workbook físico", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const physicalWorkbook =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    const result = excelScheduleService.buildWorkbookContent(physicalWorkbook);

    assert.equal(typeof result.content, "string");
  });

  it("incluye el nombre del workbook dentro del contenido", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const physicalWorkbook =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    const result = excelScheduleService.buildWorkbookContent(physicalWorkbook);

    assert.equal(result.content.includes("Cronograma Académico"), true);
  });

  it("genera un buffer a partir del contenido del workbook", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const physicalWorkbook =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    const workbookContent =
      excelScheduleService.buildWorkbookContent(physicalWorkbook);

    const result = excelScheduleService.buildWorkbookBuffer(workbookContent);

    assert.equal(Buffer.isBuffer(result), true);
  });

  it("genera un buffer con contenido", () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});

    const physicalWorkbook =
      excelScheduleService.buildPhysicalWorkbook(workbookDefinition);

    const workbookContent =
      excelScheduleService.buildWorkbookContent(physicalWorkbook);

    const result = excelScheduleService.buildWorkbookBuffer(workbookContent);

    assert.ok(result.length > 0);
  });

  it("construye un artefacto completo de exportación", () => {
    const result = excelScheduleService.buildExcelExportArtifact({});

    assert.ok(result.response);
    assert.ok(result.workbookBuffer);
  });

  it("incluye un buffer válido en el artefacto", () => {
    const result = excelScheduleService.buildExcelExportArtifact({});

    assert.equal(Buffer.isBuffer(result.workbookBuffer), true);
  });

  it("genera un archivo xlsx físico", async () => {
    const workbookDefinition = excelScheduleService.buildWorkbookDefinition({});
    const workbook =
      excelScheduleService.generateExcelWorkbook(workbookDefinition);
    const testFilePath = join(tmpdir(), `kronos-${randomUUID()}.xlsx`);

    try {
      await excelScheduleService.generateExcelFile(workbook, testFilePath);

      assert.equal(existsSync(testFilePath), true);
    } finally {
      rmSync(testFilePath, { force: true });
    }
  });
});
