// Constants for categories and unit types
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

let currentEditingProductId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();
    loadProducts();
    setupEventListeners();
});

function populateDropdowns() {
    const categoryDropdowns = ['productCategory', 'editProductCategory'];
    const unitTypeDropdowns = ['productUnitType', 'editProductUnitType'];

    categoryDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value="">Select Category</option>';
        CATEGORIES.forEach(category => {
            dropdown.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    });

    unitTypeDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value="">Select Unit Type</option>';
        UNIT_TYPES.forEach(unit => {
            dropdown.innerHTML += `<option value="${unit.name}">${unit.name}</option>`;
        });
    });
}

function setupEventListeners() {
    // Add product form submission
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            unitType: document.getElementById('productUnitType').value
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to add product');
            
            document.getElementById('productForm').reset();
            loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        }
    });

    // Edit product form submission
    document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            unitType: document.getElementById('editProductUnitType').value
        };

        try {
            const response = await fetch(`/api/products/${currentEditingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update product');
            
            closeEditProductDialog();
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    });
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const tbody = document.getElementById('productTableBody');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.unitType}</td>
                <td>
                    <button class="action-button edit-button" onclick="openEditProductDialog(${product.id})">Edit</button>
                    <button class="action-button delete-button" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products');
    }
}

function openEditProductDialog(productId) {
    currentEditingProductId = productId;
    const dialog = document.getElementById('editProductDialog');
    dialog.style.display = 'block';

    // Find the product in the table
    const row = document.querySelector(`#productTableBody tr:has(button[onclick*="${productId}"])`);
    if (row) {
        const [name, category, unitType] = row.querySelectorAll('td');
        document.getElementById('editProductName').value = name.textContent;
        document.getElementById('editProductCategory').value = category.textContent;
        document.getElementById('editProductUnitType').value = unitType.textContent;
    }
}

function closeEditProductDialog() {
    const dialog = document.getElementById('editProductDialog');
    dialog.style.display = 'none';
    currentEditingProductId = null;
    document.getElementById('editProductForm').reset();
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');
        
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
}
