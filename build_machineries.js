const fs = require('fs');
const path = require('path');

const CONFIG = {
    apiKey: 'patzUZXi4xbEcJBtZ.b612407e01e31156ccba38758a352318eae8a69ad628fa26230186c4b30b36a7',
    baseId: 'appkw4hlOEoVJZ7cn',
    tables: {
        machineries: 'machineries',
        categories: 'machine_category',
        technical: 'machine_technical'
    },
    outputDir: './',
    baseUrl: 'https://salvinindustries.in/'
};

/**
 * Slugify Title: Lowercase, replace non-alphanumeric with underscore
 */
function slugify(text) {
    if (!text) return 'unnamed_machine';
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '_')           // Replace spaces with _
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/--+/g, '_')           // Replace multiple - with single _
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function fetchAll(url) {
    let allRecords = [];
    let offset = '';
    
    do {
        const fullUrl = offset ? `${url}&offset=${offset}` : url;
        const response = await fetch(fullUrl, {
            headers: { Authorization: `Bearer ${CONFIG.apiKey}` }
        });
        const data = await response.json();
        if (data.records) {
            allRecords = allRecords.concat(data.records);
        }
        offset = data.offset;
    } while (offset);
    
    return allRecords;
}

async function build() {
    console.log("Starting Build Process...");

    // 1. Fetch Categories
    const catUrl = `https://api.airtable.com/v0/${CONFIG.baseId}/${CONFIG.tables.categories}`;
    const categories = await fetchAll(catUrl);
    const catMap = {};
    categories.forEach(c => {
        catMap[c.fields.id || c.fields.ID || c.id] = c.fields.Name || c.fields.name || 'Category';
    });

    // 2. Fetch Technical Specs
    const techUrl = `https://api.airtable.com/v0/${CONFIG.baseId}/${CONFIG.tables.technical}`;
    const technical = await fetchAll(techUrl);
    const techMap = {};
    technical.forEach(t => {
        const pid = t.fields.product_id;
        if (!techMap[pid]) techMap[pid] = [];
        techMap[pid].push(t.fields);
    });

    // 3. Fetch Machineries
    const machUrl = `https://api.airtable.com/v0/${CONFIG.baseId}/${CONFIG.tables.machineries}?sort[0][field]=name&sort[0][direction]=asc`;
    const machinesRaw = await fetchAll(machUrl);
    const machines = machinesRaw.map(m => ({ id: m.id, ...m.fields }));

    // 4. Load Template
    const templatePath = path.join(process.cwd(), 'machine-details.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // 5. Generate Static Files
    const generatedUrls = [];

    for (const machine of machines) {
        const name = machine.product_name || machine.Name || machine.name || 'Unnamed Machine';
        const slug = slugify(name);
        const fileName = `${slug}.html`;
        const pid = machine.product_id || machine.id;
        const description = (machine.description || "Detailed industrial solutions by Salvin Industries.").replace(/"/g, '&quot;');
        const imageUrl = (machine.image && machine.image[0]) ? machine.image[0].url : 'assets/logo.png';
        
        console.log(`Generating: ${fileName}`);

        // Prepare Static HTML Injections
        const mainCatName = machine.category == 2 ? 'Packaging Machineries' : 'Processing Machineries';
        const subCatName = catMap[machine.sub_category] || '';
        const specs = techMap[pid] || [];
        const productIdDisplay = `SAL-M-${pid}`;

        // Build the dynamic parts that previously loaded via JS
        const breadcrumbHtml = `
            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
            <li class="breadcrumb-item"><i class="fa-solid fa-chevron-right mx-2 opacity-50 small"></i></li>
            <li class="breadcrumb-item"><a href="machineries.html">Machineries</a></li>
            <li class="breadcrumb-item"><i class="fa-solid fa-chevron-right mx-2 opacity-50 small"></i></li>
            <li class="breadcrumb-item active text-primary fw-bold" style="color: #ff6b35 !important;">${name}</li>
        `;

        const images = (machine.image || []).map(img => img.url);
        if (images.length === 0) images.push('assets/placeholder-machine.jpg');

        const detailsHtml = `
            <div class="details-grid-condensed">
                <div class="product-gallery d-flex gap-3">
                    <div class="thumbnails-column">
                        ${images.map((img, index) => `
                            <div class="thumb-item ${index === 0 ? 'active border-primary' : ''}" onclick="window.switchProductImage('${img}', this)">
                                <img src="${img}" alt="Thumbnail ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                    <div class="main-viewport shadow-sm border p-3">
                        <img id="main-product-img" src="${images[0]}" alt="${name}" class="img-fluid" style="max-height: 100%; object-fit: contain;">
                    </div>
                </div>

                <div class="details-content">
                    <span class="badge-mini mb-2">SKU: ${productIdDisplay}</span>
                    <h1 class="product-h1 mt-0" style="font-size: 1.5rem !important;">${name}</h1>
                    
                    <div class="rating-display mb-3">
                        <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                        <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                        <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                        <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                        <i class="fa-solid fa-star" style="color: #e2e8f0;"></i>
                    </div>

                    <div class="product-details-summary mb-4">
                        <p class="section-subtitle-compact mb-2">Product Details:</p>
                        <table class="specs-table-premium">
                            <tr><td class="spec-label">Category</td><td class="spec-value">${mainCatName}</td></tr>
                            ${subCatName ? `<tr><td class="spec-label">Sub-Category</td><td class="spec-value">${subCatName}</td></tr>` : ''}
                            ${specs.map(s => `<tr><td class="spec-label">${s.Title || s.Parameter || 'Spec'}</td><td class="spec-value">${s.Value || s.value || '-'}</td></tr>`).join('')}
                        </table>
                    </div>

                    <div class="action-buttons d-flex gap-3 mb-5">
                        <button class="btn-primary-whatsapp flex-grow-1" onclick="window.orderOnWhatsApp('${productIdDisplay}', '${name}')">
                            <i class="fa-brands fa-whatsapp me-2"></i> GET A QUOTE
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <div class="accordion-item shadow-sm active">
                    <button class="accordion-header w-100 d-flex justify-content-between align-items-center p-3 border-0 active" style="background: #e2e8f0;" onclick="window.toggleAccordion(this)">
                        <h5 class="fw-bold mb-0" style="font-size: 1.1rem; color: #1e293b;">Details & Overview</h5>
                        <i class="fa-solid fa-chevron-up opacity-50"></i>
                    </button>
                    <div class="accordion-content p-4 bg-white" style="display: block; border-top: 1px solid #f1f5f9; max-height: 1000px; opacity: 1;">
                        <div class="description-text">${description.replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
            </div>
        `;

        // Create the file content
        let content = template
            .replace(/{{TITLE}}/g, name)
            .replace(/{{DESCRIPTION}}/g, description.substring(0, 160))
            .replace(/{{SLUG}}/g, slug)
            .replace(/{{IMAGE_URL}}/g, imageUrl)
            .replace(/<!-- BREADCRUMB_INJECTION -->/g, breadcrumbHtml)
            .replace(/<!-- DATA_INJECTION -->/g, detailsHtml);

        // Also inject the raw data as a script so interactive functions still work
        const injectionScript = `
        <script>
            window.isStaticPage = true;
            window.machineData = ${JSON.stringify(machine)};
            window.machineSpecs = ${JSON.stringify(specs)};
        </script>`;
        
        content = content.replace('</body>', `${injectionScript}</body>`);

        fs.writeFileSync(path.join(CONFIG.outputDir, fileName), content);
        generatedUrls.push(`${CONFIG.baseUrl}${fileName}`);
    }

    // 6. Update Sitemap
    console.log("Updating Sitemap...");
    const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    
    // Remove old machine URLs if any (basic logic to avoid duplicates)
    // For simplicity, we just rebuild the whole urlset content
    const baseSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://salvinindustries.in/index.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
  <url><loc>https://salvinindustries.in/about.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://salvinindustries.in/machineries.html</loc><lastmod>2026-04-02</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://salvinindustries.in/projects.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://salvinindustries.in/contact.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://salvinindustries.in/careers.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://salvinindustries.in/spares.html</loc><lastmod>2026-04-02</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://salvinindustries.in/talkwithkeval.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://salvinindustries.in/contract-packaging.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://salvinindustries.in/case-studies.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://salvinindustries.in/coaching.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://salvinindustries.in/media.html</loc><lastmod>2026-04-02</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;

    const machineUrls = generatedUrls.map(url => `  <url><loc>${url}</loc><lastmod>2026-04-02</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`).join('\n');
    
    fs.writeFileSync(sitemapPath, `${baseSitemap}\n${machineUrls}\n</urlset>`);

    console.log("Build Complete! Total files generated:", machines.length);
}

build().catch(err => {
    console.error("Build Failed:", err);
});
