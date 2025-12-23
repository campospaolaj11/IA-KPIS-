function renderPredictions(predictions) {
    const tbody = document.getElementById('predictions-tbody');
    if (!tbody) return;

    if (predictions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay predicciones disponibles</td></tr>';
        return;
    }

    tbody.innerHTML = predictions.slice(0, 20).map(pred => `
        <tr>
            <td>${pred.id || ''}</td>
            <td>${pred.codigo_equipo || ''}</td>
            <td>${pred.nombre_equipo || ''}</td>
            <td>${pred.componente || ''}</td>
            <td>${(pred.probabilidad * 100).toFixed(1) || ''}%</td>
            <td>${pred.accion || ''}</td>
            <td>${formatDate(pred.fecha)}</td>
        </tr>
    `).join('');
}