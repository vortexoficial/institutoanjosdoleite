// 1. Ícones
lucide.createIcons();

// 2. Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loader-bar');
    if(bar) setTimeout(() => { bar.style.width = '100%'; }, 100);
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        initCarousel();
    }, 2000);
});

// 3. Menu Mobile
const mobileBtn = document.getElementById('mobile-menu-btn');
const closeMobileBtn = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('translate-x-full');
}

if(mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
if(closeMobileBtn) closeMobileBtn.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

// 4. Carrossel
const track = document.getElementById('track');
const container = document.getElementById('project-carousel');
let isDown = false, startX, scrollLeft, velX = 0, momentumID, isHovering = false;

function initCarousel() {
    if (!track || !container) return;
    const items = Array.from(track.children);
    if(items.length > 0) {
        items.forEach(item => track.appendChild(item.cloneNode(true)));
        items.forEach(item => track.appendChild(item.cloneNode(true)));
    }
    container.scrollLeft = track.scrollWidth / 4;
    requestAnimationFrame(autoScrollLoop);
}

container.addEventListener('mousedown', (e) => { isDown = true; container.classList.add('active'); startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; cancelAnimationFrame(momentumID); });
container.addEventListener('mouseleave', () => { isDown = false; container.classList.remove('active'); isHovering = false; });
container.addEventListener('mouseenter', () => isHovering = true);
container.addEventListener('mouseup', () => { isDown = false; container.classList.remove('active'); beginMomentum(); });
container.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - container.offsetLeft; const walk = (x - startX) * 1.5; container.scrollLeft = scrollLeft - walk; velX = container.scrollLeft - (scrollLeft - walk + (x - startX) * 1.5); velX = (container.scrollLeft - (scrollLeft - walk)); });
container.addEventListener('touchstart', (e) => { isDown = true; startX = e.touches[0].pageX - container.offsetLeft; scrollLeft = container.scrollLeft; cancelAnimationFrame(momentumID); isHovering = true; }, { passive: true });
container.addEventListener('touchend', () => { isDown = false; setTimeout(() => { isHovering = false; }, 2000); beginMomentum(); });
container.addEventListener('touchmove', (e) => { if (!isDown) return; const x = e.touches[0].pageX - container.offsetLeft; const walk = (x - startX) * 1.5; const prevScroll = container.scrollLeft; container.scrollLeft = scrollLeft - walk; velX = container.scrollLeft - prevScroll; }, { passive: true });

function beginMomentum() { cancelAnimationFrame(momentumID); function loop() { if (Math.abs(velX) > 0.1) { container.scrollLeft += velX; velX *= 0.95; checkInfiniteLoop(); momentumID = requestAnimationFrame(loop); } } loop(); }
container.addEventListener('scroll', checkInfiniteLoop);
function checkInfiniteLoop() { if (!track || !container) return; const maxScroll = track.scrollWidth - container.clientWidth; if (container.scrollLeft >= maxScroll - 50) { container.scrollLeft = track.scrollWidth / 3; } else if (container.scrollLeft <= 0) { container.scrollLeft = track.scrollWidth / 3 * 2; } }
function autoScrollLoop() { if(!isHovering && !isDown) { container.scrollLeft += 0.6; } requestAnimationFrame(autoScrollLoop); }

// --- 5. LÓGICA DOS MODAIS E WHATSAPP ---

// Abrir Modal
function openModal(type) {
    const modal = document.getElementById(`modal-${type}`);
    if(modal) {
        modal.classList.remove('hidden');
        // Reinicia ícones caso necessário
        lucide.createIcons();
    }
}

// Fechar Modal
function closeModal(type) {
    const modal = document.getElementById(`modal-${type}`);
    if(modal) modal.classList.add('hidden');
}

// Enviar WhatsApp Empresa
function sendWhatsappEmpresa(e) {
    e.preventDefault();
    const nome = document.getElementById('empresa-nome').value;
    const responsavel = document.getElementById('empresa-responsavel').value;
    const tipo = document.getElementById('empresa-tipo').value;

    const text = `Olá! Sou ${responsavel}, da empresa *${nome}*.\nGostaria de saber mais sobre como apoiar o Instituto Anjos do Leite.\nTipo de interesse: ${tipo}.`;
    
    const url = `https://wa.me/5513991713975?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    closeModal('empresa');
}

// Enviar WhatsApp Voluntário
function sendWhatsappVoluntario(e) {
    e.preventDefault();
    const nome = document.getElementById('voluntario-nome').value;
    const area = document.getElementById('voluntario-area').value;
    const tempo = document.getElementById('voluntario-tempo').value;

    const text = `Olá! Meu nome é *${nome}*.\nTenho interesse em ser voluntário no Instituto.\nÁrea: ${area}\nDisponibilidade: ${tempo}.`;
    
    const url = `https://wa.me/5513991713975?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    closeModal('voluntario');
}