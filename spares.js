/**
 * Spares & Service - Product Listing Integration
 * Fetches data from Airtable and handles categorization
 */

const SPARES_CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tableName: 'spares', // Default table name
    whatsappNumber: '919023979663'
};

// Helper to get image URL from Airtable (String or Attachment Array)
function getProductImage(record) {
    const fieldData = record.image || record.Image || record.ImageURL || record.imageurl;
    if (!fieldData) return 'assets/placeholder-spare.jpg';
    if (Array.isArray(fieldData) && fieldData.length > 0) {
        return fieldData[0].url; // Airtable Attachment format
    }
    return fieldData; // String URL format
}

async function fetchProducts(categoryId) {
    // If categoryId is '0' or falsy, we fetch all products
    const filterFormula = (categoryId && categoryId !== '0') ? `{category_id} = "${categoryId}"` : '';
    let url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.tableName}?maxRecords=100`;

    if (filterFormula) {
        url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error(`Airtable error: ${response.status}`);
        }
        const data = await response.json();
        return data.records.map(record => ({ id: record.id, ...record.fields }));
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
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
                        <div class="product-price-column">
                            <span class="price-main">₹${sellingPrice}</span>
                            ${price ? `<span class="price-strikethrough">₹${price}</span>` : ''}
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

async function handleCategoryChange(categoryId, categoryName) {
    const grid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('current-category-name');
    
    categoryTitle.textContent = categoryName;
    grid.innerHTML = `
        <div class="text-center w-100 p-5" id="loader">
            <i class="fa-solid fa-circle-notch fa-spin fa-3x text-primary"></i>
            <p class="mt-3">Fetching products for ${categoryName}...</p>
        </div>
    `;

    const products = await fetchProducts(categoryId);
    renderProducts(products);
}

// Function to handle category switching (Called from HTML onclick)
window.switchCategory = function(element) {
    const categoryId = element.dataset.id;
    const categoryName = element.dataset.name;

    // Check if already active to prevent unnecessary reloads
    if (element.classList.contains('active')) return;

    // UI State: Update the active class
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');

    // Trigger the data fetch and rendering
    handleCategoryChange(categoryId, categoryName);
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load default category on first arrival
    const defaultCategoryId = '1';
    const defaultCategoryName = 'Pneumatic Materials';
    handleCategoryChange(defaultCategoryId, defaultCategoryName);
});
