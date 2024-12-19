// Common utility functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function refreshPage() {
    window.location.reload();
}

// Export functions
async function exportCategorySummary() {
    const summaryDate = document.getElementById('summaryDate').value;
    if (!summaryDate) {
        alert('Please select a date');
        return;
    }

    try {
        const response = await fetch('/api/export-category-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: summaryDate })
        });

        const data = await response.json();
        if (data.success) {
            alert('Category summary exported successfully!');
        } else {
            alert(data.message || 'Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export category summary');
    }
}

async function exportDetailedCategorySummary() {
    const summaryDate = document.getElementById('summaryDate').value;
    if (!summaryDate) {
        alert('Please select a date');
        return;
    }

    try {
        const response = await fetch('/api/export-detailed-category-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: summaryDate })
        });

        const data = await response.json();
        if (data.success) {
            alert('Detailed category summary exported successfully!');
        } else {
            alert(data.message || 'Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export detailed category summary');
    }
}

async function exportProductionLogs() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date');
        return;
    }

    try {
        const response = await fetch('/api/export-production-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate, endDate })
        });

        const data = await response.json();
        if (data.success) {
            alert('Production logs exported successfully!');
        } else {
            alert(data.message || 'Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export production logs');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Set default date values
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('summaryDate')) {
        document.getElementById('summaryDate').value = today;
    }
    if (document.getElementById('startDate')) {
        document.getElementById('startDate').value = today;
    }
    if (document.getElementById('endDate')) {
        document.getElementById('endDate').value = today;
    }
});