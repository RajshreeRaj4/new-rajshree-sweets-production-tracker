// Constants for categories and unit types (same as products page)
const CATEGORIES = [
    { id: 1, name: 'Chhena' },
    { id: 2, name: 'Desi Ghee' },
    { id: 3, name: 'Dry Fruits' },
    { id: 4, name: 'Gajak' },
    { id: 5, name: 'Halwa' },
    { id: 6, name: 'Cold Items' },
    { id: 7, name: 'Khowa Mithai' },
    { id: 8, name: 'Mewa Mithai' },
    { id: 9, name: 'Mix' },
    { id: 10, name: 'Namkeen' },
    { id: 11, name: 'Petha' },
    { id: 12, name: 'Shagun' },
    { id: 13, name: 'Snacks' },
    { id: 14, name: 'Hampers' },
    { id: 15, name: 'Shakes' }
];

const UNIT_TYPES = [
    { id: 1, name: 'KG' },
    { id: 2, name: 'Box' },
    { id: 3, name: 'Pcs' },
    { id: 4, name: 'Bottle' }
];

let products = [];
let currentEditingLogId = null;
let selectedProduct = null;

// Wait for DOM to be fully loaded
function initializePage() {
    try {
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && endDateInput) {
            startDateInput.value = today;
            endDateInput.value = today;
        }

        // Initialize components
        loadProducts()
            .then(() => {
                setupEventListeners();
                loadProductionLogs();
            })
            .catch(error => {
                console.error('Failed to load products:', error);
                alert('Failed to initialize the page. Please refresh.');
            });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Setup event listeners only after DOM is loaded
function setupEventListeners() {
    const productSearch = document.getElementById('productSearch');
    const productSelect = document.getElementById('productSelect');
    const productionForm = document.getElementById('productionForm');
    const editForm = document.getElementById('editForm');
    const filterButton = document.getElementById('filterButton');

    if (productSearch) {
        productSearch.addEventListener('input', handleProductSearch);
    }

    if (productSelect) {
        productSelect.addEventListener('change', handleProductSelection);
    }

    if (productionForm) {
        productionForm.addEventListener('submit', handleProductionFormSubmit);
    }

    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmit);
    }

    if (filterButton) {
        filterButton.addEventListener('click', loadProductionLogs);
    }
}

async function loadProducts() {
    try {
        console.log('Fetching products...'); // Debug log
        const response = await fetch('/api/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        products = await response.json();
        console.log('Products loaded:', products); // Debug log
        
        if (!Array.isArray(products) || products.length === 0) {
            console.warn('No products found or invalid response');
        }
        
        updateProductSelect();
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products. Please refresh the page.');
        throw error; // Re-throw to handle in the calling function
    }
}

function updateProductSelect() {
    const select = document.getElementById('productSelect');
    if (!select) {
        console.error('Product select element not found');
        return;
    }

    console.log('Updating product select with products:', products); // Debug log
    
    select.innerHTML = '<option value="">Select a product</option>';
    
    if (Array.isArray(products)) {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.dataset.unit = product.unitType;
            option.textContent = `${product.name} (${product.category})`;
            select.appendChild(option);
        });
    }
}

async function loadProductionLogs() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const response = await fetch(`/api/production?startDate=${startDate}&endDate=${endDate}`);
        const logs = await response.json();
        
        const tbody = document.getElementById('productionData');
        tbody.innerHTML = '';
        
        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${log.id}</td>
                <td>${new Date(log.createdAt).toLocaleString()}</td>
                <td>${log.productName}</td>
                <td>${log.quantity}</td>
                <td>${log.unitType}</td>
                <td>${log.category}</td>
                <td>${log.updationReason || ''}</td>
                <td>${log.updatedAt ? new Date(log.updatedAt).toLocaleString() : ''}</td>
                <td>
                    <button class="action-button edit-button" onclick="openEditDialog(${log.id}, ${log.quantity}, '${log.unitType}')">Edit</button>
                    <button class="action-button delete-button" onclick="deleteLog(${log.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading production logs:', error);
        alert('Failed to load production logs');
    }
}

function openEditDialog(logId, quantity, unitType) {
    currentEditingLogId = logId;
    const dialog = document.getElementById('editDialog');
    const unitTypeDisplay = document.getElementById('editUnitTypeDisplay');
    
    dialog.style.display = 'block';
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editReason').value = '';
    
    if (unitTypeDisplay) {
        unitTypeDisplay.textContent = unitType;
    }
}

function closeEditDialog() {
    const dialog = document.getElementById('editDialog');
    dialog.style.display = 'none';
    currentEditingLogId = null;
    document.getElementById('editForm').reset();
}

function clearProductSearch() {
    const searchInput = document.getElementById('productSearch');
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
}

async function deleteLog(logId) {
    if (!confirm('Are you sure you want to delete this production log?')) return;

    try {
        const response = await fetch(`/api/production/${logId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete production log');
        
        loadProductionLogs();
    } catch (error) {
        console.error('Error deleting production log:', error);
        alert('Failed to delete production log');
    }
}

// Event handler functions
function handleProductSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const select = document.getElementById('productSelect');
    if (!select) return;

    Array.from(select.options).forEach(option => {
        if (option.value === '') return; // Skip placeholder option
        const text = option.textContent.toLowerCase();
        option.hidden = !text.includes(searchTerm);
    });
}

function handleProductSelection(e) {
    const selectedId = e.target.value;
    const unitTypeDisplay = document.getElementById('unitTypeDisplay');
    if (!unitTypeDisplay) return;

    selectedProduct = products.find(p => p.id === parseInt(selectedId));
    unitTypeDisplay.textContent = selectedProduct ? selectedProduct.unitType : '';
}

async function handleProductionFormSubmit(e) {
    e.preventDefault();
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');
    
    if (!productSelect || !quantityInput) return;

    const formData = {
        productId: productSelect.value,
        quantity: quantityInput.value
    };

    try {
        const response = await fetch('/api/production', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add production log');
        
        e.target.reset();
        document.getElementById('unitTypeDisplay').textContent = '';
        loadProductionLogs();
    } catch (error) {
        console.error('Error adding production log:', error);
        alert('Failed to add production log');
    }
}

// Add this function to handle edit form submission
async function handleEditFormSubmit(e) {
    e.preventDefault();
    const quantityInput = document.getElementById('editQuantity');
    const reasonInput = document.getElementById('editReason');
    
    if (!quantityInput || !reasonInput || !currentEditingLogId) return;

    const formData = {
        quantity: quantityInput.value,
        updationReason: reasonInput.value
    };

    try {
        const response = await fetch(`/api/production/${currentEditingLogId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update production log');
        
        closeEditDialog();
        loadProductionLogs();
    } catch (error) {
        console.error('Error updating production log:', error);
        alert('Failed to update production log');
    }
}

// Initialize the page when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
