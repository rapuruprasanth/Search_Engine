/* ==========================================================================
   Prasanthi Algo Search Engine - Sherwin-Williams Theme JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    category: 'all',
    difficulty: 'all',
    limit: 20,
    bookmarks: JSON.parse(localStorage.getItem('algo_bookmarks') || '[]'),
    currentDoc: null,
  };

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const clearBtn = document.getElementById('clear-btn');
  const autocompleteBox = document.getElementById('autocomplete-box');
  const resultsGrid = document.getElementById('results-grid');
  const resultsCountEl = document.getElementById('results-count-num');
  const limitSelect = document.getElementById('limit-select');
  const randomBtn = document.getElementById('random-btn');
  const bookmarkBtn = document.getElementById('toggle-bookmarks-btn');
  const bookmarkCountEl = document.getElementById('bookmark-count');
  
  const problemModal = document.getElementById('problem-modal');
  const mathModal = document.getElementById('math-modal');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerBody = document.getElementById('drawer-body');

  updateBookmarkCount();

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Search Input & Autocomplete
  let autocompleteTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

      clearTimeout(autocompleteTimeout);
      if (val.length >= 2) {
        autocompleteTimeout = setTimeout(() => fetchSuggestions(val), 200);
      } else {
        hideAutocomplete();
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideAutocomplete();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      hideAutocomplete();
      searchInput.focus();
    });
  }

  async function fetchSuggestions(term) {
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        renderAutocomplete(data.suggestions);
      } else {
        hideAutocomplete();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function renderAutocomplete(suggestions) {
    if (!autocompleteBox) return;
    autocompleteBox.innerHTML = suggestions.map(s => `
      <div class="autocomplete-row" data-term="${s}">
        <span><i class="fas fa-search" style="color: var(--sw-river-rock); margin-right: 8px;"></i> ${s}</span>
        <span style="font-size: 0.72rem; color: var(--sw-river-rock); font-family: var(--font-mono);">Vocab Match</span>
      </div>
    `).join('');

    autocompleteBox.style.display = 'block';

    autocompleteBox.querySelectorAll('.autocomplete-row').forEach(row => {
      row.addEventListener('click', () => {
        searchInput.value = row.getAttribute('data-term');
        hideAutocomplete();
        searchForm.submit();
      });
    });
  }

  function hideAutocomplete() {
    if (autocompleteBox) autocompleteBox.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    if (autocompleteBox && !autocompleteBox.contains(e.target) && e.target !== searchInput) {
      hideAutocomplete();
    }
  });

  // Sidebar Category Item Filter
  document.querySelectorAll('.sidebar-link[data-category]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link[data-category]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      state.category = link.getAttribute('data-category');
      filterAndRender();
    });
  });

  // Sidebar Difficulty Item Filter
  document.querySelectorAll('.sidebar-link[data-difficulty]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link[data-difficulty]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      state.difficulty = link.getAttribute('data-difficulty');
      filterAndRender();
    });
  });

  if (limitSelect) {
    limitSelect.addEventListener('change', (e) => {
      state.limit = parseInt(e.target.value, 10);
      filterAndRender();
    });
  }

  // Random Problem ("I'm Feeling Lucky")
  if (randomBtn) {
    randomBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/random');
        const data = await res.json();
        if (data.doc_id) {
          openProblemModal(data.doc_id, data.title);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function filterAndRender() {
    const cards = Array.from(document.querySelectorAll('.burgundy-card, .sw-card'));
    let count = 0;

    cards.forEach(card => {
      const categoryStr = card.getAttribute('data-category') || '';
      const difficultyStr = card.getAttribute('data-difficulty') || '';

      const matchCat = state.category === 'all' || categoryStr.includes(state.category);
      const matchDiff = state.difficulty === 'all' || difficultyStr === state.difficulty;

      if (matchCat && matchDiff && count < state.limit) {
        card.style.display = 'block';
        count++;
      } else {
        card.style.display = 'none';
      }
    });

    if (resultsCountEl) resultsCountEl.textContent = count;
  }

  // Problem Details Modal
  window.openProblemModal = async function(docId, title) {
    state.currentDoc = { id: docId, title };
    const modalTitle = document.getElementById('problem-modal-title');
    const modalBody = document.getElementById('problem-modal-body');
    
    if (modalTitle) modalTitle.textContent = `#${docId} - ${title || 'Problem Details'}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--sw-river-rock);">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p style="margin-top: 12px; font-size: 0.9rem;">Fetching problem details...</p>
        </div>
      `;
    }

    if (problemModal) problemModal.classList.add('active');

    try {
      const res = await fetch(`/api/problem/${docId}`);
      const data = await res.json();
      renderProblemModalContent(data);
    } catch (err) {
      if (modalBody) modalBody.innerHTML = `<p style="color: var(--sw-river-rock);">Failed to load problem statement.</p>`;
    }
  };

  function renderProblemModalContent(data) {
    const modalBody = document.getElementById('problem-modal-body');
    if (!modalBody) return;

    const formattedText = escapeHtml(data.content || 'No description available.')
      .replace(/Example (\d+):/g, '<strong style="color: var(--sw-river-rock); display: block; margin-top: 14px;">Example $1:</strong>')
      .replace(/Input:/g, '<span style="color: var(--text-white); font-weight: 600;">Input:</span>')
      .replace(/Output:/g, '<span style="color: var(--sw-river-rock); font-weight: 600;">Output:</span>')
      .replace(/Constraints:/g, '<strong style="color: var(--sw-river-rock); display: block; margin-top: 14px;">Constraints:</strong>');

    modalBody.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-medium); padding-bottom: 10px;">
        <button class="action-btn primary" onclick="switchTab(this, 'desc-tab')"><i class="fas fa-file-alt"></i> Problem Statement</button>
        <button class="action-btn" onclick="switchTab(this, 'code-tab')"><i class="fas fa-code"></i> Python Template</button>
      </div>

      <div id="desc-tab">
        <div style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap;">${formattedText}</div>
        <div style="margin-top: 20px; text-align: right;">
          <a href="${data.url}" target="_blank" class="action-btn primary" style="display: inline-flex; text-decoration: none;">
            <i class="fas fa-external-link-alt"></i> Open on LeetCode
          </a>
        </div>
      </div>

      <div id="code-tab" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 0.8rem; color: var(--text-dim);">Starter Code Boilerplate:</span>
          <button class="action-btn primary" onclick="copyCode()"><i class="fas fa-copy"></i> Copy Code</button>
        </div>
        <pre style="background: var(--bg-pitch); border: 1.5px solid var(--border-medium); border-radius: 8px; padding: 14px; font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.85rem; overflow-x: auto;" id="code-block"><code># ${data.title || 'Solution Template'}
class Solution:
    def solve(self, nums: List[int]) -> any:
        # TODO: Implement algorithm logic
        pass</code></pre>
      </div>
    `;
  }

  window.switchTab = function(btn, tabId) {
    btn.parentElement.querySelectorAll('button').forEach(b => b.className = 'action-btn');
    btn.className = 'action-btn primary';
    document.getElementById('desc-tab').style.display = tabId === 'desc-tab' ? 'block' : 'none';
    document.getElementById('code-tab').style.display = tabId === 'code-tab' ? 'block' : 'none';
  };

  window.copyCode = function() {
    const codeEl = document.getElementById('code-block');
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.textContent);
      alert('Template code copied to clipboard!');
    }
  };

  // TF-IDF Math Modal
  window.openMathModal = function(score, matchedTerms, docId) {
    const mathBody = document.getElementById('math-modal-body');
    if (!mathBody) return;

    const termsList = (matchedTerms || '').split(',').filter(t => t);
    const tableRows = termsList.map(term => {
      const idf = (Math.log((1 + 2181) / (1 + 50))).toFixed(4);
      const tf = (1 / 45).toFixed(4);
      const prod = (tf * idf).toFixed(4);
      return `
        <tr>
          <td><strong style="color: var(--sw-river-rock);">${term}</strong></td>
          <td>${tf}</td>
          <td>${idf}</td>
          <td><span style="color: var(--text-white); font-weight: 700;">${prod}</span></td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="4">No direct term matches available</td></tr>`;

    mathBody.innerHTML = `
      <div style="background: var(--bg-card); border: 1.5px solid var(--border-medium); padding: 14px; border-radius: 8px; text-align: center; font-family: var(--font-mono); color: var(--sw-river-rock); font-size: 0.9rem; margin-bottom: 16px;">
        $$\\text{Score}(d, Q) = \\frac{1}{|Q|} \\sum_{t \\in Q} TF(t, d) \\times IDF(t)$$
      </div>
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 14px;">
        Document <strong>#${docId}</strong> calculated relevance score is <strong style="color: var(--sw-river-rock);">${parseFloat(score).toFixed(5)}</strong>.
      </p>
      <table style="width: 100%; border-collapse: collapse; background: var(--bg-card); border: 1px solid var(--border-medium); border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-medium); background: var(--bg-sidebar);">
            <th style="padding: 10px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim);">Query Term</th>
            <th style="padding: 10px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim);">TF</th>
            <th style="padding: 10px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim);">IDF</th>
            <th style="padding: 10px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim);">Product</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;

    if (mathModal) mathModal.classList.add('active');
  };

  // Close Modals
  document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.classList.contains('modal-close-btn') || el.classList.contains('drawer-close')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  });

  // Bookmarks
  window.toggleBookmark = function(docId, title, url) {
    const idx = state.bookmarks.findIndex(b => b.id === docId);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push({ id: docId, title, url });
    }

    localStorage.setItem('algo_bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarkCount();
    renderBookmarksDrawer();
  };

  function updateBookmarkCount() {
    if (bookmarkCountEl) bookmarkCountEl.textContent = state.bookmarks.length;
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      renderBookmarksDrawer();
      if (drawerOverlay) drawerOverlay.classList.add('active');
    });
  }

  function renderBookmarksDrawer() {
    if (!drawerBody) return;
    if (state.bookmarks.length === 0) {
      drawerBody.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 30px 0;">No saved problems yet.</p>`;
      return;
    }

    drawerBody.innerHTML = state.bookmarks.map(b => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-medium); padding: 10px 14px; border-radius: 8px; margin-bottom: 8px;">
        <div>
          <span class="doc-id-pill">#${b.id}</span>
          <a href="${b.url}" target="_blank" style="color: var(--text-white); text-decoration: none; font-weight: 600; font-size: 0.88rem; margin-left: 6px;">${escapeHtml(b.title)}</a>
        </div>
        <button class="action-btn" onclick="toggleBookmark(${b.id}, '', '')"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // User Authentication Logic
  const authModal = document.getElementById('auth-modal');
  const authHeaderWrapper = document.getElementById('auth-header-wrapper');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authAlert = document.getElementById('auth-alert');

  initAuth();

  async function initAuth() {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        renderUserBadge(data.user);
      } else {
        renderAuthButton();
      }
    } catch (err) {
      renderAuthButton();
    }
  }

  function renderAuthButton() {
    if (!authHeaderWrapper) return;
    authHeaderWrapper.innerHTML = `
      <button type="button" class="nav-action-btn primary" id="open-auth-btn">
        <i class="fas fa-user-lock"></i> Login
      </button>
    `;
    const openBtn = document.getElementById('open-auth-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        showAuthModal('login');
      });
    }
  }

  function renderUserBadge(user) {
    if (!authHeaderWrapper) return;
    authHeaderWrapper.innerHTML = `
      <div class="user-profile-badge">
        <i class="fas fa-user-circle" style="color: var(--sw-river-rock);"></i>
        <span>${escapeHtml(user.username)}</span>
        <button id="logout-btn" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    `;
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logoutUser);
    }
  }

  function showAuthModal(defaultTab = 'login') {
    if (authAlert) authAlert.style.display = 'none';
    if (authModal) authModal.classList.add('active');
    switchAuthTab(defaultTab);
  }

  function switchAuthTab(tab) {
    if (tab === 'login') {
      if (tabLoginBtn) tabLoginBtn.classList.add('active');
      if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    } else {
      if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
      if (tabLoginBtn) tabLoginBtn.classList.remove('active');
      if (registerForm) registerForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    }
    if (authAlert) authAlert.style.display = 'none';
  }

  if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
  if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

  document.querySelectorAll('.auth-close').forEach(btn => {
    btn.addEventListener('click', () => {
      if (authModal) authModal.classList.remove('active');
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login_id = document.getElementById('login-id').value.trim();
      const password = document.getElementById('login-password').value.trim();

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login_id, password })
        });
        const data = await res.json();
        if (data.success) {
          showAuthAlert(data.message, 'success');
          setTimeout(() => {
            if (authModal) authModal.classList.remove('active');
            renderUserBadge(data.user);
          }, 800);
        } else {
          showAuthAlert(data.message || 'Login failed', 'error');
        }
      } catch (err) {
        showAuthAlert('Network error during login', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.success) {
          showAuthAlert(data.message, 'success');
          setTimeout(() => {
            if (authModal) authModal.classList.remove('active');
            renderUserBadge(data.user);
          }, 800);
        } else {
          showAuthAlert(data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        showAuthAlert('Network error during registration', 'error');
      }
    });
  }

  async function logoutUser() {
    try {
      await fetch('/api/logout', { method: 'POST' });
      renderAuthButton();
    } catch (err) {
      console.error(err);
    }
  }

  function showAuthAlert(msg, type) {
    if (!authAlert) return;
    authAlert.textContent = msg;
    authAlert.className = `auth-alert-banner ${type}`;
    authAlert.style.display = 'block';
  }
});

