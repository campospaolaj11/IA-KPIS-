// Netlify Function: get-kpis.js
// Ejemplo de función serverless para exponer datos de KPIs desde una base de datos (simulada aquí)

exports.handler = async function(event, context) {
  // Aquí deberías conectar a tu base de datos real y obtener los datos
  // Por ejemplo, usando mysql2, pg, etc. (requiere empaquetar dependencias)
  // Este ejemplo devuelve datos simulados

  const kpis = {
    MTBF: 120.5,
    MTTR: 4.2,
    Disponibilidad: 98.7,
    CostoPromedio: 3500.75,
    TasaFallas: 1.8
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: kpis })
  };
};
