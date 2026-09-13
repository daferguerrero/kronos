import { WEEK_DAYS } from "../utils/week-days.js";

// Valida la configuración del cronograma y devuelve los mensajes de error encontrados.
const validate = (config) => {
  const errors = [];

  if (!config.ficha) {
    errors.push("La ficha es obligatoria.");
  }

  if (!config.startProgramDate) {
    errors.push("La fecha de inicio del programa es obligatoria.");
  }

  if (!config.startTrainingDate) {
    errors.push("La fecha de inicio de formación es obligatoria.");
  }

  if (!config.endProgramDate) {
    errors.push("La fecha final del programa es obligatoria.");
  }

  if (config.weekStartDay && !WEEK_DAYS.includes(config.weekStartDay)) {
    errors.push("El día de inicio de semana no es válido.");
  }

  // Compara las fechas de inicio cuando ambas están definidas.
  if (config.startProgramDate && config.startTrainingDate) {
    const startProgramDate = new Date(config.startProgramDate);

    const startTrainingDate = new Date(config.startTrainingDate);

    if (startTrainingDate < startProgramDate) {
      errors.push(
        "La fecha de inicio de formación no puede ser anterior a la fecha de inicio del programa.",
      );
    }
  }


  // Comprueba que la fecha final del programa sea posterior a la fecha inicial.
  if (config.startProgramDate && config.endProgramDate) {
    const startProgramDate = new Date(config.startProgramDate);

    const endProgramDate = new Date(config.endProgramDate);

    if (endProgramDate <= startProgramDate) {
      errors.push(
        "La fecha final del programa debe ser posterior a la fecha de inicio del programa.",
      );
    }
  }

  return errors;
};


export default {
  validate,
};
