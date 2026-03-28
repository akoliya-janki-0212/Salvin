/**
 * Product Details Page Logic
 * Fetches specific record from Airtable using record ID
 */

const SPARES_CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tableName: 'spares',
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

async function fetchProductDetails(recordId) {
    const url = `https://api.airtable.com/v0/${SPARES_CONFIG.baseId}/${SPARES_CONFIG.tableName}/${recordId}`;

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
        return { id: data.id, ...data.fields };
    } catch (error) {
        console.error("Airtable Fetch Error:", error);
        return null;
    }
}

function renderProductDetails(product) {
    const container = document.getElementById('product-details-container');
    const breadcrumbName = document.getElementById('breadcrumb-name');

    if (!product) {
        container.innerHTML = `
            <div class="text-center p-5">
                <i class="fa-solid fa-circle-exclamation fa-3x mb-3" style="color:#ef4444;"></i>
                <h2 class="section-title">Product Not Found</h2>
                <p>The product you're looking for was not found or the link is invalid.</p>
                <a href="spares.html" class="btn btn-primary mt-4">Back to Spares</a>
            </div>
        `;
        return;
    }

    // Data Mapping with fallbacks
    const name = product.product_name || product.Name || product.name || product.Title || 'Unnamed Product';
    const idString = product.product_id || product.id || product.ID || product['Product ID'] || 'N/A';
    const price = product.price || product.Price || product.RegularPrice || 0;
    const sellingPrice = product.selling_price || product['selling price'] || product.SellingPrice || product.SalePrice || price;
    const imgUrl = getProductImage(product);
    const description = product.description || product.Description || product.Note || 'Quality industrial spare part for high-performance machinery. Engineered for durability and precision.';

    // Update Breadcrumb and Tab Title
    if (breadcrumbName) breadcrumbName.textContent = name;
    document.title = `${name} | Salvin Industries`;

    container.innerHTML = `
        <div class="details-grid mt-5">
            <!-- Product Information -->
            <div class="details-image-container animate__animated animate__fadeIn">
                <img src="${imgUrl}" alt="${name}">
            </div>
            
            <div class="details-content animate__animated animate__fadeInRight">
                <span class="details-sku">PRODUCT ID: ${idString}</span>
                <h1>${name}</h1>
                
                <div class="details-price-wrapper">
                    <span class="price-now">₹${sellingPrice}</span>
                    ${price > sellingPrice ? `<span class="price-was">ORIGNAL ₹${price}</span>` : ''}
                </div>
                
                <p class="mb-5 text-muted" style="font-size: 1.1rem; line-height: 1.8;">
                    ${description.replace(/\n/g, '<br>')}
                </p>
                
                <div class="d-flex flex-wrap gap-3">
                    <button class="btn btn-secondary py-3 px-5 shadow-lg d-flex align-items-center justify-content-center" onclick="orderOnWhatsApp('${idString}', '${name}')" style="min-width: 250px;">
                        <i class="fa-brands fa-whatsapp me-3 fa-xl"></i> ORDER ON WHATSAPP
                    </button>
                    <button class="btn btn-outline py-3 px-4 d-flex align-items-center" onclick="shareProduct('${name}')">
                        <i class="fa-solid fa-share-nodes me-2"></i> Share
                    </button>
                </div>

                <div class="mt-5 p-4 rounded-4 bg-light shadow-sm" style="border:1px dashed #ced4da;">
                    <div class="d-flex align-items-center gap-3">
                        <i class="fa-solid fa-clock-rotate-left fs-3 text-accent"></i>
                        <div>
                            <p class="mb-0 text-dark fw-bold">120-Minute Service Commitment</p>
                            <p class="mb-0 text-muted small mt-1">
                                Salvin Industries ensures spares and engineering support within Ahmedabad in under 2 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5 pt-5 border-top">
            <h2 class="section-title text-start mb-4">Why Choose <span class="highlight">Salvin</span>?</h2>
            <div class="row g-4 mt-2">
                <div class="col-md-4">
                    <div class="p-4 bg-white border rounded-4 shadow-sm h-100">
                        <i class="fa-solid fa-shield-halved text-primary fs-3 mb-3"></i>
                        <h5>Genuine Spares</h5>
                        <p class="text-muted small">Original equipment parts designed for maximum machine longevity.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-4 bg-white border rounded-4 shadow-sm h-100">
                        <i class="fa-solid fa-wrench text-primary fs-3 mb-3"></i>
                        <h5>Expert Engineering</h5>
                        <p class="text-muted small">Our technical team provides professional installation support.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-4 bg-white border rounded-4 shadow-sm h-100">
                        <i class="fa-solid fa-bolt text-primary fs-3 mb-3"></i>
                        <h5>Minimize Downtime</h5>
                        <p class="text-muted small">Rapid response units to keep your production lines running.</p>
                    </div>
                </div>
            </div>
        </div>

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
