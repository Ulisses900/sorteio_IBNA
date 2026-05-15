// ======================================================
// APP PRINCIPAL: MENU MOBILE E TOASTS
// ======================================================

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Menu mobile
const mobileBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showToast('Catálogo ÆTHER • Consulte via WhatsApp', 'info');
});

window.showToast = showToast;
