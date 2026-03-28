/**
 * Product Details Page Logic
 * Fetches specific record from Airtable using record ID
 */

const SPARES_CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tableName: 'spares',
    categoryTable: 'Category',
    brandTable: 'Brand',
    technicalTable: 'productTechnical',
    whatsappNumber: '919023979663'
};

// Helper to get image URL(s) from Airtable (String or Attachment Array)
function getProductImages(record) {
    const fieldData = record.image || record.Image || record.ImageURL || record.imageurl;
    if (!fieldData) return ['assets/placeholder-spare.jpg'];
    if (Array.isArray(fieldData) && fieldData.length > 0) {
        return fieldData.map(img => img.url); // Return all attachment URLs
    }
    return [fieldData]; // Return string URL in array
}

async function fetchProductDetails(recordId) {
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.tableName}/${recordId}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        console.log("Raw Product Response (Spares Table):", data); // CRITICAL DIAGNOSTIC
        return { id: data.id, ...data.fields };
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
        return null;
    }
}

async function fetchProductTechnical(productId) {
    // productId is something like 'SAL-101'
    const filterFormula = `{product_id} = "${productId}"`;
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.technicalTable}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        return data.records.map(r => r.fields);
    } catch (error) {
        console.error("Technical Data Error:", error);
        return [];
    }
}

async function fetchLookupName(tableName, recordValue) {
    // If it's an array (from a lookup or link), take the first value
    let customId = Array.isArray(recordValue) ? recordValue[0] : recordValue;

    if (customId === undefined || customId === null || customId === '' || customId === 'N/A') return 'N/A';

    console.log(`Looking up ${tableName} name for ID: ${customId}`);

    // Try finding the record where the {id} column matches our customId
    const filterFormula = `{id} = "${customId}"`;
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${tableName}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        if (data.records && data.records.length > 0) {
            const fields = data.records[0].fields;
            // Return 'naem' specifically as requested, or fallbacks
            return fields.naem || fields.Name || fields.name || 'Unknown';
        }
        return 'Not Found';
    } catch (error) {
        console.error(`Lookup Error (${tableName}):`, error);
        return 'N/A';
    }
}
async function fetchSimilarProducts(categoryId, currentId) {
    // categoryId could be an ID like 1, 2, etc.
    if (!categoryId) return [];

    const filterFormula = `AND({category_id} = "${categoryId}", RECORD_ID() != "${currentId}")`;
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.tableName}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=4`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SPARES_CONFIG.apiKey}`
            }
        });
        const data = await response.json();
        return data.records.map(r => ({ id: r.id, ...r.fields }));
    } catch (error) {
        console.error("Similar Products Error:", error);
        return [];
    }
}

async function renderProductDetails(product) {
    const container = document.getElementById('product-details-container');
    const breadcrumbName = document.getElementById('breadcrumb-name');

    if (!product) {
        container.innerHTML = `<div class="text-center p-5"><h2>Product Not Found</h2></div>`;
        return;
    }

    // Data Mapping from 'spares' table - Exact column matching
    const name = product.Name || product.product_name || 'Unnamed Product';
    const rawId = product.product_id || product['product_id'] || product['Product ID'] || 'N/A';
    const idString = (rawId === 'N/A') ? 'N/A' : (rawId.toString().startsWith('SAL-') ? rawId.toString() : `SAL-${rawId}`);

    // Pricing - EXACT COLUMN NAMES: Price, Selling Price
    // We parse as number to avoid comparison issues
    const price = parseFloat(product.Price || product.price || 0);
    const sellingPrice = parseFloat(product['Selling Price'] || product.selling_price || product['selling price'] || price);

    const images = getProductImages(product);
    const description = product.Description || product.description || product.DescriptionText || 'Quality industrial spare part.';

    // Parallel fetch for extra data AND name lookups
    const rawCategoryId = product.Category_id || product.category_id || product['Category_id'] || '';
    const rawBrandId = product.brand || product.Brand || product.brand_id || '';

    const [technicalSpecs, similarProducts, resolvedCategory, resolvedBrand] = await Promise.all([
        fetchProductTechnical(rawId),
        fetchSimilarProducts(rawCategoryId, product.id),
        fetchLookupName(SPARES_CONFIG.categoryTable, rawCategoryId),
        fetchLookupName(SPARES_CONFIG.brandTable, rawBrandId)
    ]);

    if (breadcrumbName) breadcrumbName.textContent = name;
    document.title = `${name} | Salvin Industries`;

    container.innerHTML = `
        <div class="details-grid-condensed">
            <!-- Left Side: Interactive Gallery -->
            <div class="product-gallery">
                <div class="thumbnails-column">
                    ${images.map((img, index) => `
                        <div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.setActiveImage(this, '${img}')">
                            <img src="${img}" alt="thumbnail">
                        </div>
                    `).join('')}
                </div>
                <div class="main-viewport" onmousemove="window.handleZoom(event, this)" onmouseleave="window.resetZoom(this)">
                    <img id="main-product-img" src="${images[0]}" alt="${name}">
                </div>
            </div>
            
            <!-- Right Side: Essential Product Info -->
            <div class="details-content-condensed">
                <div class="mb-4">
                    <span class="badge-mini">SKU: ${idString}</span>
                </div>
                <h1 class="product-h1 mb-4">${name}</h1>
                
                <div class="price-simple mb-5">
                    <span class="price-current">₹${sellingPrice}</span>
                    ${(price && price != sellingPrice) ? `<span class="price-original">₹${price}</span>` : ''}
                </div>
                
                <div class="attributes-grid mb-4">
                    <div class="attr-row"><span>Category</span><strong>${resolvedCategory}</strong></div>
                    <div class="attr-row"><span>Brand</span><strong>${resolvedBrand}</strong></div>
                </div>

                <div class="action-buttons mb-5">
                    <button class="btn btn-primary-whatsapp w-100 mb-3" onclick="orderOnWhatsApp('${idString}', '${name}')">
                        <i class="fa-brands fa-whatsapp me-2"></i> ORDER NOW ON WHATSAPP
                    </button>
                    <button class="btn btn-outline-share w-100" onclick="shareProduct('${name}')">
                        <i class="fa-solid fa-share-nodes me-2"></i> Share Product
                    </button>
                </div>

                <!-- Part 1: Technical Specifications (From productTechnical table) -->
                ${technicalSpecs.length > 0 ? `
                    <div class="technical-section mb-5">
                        <h4 class="section-subtitle">Technical Specifications</h4>
                        <table class="specs-table">
                            <tbody>
                                ${technicalSpecs.map(spec => `
                                    <tr>
                                        <td class="spec-label">${spec.Name || spec.Title || 'Parameter'}</td>
                                        <td class="spec-value">${spec.Value || spec.value || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Description Section -->
        <div class="description-section mt-5 pb-5 border-bottom">
            <h4 class="section-subtitle">Product Description</h4>
            <p class="text-muted" style="line-height: 1.8; font-size: 1.05rem;">
                ${description.replace(/\n/g, '<br>')}
            </p>
        </div>

        <!-- Part 2: Similar Products (From spares table) -->
        ${similarProducts.length > 0 ? `
            <div class="similar-products-section mt-5 pt-5">
                <h3 class="section-title mb-4" style="text-align: left;">Similar <span class="highlight">Products</span></h3>
                <div class="grid-4">
                    ${similarProducts.map(p => {
                        const img = p.image ? (Array.isArray(p.image) ? p.image[0].url : p.image) : 'assets/placeholder-spare.jpg';
                        const pName = p.product_name || p.Name || 'Unnamed';
                        const pPrice = parseFloat(p.price || 0);
                        const pSellingPrice = parseFloat(p.selling_price || p['Selling Price'] || pPrice);
                        return `
                            <div class="product-card">
                                <div class="product-img-container">
                                    <img src="${img}" alt="${pName}" class="product-img">
                                </div>
                                <div class="product-content">
                                    <h3 class="product-title">${pName}</h3>
                                    <div class="product-footer">
                                        <div class="product-price-column">
                                            <span class="price-main">₹${pSellingPrice}</span>
                                            ${(pPrice && pPrice != pSellingPrice) ? `<span class="price-strikethrough">₹${pPrice}</span>` : ''}
                                        </div>
                                        <div class="product-divider"></div>
                                        <div class="product-action" onclick="window.location.href='product-details.html?id=${p.id}'">
                                            <span>View More</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="mt-5 pt-5 text-center">
            <a href="spares.html" class="btn btn-outline px-5">
                <i class="fa-solid fa-arrow-left me-2"></i> Back to 120 Min Spares
            </a>
        </div>
    `;
}

function orderOnWhatsApp(id, name) {
    const message = encodeURIComponent(`Hi Salvin Industries, I am interested in ordering: \n\nProduct: ${name}\nID: ${id}\n\nPlease provide more details.`);
    window.open(`https://wa.me/919023979663?text=${message}`, '_blank');
}

// Interactive Gallery & Zoom Functionality
window.setActiveImage = function (element, src) {
    // Update Main Image
    const mainImg = document.getElementById('main-product-img');
    if (mainImg) mainImg.src = src;

    // Update Active Thumbnail
    document.querySelectorAll('.thumb-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
};

window.handleZoom = function (e, container) {
    const img = container.querySelector('img');
    const zoomHint = container.querySelector('.zoom-hint');
    if (!img) return;

    if (zoomHint) zoomHint.style.opacity = '0';

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(2)';
};

window.resetZoom = function (container) {
    const img = container.querySelector('img');
    const zoomHint = container.querySelector('.zoom-hint');
    if (!img) return;

    if (zoomHint) zoomHint.style.opacity = '1';

    img.style.transform = 'scale(1)';
    img.style.transformOrigin = 'center';
};

function shareProduct(name) {
    if (navigator.share) {
        navigator.share({
            title: name,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
    }
}

// Initialization and URL Parsing
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');

    if (recordId) {
        const product = await fetchProductDetails(recordId);
        renderProductDetails(product);
    } else {
        renderProductDetails(null);
    }
});
