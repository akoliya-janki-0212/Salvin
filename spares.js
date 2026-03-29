/**
 * Spares & Service - Product Listing Integration
 * Fetches data from Airtable and handles categorization
 */

const SPARES_CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tableName: 'spares',
    categoryTable: 'spares_category',
    brandTable: 'spares_brand',
    whatsappNumber: '919023979663'
};

// Global Filter State
let currentCategoryId = 'All';
let currentBrandId = 'All';

// Helper to get image URL from Airtable (String or Attachment Array)
function getProductImage(record) {
    const fieldData = record.image || record.Image || record.ImageURL || record.imageurl;
    if (!fieldData) return 'assets/placeholder-spare.jpg';
    if (Array.isArray(fieldData) && fieldData.length > 0) {
        return fieldData[0].url; // Airtable Attachment format
    }
    return fieldData; // String URL format
}

async function fetchProducts(catId, brandId) {
    const filters = [];
    if (catId && catId !== 'All') filters.push(`{category_id} = "${catId}"`);
    if (brandId && brandId !== 'All') filters.push(`{brand} = "${brandId}"`);

    const filterFormula = filters.length > 1 ? `AND(${filters.join(',')})` : (filters[0] || '');
    console.log("Generated Filter Formula:", filterFormula); // DEBUG LOG

    let url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.tableName}?maxRecords=100&sort[0][field]=product_id&sort[0][direction]=asc`;

    if (filterFormula) {
        url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        console.log("Airtable Response (Products):", data);
        return data.records.map(record => ({ id: record.id, ...record.fields }));
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
        return [];
    }
}

async function fetchFilterOptions(tableName) {
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${tableName}?maxRecords=100`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        return data.records.map(record => {
            // Priority for custom ID fields: id, ID, Id, or any field with 'id' in its name
            const customId = record.fields.id || record.fields.ID || record.fields.Id || record.fields['Product ID'] || record.fields['id'];
            return {
                id: customId || record.id, // Fallback to record.id only if truly missing
                name: record.fields.naem || record.fields.Name || record.fields.name || 'Unnamed'
            };
        }).sort((a, b) => {
            // Robust alphanumeric sort (handles 1, 2, 10 correctly)
            return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
        });
    } catch (error) {
        console.error(`Fetch Error (${tableName}):`, error);
        return [];
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    const countDisplay = document.getElementById('product-count');

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="text-center w-100 p-5">
                <i class="fa-solid fa-box-open fa-3x mb-3" style="opacity:0.3;"></i>
                <p>No products found in this category yet.</p>
            </div>
        `;
        countDisplay.textContent = '0 Products';
        return;
    }

    countDisplay.textContent = `${products.length} Products`;
    grid.innerHTML = products.map(product => {
        const imgUrl = getProductImage(product);
        const name = product.product_name || product.Name || product.name || product.Title || 'Unnamed Product';
        const id = product.product_id || product.id || product.ID || product['Product ID'] || 'N/A';
        const price = product.price || product.Price || product.RegularPrice || 0;
        const sellingPrice = product.selling_price || product['selling price'] || product.SellingPrice || product.SalePrice || price;

        return `
            <div class="product-card">
                <div class="product-img-container">
                    <img src="${imgUrl}" alt="${name}" class="product-img">
                </div>
                <div class="product-content">
                    <h3 class="product-title">${name}</h3>
                    
                    <div class="product-footer">
                        <div class="product-price-column" style="cursor: pointer;" onclick="event.stopPropagation(); orderOnWhatsApp('${id}', '${name}')">
                            <span class="price-main" style="color: var(--color-accent); font-size: 0.95rem; text-transform: uppercase;">Get a Quote</span>
                        </div>
                        <div class="product-divider"></div>
                        <div class="product-action" onclick="window.location.href='product-details.html?id=${product.id}'">
                            <span>View More</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function orderOnWhatsApp(id, name) {
    const message = encodeURIComponent(`Hi Salvin Industries, I am interested in ordering: \n\nProduct: ${name}\nID: ${id}\n\nPlease provide more details.`);
    window.open(`https://wa.me/${SPARES_CONFIG.whatsappNumber}?text=${message}`, '_blank');
}

function renderFilterBar(categories, brands) {
    const container = document.getElementById('category-filter-container');
    if (!container) return;

    container.innerHTML = `
        <div class="filter-bar-grid d-flex flex-wrap align-items-center gap-4 mb-5">
            <!-- Category Filter -->
            <div class="filter-group d-flex align-items-center gap-3">
                <label for="category-select" class="fw-bold text-dark text-nowrap"><i class="fa-solid fa-layer-group me-2 text-accent"></i>Category:</label>
                <select id="category-select" class="form-select professional-select" onchange="window.switchCategory(this.value)">
                    <option value="All">All Categories</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                </select>
            </div>

            <!-- Brand Filter -->
            <div class="filter-group d-flex align-items-center gap-3">
                <label for="brand-select" class="fw-bold text-dark text-nowrap"><i class="fa-solid fa-tag me-2 text-accent"></i>Brand:</label>
                <select id="brand-select" class="form-select professional-select" onchange="window.switchBrand(this.value)">
                    <option value="All">All Brands</option>
                    ${brands.map(brand => `<option value="${brand.id}">${brand.name}</option>`).join('')}
                </select>
            </div>
        </div>
    `;
}

async function updateProductList() {
    const grid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('current-category-name');

    if (categoryTitle) categoryTitle.textContent = "Filtered Results";

    grid.innerHTML = `
        <div class="text-center w-100 p-5" id="loader">
            <i class="fa-solid fa-circle-notch fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Updating products list...</p>
        </div>
    `;

    const products = await fetchProducts(currentCategoryId, currentBrandId);
    renderProducts(products);
}

// Function switches
window.switchCategory = function (catId) {
    currentCategoryId = catId;
    updateProductList();
};

window.switchBrand = function (brandId) {
    currentBrandId = brandId;
    updateProductList();
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Categories and Brands dynamically from Lookup Tables
    const [categories, brands] = await Promise.all([
        fetchFilterOptions(SPARES_CONFIG.categoryTable),
        fetchFilterOptions(SPARES_CONFIG.brandTable)
    ]);

    // 2. Render the Dual Filter Bar
    renderFilterBar(categories, brands);

    // 3. Load All Products initially
    updateProductList();
});
