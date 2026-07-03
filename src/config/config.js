// src/config/config.js
// 1 = Pruebas, 0 = Producción
const ENTORNO_PRUEBAS = 0;

const URL_BASE = ENTORNO_PRUEBAS === 1
  ? "https://apipruebas.delisync.com"
  : "https://api.delisync.com";

export default URL_BASE;
