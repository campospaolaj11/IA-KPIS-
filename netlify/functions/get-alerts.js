// Netlify Function: get-alerts.js
exports.handler = async function(event, context) {
  // Simulación de alertas de alto riesgo
  const alerts = [
    {
      codigo_equipo: 'CAM-001',
      nombre_equipo: 'Camión Minero',
      componente: 'Motor Diesel',
      probabilidad: 0.87,
      accion: 'Revisar y reemplazar filtro de aceite.'
    },
    {
      codigo_equipo: 'GEN-005',
      nombre_equipo: 'Generador Eléctrico',
      componente: 'Sistema Hidráulico',
      probabilidad: 0.78,
      accion: 'Inspeccionar presión del sistema.'
    }
  ];
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: alerts })
  };
};
