import ScheduleConfig from "../models/schedule-config.model.js";

// Crea una instancia de configuración de cronograma con los datos recibidos.
const create = (config) => {
  return new ScheduleConfig(config);
};

export default {
  create,
};
