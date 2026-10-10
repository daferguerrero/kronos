import ExcelJS from "exceljs";

// Convierte las competencias del cronograma en filas para la hoja de Excel.
const buildExcelRows = (schedule) => {
  const competencies = schedule?.competencies ?? [];

  return competencies.map((competency) => ({
    competencyCode: competency.competencyCode,
    competencyName: competency.competencyName,
    competencyType: competency.competencyType,
    totalWeeks: competency.totalWeeks,
    totalLearningActivities: competency.totalLearningActivities,
    totalEvidences: competency.totalEvidences,
  }));
};

// Prepara las filas con los indicadores y totales del resumen del cronograma.
const buildExcelSummaryRows = (schedule) => {
  return [
    {
      metric: "Total Competencias",
      value: schedule.totalCompetencies ?? 0,
    },

    {
      metric: "Total Actividades de Aprendizaje",
      value: schedule.totalLearningActivities ?? 0,
    },

    {
      metric: "Total Evidencias",
      value: schedule.totalEvidences ?? 0,
    },

    {
      metric: "Total Semanas",
      value: schedule.totalWeeks ?? 0,
    },
  ];
};

// Construye el modelo completo del workbook con metadatos, nombre y hojas.
const buildWorkbookModel = (schedule) => {
  const generatedAt = new Date();
  const fileName = `cronograma-academico-${generatedAt
    .toISOString()
    .substring(0, 10)}.xlsx`;

  const sheets = buildWorkbookSheets(schedule);

  const totalSheets = sheets.length;

  const totalRows = sheets.reduce(
    (total, sheet) => total + sheet.rows.length, 0);

  const totalColumns = sheets.reduce(
    (total, sheet) => total + sheet.columns.length, 0);

  return {
    workbookName: "Cronograma Académico",
    fileName,
    generatedAt,
    totalSheets,
    totalRows,
    totalColumns,
    sheets
  };
};

// Organiza las hojas de competencias, resumen y cronograma con columnas y filas.
const buildWorkbookSheets = (schedule) => {
  return [
    {
      name: "Competencias",
      columns: buildCompetenciesColumns(),
      rows: buildExcelRows(schedule),
    },

    {
      name: "Resumen",
      columns: buildSummaryColumns(),
      rows: buildExcelSummaryRows(schedule),
    },

    {
      name: "Cronograma",
      columns: buildScheduleColumns(),
      rows: buildScheduleRows(schedule),
    },
  ];

};

// Define los encabezados que se muestran en la hoja de competencias.
const buildCompetenciesColumns = () => {
  return ["Código", "Competencia", "Tipo", "Semanas", "AA", "Evidencias"];
};

// Define los encabezados que se muestran en la hoja de resumen.
const buildSummaryColumns = () => {
  return ["Indicador", "Valor"];
};

// Define los encabezados que se muestran en la hoja de cronograma.
const buildScheduleColumns = () => {
  return ["Fase", "Inicio", "Fin", "Duración", "Tipo"];
};

// Convierte las fases del cronograma en filas para la hoja de Excel.
const buildScheduleRows = (schedule) => {
  const phases = schedule.phases ?? [];

  return phases.map((phase) => ({
    phase: phase.phase,
    startDate: phase.phaseStartDate,
    endDate: phase.phaseEndDate,
    durationWeeks: phase.phaseDurationWeeks,
    phaseType: phase.phaseType,
  }));
};

// Reduce el modelo del workbook a la estructura necesaria para una librería Excel.
const buildWorkbookDefinition = (schedule) => {
  const { workbookName, sheets } = buildWorkbookModel(schedule);

  return {
    workbookName,
    sheets: sheets.map(({ name, columns, rows }) => ({
      name,
      columns,
      rows,
    })),
  };
};

// Genera metadatos de exportación a partir del modelo del workbook.
const buildExportMetadata = (workbookDefinition) => ({
  workbookName: workbookDefinition.workbookName,
  totalSheets: workbookDefinition.sheets.length,
  exportedAt: new Date(),
});

// Combina la definición del workbook y los metadatos en un paquete de exportación.
const buildExcelExportPackage = (schedule) => {
  const workbookDefinition = buildWorkbookDefinition(schedule);

  const metadata = buildExportMetadata(workbookDefinition);

  return {
    metadata,
    workbookDefinition,
  };
};

// Convierte el paquete de exportación a un JSON legible.
const buildExcelExportJson = (schedule) => {
  const exportPackage = buildExcelExportPackage(schedule);

  return JSON.stringify(exportPackage, null, 2);
};

// Genera un nombre de archivo para la exportación a Excel basado en el nombre del workbook y la fecha de exportación.
const buildExcelExportFileName = (workbookName, exportedAt = new Date()) => {
  const normalizedWorkbookName = workbookName
    .toLowerCase()
    .replaceAll(" ", "-");

  return `${normalizedWorkbookName}-${exportedAt
    .toISOString()
    .substring(0, 10)}.xlsx`;
};

// Prepara el payload completo para la exportación a Excel, incluyendo nombre de archivo, tipo de contenido y contenido en JSON.
const buildExcelExportPayload = (schedule) => {
  const exportPackage = buildExcelExportPackage(schedule);

  return {
    fileName: buildExcelExportFileName(exportPackage.metadata.workbookName),

    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    content: buildExcelExportJson(schedule),
  };
};

// Genera la respuesta final de la exportación a Excel, incluyendo éxito, nombre de archivo, tipo de contenido, longitud del contenido y el payload completo.
const buildExcelExportResponse = (schedule) => {
  const payload = buildExcelExportPayload(schedule);

  return {
    success: true,
    fileName: payload.fileName,
    contentType: payload.contentType,
    contentLength: payload.content.length,
    payload,
  };
};

// Valida que la definición del workbook tenga un nombre y al menos una hoja con columnas y filas.
const validateWorkbookDefinition = (workbookDefinition) => {
  if (!workbookDefinition) {
    return false;
  }

  if (!workbookDefinition.workbookName) {
    return false;
  }

  if (!Array.isArray(workbookDefinition.sheets)) {
    return false;
  }

  return workbookDefinition.sheets.every(
    (sheet) =>
      sheet.name && Array.isArray(sheet.columns) && Array.isArray(sheet.rows),
  );
};

const isReadyForExcelExport = (schedule) => {
  const workbookDefinition = buildWorkbookDefinition(schedule);

  return validateWorkbookDefinition(workbookDefinition);
};

// Construye un objeto físico del workbook a partir de la definición del mismo, incluyendo nombre, cantidad de hojas y las hojas mismas.
const buildPhysicalWorkbook = (workbookDefinition) => {
  return {
    workbookName: workbookDefinition.workbookName,
    sheetCount: workbookDefinition.sheets.length,
    sheets: workbookDefinition.sheets,
  };
};

// Convierte el objeto físico del workbook en un contenido JSON legible, incluyendo nombre, cantidad de hojas y el contenido completo del workbook.
const buildWorkbookContent = (physicalWorkbook) => {
  return {
    workbookName: physicalWorkbook.workbookName,
    sheetCount: physicalWorkbook.sheetCount,
    content: JSON.stringify(physicalWorkbook, null, 2),
  };
};

// Convierte el contenido del workbook en un buffer de bytes para su exportación a Excel.
const buildWorkbookBuffer = (workbookContent) => {
  return Buffer.from(workbookContent.content, "utf-8");
};

// Combina todos los pasos de construcción del workbook y la respuesta de exportación a Excel en un solo artefacto que incluye la respuesta y el buffer del workbook.
const buildExcelExportArtifact = (schedule) => {
  const response = buildExcelExportResponse(schedule);

  const workbookDefinition = buildWorkbookDefinition(schedule);

  const physicalWorkbook = buildPhysicalWorkbook(workbookDefinition);

  const workbookContent = buildWorkbookContent(physicalWorkbook);

  const workbookBuffer = buildWorkbookBuffer(workbookContent);

  return {
    response,
    workbookBuffer,
  };
};

// Construye un workbook de ExcelJS a partir de la definición del cronograma.
const generateExcelWorkbook = (workbookDefinition) => {
  const workbook = new ExcelJS.Workbook();

  workbook.title = workbookDefinition.workbookName;

  workbookDefinition.sheets.forEach((sheetDefinition) => {
    const worksheet = workbook.addWorksheet(sheetDefinition.name);

    // Congelar la fila de encabezados
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // Encabezados
    const headerRow = worksheet.addRow(sheetDefinition.columns);

    headerRow.font = {
      bold: true,
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "D9EAD3",
      },
    };

    headerRow.alignment = {
      horizontal: "center",
    };

    // Filas de datos
    sheetDefinition.rows.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Autoajuste de columnas
    worksheet.columns.forEach((column) => {
      let maxLength = 10;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = String(cell.value ?? "").length;

        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = maxLength + 2;
    });
  });

  return workbook;
};

// Serializa un workbook de ExcelJS en un buffer listo para descargar.
const generateExcelBuffer = async (workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};

// Escribe un workbook de ExcelJS en un archivo .xlsx.
const generateExcelFile = async (workbook, filePath) => {
  await workbook.xlsx.writeFile(filePath);
};

// Exporta todas las funciones del servicio de exportación a Excel para que puedan ser utilizadas en otras partes de la aplicación.
export const excelScheduleService = {
  buildExcelRows,
  buildExcelSummaryRows,
  buildCompetenciesColumns,
  buildSummaryColumns,
  buildWorkbookSheets,
  buildWorkbookModel,
  buildScheduleColumns,
  buildScheduleRows,
  buildWorkbookDefinition,
  buildExportMetadata,
  buildExcelExportPackage,
  buildExcelExportJson,
  buildExcelExportFileName,
  buildExcelExportPayload,
  buildExcelExportResponse,
  validateWorkbookDefinition,
  isReadyForExcelExport,
  buildPhysicalWorkbook,
  buildWorkbookContent,
  buildWorkbookBuffer,
  buildExcelExportArtifact,
  generateExcelWorkbook,
  generateExcelBuffer,
  generateExcelFile,
};

export default excelScheduleService;
