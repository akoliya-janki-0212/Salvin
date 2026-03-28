window.SALVIN_COMPONENTS = {
    header: `

<!-- Navigation Menu -->
<header class="header">
    <div class="container nav-container">
        <div class="logo">
            <a href="index.html">
                <img src="assets/logo.png" alt="Salvin Industries Logo" style="height: 70px; width: auto; display: block;">
            </a>
        </div>

        <button class="mobile-menu-toggle" aria-label="Toggle menu">
            <i class="fa-solid fa-bars"></i>
        </button>

        <nav class="main-nav">
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">Journey</a></li>
                <li><a href="machineries.html">Machineries</a></li>
                <li><a href="projects.html">Project</a></li>
                <li><a href="contract-packaging.html">Contract packaging</a></li>
                <li><a href="spares.html">120 Min Spares</a></li>
                <li><a href="talkwithkeval.html">Talk with Keval</a></li>
                <li><a href="careers.html">Careers</a></li>
                <li><a href="contact.html" class="btn btn-secondary nav-cta cta-trigger">Contact us</a></li>
            </ul>
        </nav>
    </div>
</header>
`,
    footer: `
<footer class="footer">
    <div class="container footer-container">
        <div class="footer-brand">
            <p class="mt-1 text-white" style="font-weight: 600;">Turnkey Solutions in Processing & Packaging</p>
            <p class="mt-1 text-light-dim">Moving your factory from daily messes to a business that grows on its own.
            </p>
            <div class="contact-details mt-3 text-light-dim" style="font-size: 0.9rem;">
                <p class="mb-1 text-light-dim"><i class="fa-solid fa-location-dot me-2"></i> 210, Arved Transcube Mall, Bandhu Nagar, Vijay Nagar, Ranip, Ahmedabad, Gujarat 382480</p>
                <p class="mb-1 text-light-dim"><i class="fa-solid fa-phone me-2"></i> +91 90239 79663 | +91 97127 77034 | +91 97126 77034</p>
                <p class="mb-1 text-light-dim"><i class="fa-solid fa-envelope me-2"></i> info.salvinindustries@gmail.com</p>
            </div>
            <div class="social-icons mt-3">
                <a href="https://www.facebook.com/profile.php?id=61558509921435#" target="_blank"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="https://linkedin.com/company/salvinindustries" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
                <a href="https://www.instagram.com/salvinindustriesindia?igsh=OTY4M3k5Y3Jjcmxu" target="_blank"><i class="fa-brands fa-instagram"></i></a>
            </div>
        </div>
        <div class="footer-links">
            <h4>Navigation</h4>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">Journey</a></li>
                <li><a href="talkwithkeval.html">Talk with Keval</a></li>
                <li><a href="careers.html">Careers</a></li>
                <li><a href="contact.html">Contact Us</a></li>
            </ul>
        </div>
        <div class="footer-links">
            <h4>Services</h4>
            <ul>
                <li><a href="projects.html">Turnkey Project</a></li>
                <li><a href="machineries.html">Machineries</a></li>
                <li><a href="contract-packaging.html">Contract Packaging</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2026 Salvin Industries. Engineered for Industrial Excellence.</p>
    </div>
</footer>

<!-- WhatsApp Floating Button -->
<a href="https://wa.me/919023979663" target="_blank" class="whatsapp-float" aria-label="Chat on WhatsApp">
    <i class="fa-brands fa-whatsapp"></i>
</a>
`,
    popup: `
<div id="bada-style-popup" class="modal-overlay" style="display: none;">
    <div class="modal-content glass-morphism">
        <button class="modal-close" id="closePopupBtn">&times;</button>
        <div class="modal-header">
            <h3>Secure Your Strategic Business Review</h3>
            <p>Direct advisory for factory owners & industrial leaders looking to eliminate operational chaos with <strong>Salvin Industries</strong>.</p>
        </div>

        <form id="popupForm" action="https://formspree.io/f/mlgpkkjj" method="POST">
            <div class="form-group">
                <input type="text" name="company_name" required placeholder="Company Name" class="input-light">
            </div>
            <div class="form-group">
                <input type="text" name="contact_person" required placeholder="Contact Person Name" class="input-light">
            </div>
            <div class="form-group">
                <input type="email" name="email" required placeholder="Official Email ID" class="input-light">
            </div>
            <div class="form-group">
                <input type="tel" name="mobile" required placeholder="Mobile Number"
                    class="input-light">
            </div>

            <div class="form-group">
                <select name="inquiry_for" required class="input-light">
                    <option value="" disabled selected>Inquiry For</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Machine">Machine</option>
                    <option value="Turnkey Project">Turnkey Project</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="form-group">
                <textarea name="description" placeholder="Description / Message" class="input-light" 
                    style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px; height:80px;"></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-block mt-3">Request Immediate Consultation <i
                    class="fa-solid fa-paper-plane"></i></button>
            <p id="popupSuccessMessage" class="success-message"
                style="display: none; color: #28a745; margin-top: 10px; font-weight: 600; text-align:center;">Strategic
                insight requested. Check your WhatsApp shortly.</p>
        </form>
    </div>
</div>
`
};
