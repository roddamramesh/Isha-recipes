// A Taste of Well-Being — App Logic

const CATEGORIES = ['All', 'Juices & Teas', 'Salads', 'Salad Dressings', 'Gruels & Grains', 'Curries & Subzis', 'Kuzhambus', 'Ekadashi Dinner', 'Tiffins & Chutneys', 'Snacks & Sweets'];
const PAGE_SIZE = 10;

let activeFilter = 'All';
let searchQuery = '';
let currentPage = 1;

function getTagClass(tag) {
  const map = {
    'Morning': 'tag-morning', 'Evening': 'tag-evening', 'Anytime': 'tag-anytime',
    'Breakfast': 'tag-breakfast', 'Lunch': 'tag-lunch', 'Dinner': 'tag-dinner',
    'Snack': 'tag-snack', 'Ekadashi': 'tag-ekadashi'
  };
  return map[tag] || 'tag-anytime';
}

function buildFilters() {
  const row = document.getElementById('filterRow');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      currentPage = 1;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    });
    row.appendChild(btn);
  });
}

function getFilteredRecipes() {
  return RECIPES.filter(r => {
    const matchCat = activeFilter === 'All' || r.category === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      (r.ingredients && r.ingredients.some(i => i.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  });
}

function renderGrid() {
  const grid = document.getElementById('recipeGrid');
  const noResults = document.getElementById('noResults');
  const filtered = getFilteredRecipes();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // clamp page
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = '';

  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    renderPagination(0, 0);
    return;
  }
  noResults.classList.add('hidden');

  pageItems.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-emoji">${r.emoji}</span>
        <div class="card-meta">
          <div class="card-category">${r.category}</div>
          <div class="card-title">${r.title}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-tags">
          ${r.timing.map(t => `<span class="tag ${getTagClass(t)}">${t}</span>`).join('')}
          <span class="tag tag-pranic">✨ ${r.pranic}</span>
        </div>
        <p class="card-desc">${r.desc}</p>
      </div>
      <div class="card-footer">
        <span class="card-info">🍽 Serves 4 · ${r.ingredients ? r.ingredients.length : 0} ingredients</span>
        <button class="card-btn" data-id="${r.id}">View Recipe</button>
      </div>
    `;
    card.querySelector('.card-btn').addEventListener('click', (e) => { e.stopPropagation(); openModal(r.id); });
    card.addEventListener('click', () => openModal(r.id));
    grid.appendChild(card);
  });

  renderPagination(filtered.length, totalPages);
  // scroll to top of grid smoothly
  document.getElementById('recipes').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPagination(total, totalPages) {
  let pag = document.getElementById('pagination');
  if (!pag) {
    pag = document.createElement('div');
    pag.id = 'pagination';
    pag.className = 'pagination';
    document.getElementById('recipeGrid').insertAdjacentElement('afterend', pag);
  }
  pag.innerHTML = '';
  if (totalPages <= 1) return;

  const info = document.createElement('span');
  info.className = 'pag-info';
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);
  info.textContent = `Showing ${start}–${end} of ${total} recipes`;
  pag.appendChild(info);

  const controls = document.createElement('div');
  controls.className = 'pag-controls';

  // Prev
  const prev = document.createElement('button');
  prev.className = 'pag-btn' + (currentPage === 1 ? ' disabled' : '');
  prev.innerHTML = '&#8592; Prev';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderGrid(); } });
  controls.appendChild(prev);

  // Page numbers — show up to 7 buttons with ellipsis
  const pages = getPageNumbers(currentPage, totalPages);
  pages.forEach(p => {
    if (p === '...') {
      const dots = document.createElement('span');
      dots.className = 'pag-dots';
      dots.textContent = '…';
      controls.appendChild(dots);
    } else {
      const btn = document.createElement('button');
      btn.className = 'pag-btn pag-num' + (p === currentPage ? ' active' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => { currentPage = p; renderGrid(); });
      controls.appendChild(btn);
    }
  });

  // Next
  const next = document.createElement('button');
  next.className = 'pag-btn' + (currentPage === totalPages ? ' disabled' : '');
  next.innerHTML = 'Next &#8594;';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderGrid(); } });
  controls.appendChild(next);

  pag.appendChild(controls);
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', current-1, current, current+1, '...', total];
}

function openModal(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-hero">
      <div class="modal-eyebrow">${r.category}</div>
      <div class="modal-title">${r.emoji} ${r.title}</div>
      <div class="modal-tags">
        ${r.timing.map(t => `<span class="tag ${getTagClass(t)}">${t}</span>`).join('')}
        <span class="tag tag-pranic">✨ ${r.pranic}</span>
      </div>
      <p class="modal-desc">${r.desc}</p>
    </div>
    <div class="modal-body">
      <div class="modal-section">
        <div class="modal-section-title">⏰ Best Time to Have</div>
        <div class="timing-box">
          <div class="timing-item"><strong>${r.mealTime}</strong>Recommended time</div>
          <div class="timing-item"><strong>Serves 4</strong>Standard serving size</div>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">🛒 Ingredients</div>
        <ul class="ingredients-list">
          ${(r.ingredients || []).map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">👨‍🍳 Method</div>
        <ol class="steps-list">
          ${(r.steps || []).map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
      ${r.tips && r.tips.length ? `
      <div class="modal-section">
        <div class="modal-section-title">💡 Tips &amp; Variations</div>
        <ul class="tips-list">${r.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>` : ''}
      ${r.benefits ? `
      <div class="modal-section">
        <div class="modal-section-title">🌿 Health Benefits</div>
        <div class="benefits-box"><p>${r.benefits}</p></div>
      </div>` : ''}
      ${r.serving ? `
      <div class="modal-section">
        <div class="modal-section-title">🍽 Serving Suggestion</div>
        <div class="serving-box">${r.serving}</div>
      </div>` : ''}
    </div>
  `;

  document.getElementById('modalBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

function buildGlossary() {
  const grid = document.getElementById('glossaryGrid');
  if (!grid || typeof GLOSSARY === 'undefined') return;
  GLOSSARY.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glossary-card';
    card.innerHTML = `
      <h4>${item.name}</h4>
      <p>${item.desc}</p>
      <span class="glossary-benefit">✅ ${item.benefit}</span>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildFilters();
  renderGrid();
  buildGlossary();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderGrid();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
