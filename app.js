// A Taste of Well-Being — App Logic

const CATEGORIES = ['All', 'Juices & Teas', 'Salads', 'Gruels & Grains', 'Curries & Subzis', 'Kuzhambus', 'Ekadashi Dinner', 'Tiffins & Chutneys', 'Snacks & Sweets'];
const TIMINGS = ['Morning', 'Evening', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Anytime'];

let activeFilter = 'All';
let searchQuery = '';

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
  grid.innerHTML = '';

  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  filtered.forEach(r => {
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
    card.querySelector('.card-btn').addEventListener('click', () => openModal(r.id));
    card.addEventListener('click', (e) => { if (!e.target.classList.contains('card-btn')) openModal(r.id); });
    grid.appendChild(card);
  });
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
        <div class="modal-section-title">💡 Tips & Variations</div>
        <ul class="tips-list">
          ${r.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
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

// Init
document.addEventListener('DOMContentLoaded', () => {
  buildFilters();
  renderGrid();
  buildGlossary();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGrid();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
