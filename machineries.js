/**
 * Machineries Logic
 * Handles dynamic fetching and filtering for Processing & Packaging Machineries
 */

const MACHINE_CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tableName: 'machineries',
    categoryTable: 'machine_category',
    whatsappNumber: '919023979663'
};

// Global State
let currentMainCategoryId = 1; // Default to Processing (as per previous request, but mapping 2 to Processing)
let currentSubCategoryId = 'All';

const MAIN_CAT_MAP = {
    1: 'Processing Machineries',
    2: 'Packaging Machineries'
};

/**
 * Helper to get image URL from Airtable (String or Attachment Array)
 */
function getProductImage(record) {
    const fieldData = record.image || record.Image || record.ImageURL || record.imageurl;
    if (!fieldData) return 'assets/placeholder-machine.jpg';
    if (Array.isArray(fieldData) && fieldData.length > 0) {
        return fieldData[0].url;
    }
    return fieldData;
}

/**
 * Fetch Sub-Categories for a specific Main Category ID
 */
async function fetchSubCategories(mainCatId) {
    // Filter specifically matching the main category ID provided (1 or 2)
    const filterFormula = `{main_category} = ${mainCatId}`;
    const url = `https://api.airtable.com/v0/${MACHINE_CONFIG.baseId}/${MACHINE_CONFIG.categoryTable}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${MACHINE_CONFIG.apiKey}` }
        });
        const data = await response.json();

        if (data.error) {
            console.error("Airtable API Error (Categories):", data.error);
            return [];
        }

        if (!data.records) {
            console.warn("No records field in response:", data);
            return [];
        }

        return data.records.map(record => ({
            id: record.fields.id || record.fields.ID || record.id,
            name: record.fields.Name || record.fields.name || record.fields.naem || 'Unnamed'
        })).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } catch (error) {
        console.error("Fetch Exception (Categories):", error);
        return [];
    }
}

/**
 * Fetch Machineries with Filter IDs
 */
async function fetchMachineries(mainCatId, subCategoryId) {
    // Single field comparison for category ID
    const mainFilter = `{category} = ${mainCatId}`;
    const filters = [mainFilter];

    if (subCategoryId && subCategoryId !== 'All') {
        const isNumeric = !isNaN(subCategoryId);
        const subFilter = isNumeric
            ? `{sub_category} = ${subCategoryId}`
            : `{sub_category} = "${subCategoryId}"`;
        filters.push(subFilter);
    }

    const filterFormula = filters.length > 1 ? `AND(${filters.join(',')})` : filters[0];
    const url = `https://api.airtable.com/v0/${MACHINE_CONFIG.baseId}/${MACHINE_CONFIG.tableName}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=name&sort[0][direction]=asc`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${MACHINE_CONFIG.apiKey}` }
        });
        const data = await response.json();

        if (data.error) {
            console.error("Airtable API Error (Machineries):", data.error);
            return [];
        }

        if (!data.records) {
            console.warn("No records field for machineries:", data);
            return [];
        }

        return data.records.map(record => ({ id: record.id, ...record.fields }));
    } catch (error) {
        console.error("Fetch Exception (Machineries):", error);
        return [];
    }
}

/**
 * Render Sub-Category Dropdown Options
 */
function renderSubCategoryOptions(categories) {
    const select = document.getElementById('sub-category-select-v3');
    if (!select) return;

    let html = '<option value="All">All Categories</option>';
    html += categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    select.innerHTML = html;
    select.value = currentSubCategoryId;
}

/**
 * Render Machinery Cards to Grid
 */
/**
 * Render Machinery Cards to Grid
 */
function renderMachineries(machines) {
    const grid = document.getElementById('dynamic-machine-grid');
    const resultsCountDisplay = document.getElementById('machine-results-count');
    const loader = document.getElementById('machine-loader');

    if (loader) loader.style.display = 'none';
    
    // Update Results Count (Pill Design)
    if (resultsCountDisplay) {
        resultsCountDisplay.textContent = `${machines.length} Products`;
    }

    if (machines.length === 0) {
        grid.innerHTML = `
            <div class="text-center w-100 py-5" style="grid-column: 1 / -1;">
                <div class="empty-state-container p-5 rounded-4" style="background: #f8fafc; border: 2px dashed #e2e8f0;">
                    <i class="fa-solid fa-box-open fa-4x mb-4" style="color: #cbd5e1;"></i>
                    <h4 class="fw-bold text-dark mb-2">No Machineries Found</h4>
                    <p class="text-muted mx-auto" style="max-width: 400px;">We couldn't find any machines matching your current filter. Please try a different category or check back later.</p>
                    <button class="btn btn-primary mt-3 px-4 rounded-pill" onclick="switchSubCategory('All')">Clear Filter</button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = machines.map(machine => {
        const imgUrl = getProductImage(machine);
        const name = machine.product_name || machine.Name || machine.name || machine.Title || 'Unnamed Machine';
        const id = machine.id; // Record ID
        const displayId = machine.product_id || machine.id;

        return `
            <div class="product-card">
                <div class="product-img-container">
                    <img src="${imgUrl}" alt="${name}" class="product-img">
                </div>
                <div class="product-content">
                    <h3 class="product-title">${name}</h3>
                    <div class="product-footer">
                        <div class="product-price-column" style="cursor: pointer;" onclick="event.stopPropagation(); orderOnWhatsApp('${displayId}', '${name}')">
                            <span class="price-main" style="color: var(--color-accent); font-size: 0.95rem; text-transform: uppercase;">Get a Quote</span>
                        </div>
                        <div class="product-divider"></div>
                        <div class="product-action" onclick="window.location.href='machine-details.html?id=${id}'">
                            <span>View More</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Switch Main Category (Horizontal Tab Click)
 */
window.switchMainCategory = async function (mainCategoryLabel, element) {
    // Map label to ID: Processing = 1, Packaging = 2
    const newId = mainCategoryLabel.includes('Packaging') || mainCategoryLabel === 2 ? 2 : 1;
    
    currentMainCategoryId = newId;
    currentSubCategoryId = 'All'; // Reset sub-category on main change

    // Update Tab UI
    if (element) {
        document.querySelectorAll('.btn-main-cat-v3').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }
    
    // Refresh Sub-categories and Product List
    await updateAll();
};

/**
 * Switch Sub-Category (Dropdown Change)
 */
window.switchSubCategory = async function (subCategoryId) {
    currentSubCategoryId = subCategoryId;
    await updateMachineryList();
};

/**
 * WhatsApp Quote Helper
 */
function orderOnWhatsApp(id, name) {
    const message = encodeURIComponent(`Hi Salvin Industries, I am interested in a quote for:\n\nMachine: ${name}\nID: ${id}\n\nPlease provide more details.`);
    window.open(`https://wa.me/${MACHINE_CONFIG.whatsappNumber}?text=${message}`, '_blank');
}
window.orderOnWhatsApp = orderOnWhatsApp;


/**
 * Main Update Loop
 */
async function updateAll() {
    const grid = document.getElementById('dynamic-machine-grid');
    grid.innerHTML = `
        <div class="text-center w-100 py-5" style="grid-column: 1 / -1;">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 fw-bold text-primary animate__animated animate__pulse animate__infinite">Syncing with Industrial Database...</p>
        </div>
    `;

    const subCategories = await fetchSubCategories(currentMainCategoryId);
    renderSubCategoryOptions(subCategories);

    await updateMachineryList();
}

async function updateMachineryList() {
    const machines = await fetchMachineries(currentMainCategoryId, currentSubCategoryId);
    renderMachineries(machines);
}

// Initialization
document.addEventListener('DOMContentLoaded', updateAll);
