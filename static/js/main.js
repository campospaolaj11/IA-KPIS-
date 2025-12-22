// ==================== MAIN APP UTILITIES ====================

// ==================== AUTO-REFRESH FUNCTIONALITY ====================
let autoRefreshInterval = null;

function startAutoRefresh(intervalSeconds = 30) {
    stopAutoRefresh();
    
    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing data...');
        
        // Refrescar segn la pgina actual
        if (typeof loadKPIs === 'function') {
            loadKPIs();
        }
        if (typeof loadAlerts === 'function') {
            loadAlerts();
        }
        if (typeof loadPredictions === 'function') {
            loadPredictions();
        }
    }, intervalSeconds * 1000);
    
    console.log(`Auto-refresh started: every ${intervalSeconds} seconds`);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('Auto-refresh stopped');
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        border-left: 4px solid ${getNotificationColor(type)};
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${getNotificationIcon(type)}</span>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${getNotificationTitle(type)}</div>
                <div style="font-size: 0.9rem; color: #6b7280;">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="border: none; background: none; cursor: pointer; font-size: 1.2rem; color: #9ca3af;">
                7
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#2563eb'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        'success': '5',
        'error': '4',
        'warning': 'ae0f',
        'info': '3e0f'
    };
    return icons[type] || icons.info;
}

function getNotificationTitle(type) {
    const titles = {
        'success': '9xito',
        'error': 'Error',
        'warning': 'Advertencia',
        'info': 'Informacin'
    };
    return titles[type] || titles.info;
}

// ==================== LOADING SPINNER ====================
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 3rem;">
                <div class="spinner"></div>
                <span style="margin-left: 1rem;">Cargando...</span>
            </div>
        `;
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// ==================== API ERROR HANDLER ====================
function handleAPIError(error, customMessage = 'Ocurri un error') {
    console.error('API Error:', error);
    showNotification(customMessage, 'error');
}

// ==================== FORMAT UTILITIES ====================
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(num) {
    return `$${formatNumber(num, 2)}`;
}

function formatPercentage(num) {
    return `${formatNumber(num, 1)}%`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== SMOOTH SCROLL ====================
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==================== EXPORT DATA ====================
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Datos exportados exitosamente', 'success');
}

function convertToCSV(data) {
    if (!data || data.length === 0) {
        return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: Focus en buscador/chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    }
    
    // Ctrl/Cmd + R: Refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
});

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicacin de Mantenimiento Predictivo iniciada');
    
    // Iniciar auto-refresh si estamos en dashboard
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
        startAutoRefresh(30);
    }
});

// ==================== CSS ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

