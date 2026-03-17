(function () {
  const AUTH_KEY = 'aaia_portal_auth_v1';
  const AUTH_USER_KEY = 'aaia_portal_auth_user_v1';
  const USERS_KEY = 'aaia_portal_users_v1';
  const LEGACY_DEFAULT_USERNAME = 'admin';
  const LEGACY_DEFAULT_PASSWORD = 'admin123';

  function buildOverviewText(contentList, fallbackText) {
    const fallback = typeof fallbackText === 'string' ? fallbackText.trim() : '';
    const firstParagraph =
      Array.isArray(contentList) && contentList.length ? String(contentList[0] || '').trim() : '';
    const source = fallback || firstParagraph;
    if (!source) return '';
    const maxLength = 190;
    return source.length > maxLength ? `${source.slice(0, maxLength - 3).trim()}...` : source;
  }

  function normalizeParagraphs(value) {
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(/\n{2,}/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }

    return [];
  }

  function cloneNewsItem(item, index) {
    const safeSlug = typeof item.slug === 'string' && item.slug.trim() ? item.slug.trim() : `news-item-${index + 1}`;
    const titleEn = typeof item.title === 'string' ? item.title.trim() : '';
    const titleZh = typeof item.titleZh === 'string' ? item.titleZh.trim() : '';
    const safeTitle = titleEn || titleZh || 'Untitled News';
    const safeDate = typeof item.date === 'string' && item.date.trim() ? item.date.trim() : new Date().toISOString().slice(0, 10);
    const contentListEn = normalizeParagraphs(item.content);
    const contentListZh = normalizeParagraphs(item.contentZh);
    const excerptEn = typeof item.excerpt === 'string' ? item.excerpt.trim() : '';
    const excerptZh = typeof item.excerptZh === 'string' ? item.excerptZh.trim() : '';
    const safeExcerpt = buildOverviewText(contentListEn, excerptEn || excerptZh);
    const safeExcerptZh = buildOverviewText(contentListZh, excerptZh);

    return {
      slug: safeSlug,
      title: safeTitle,
      titleZh,
      date: safeDate,
      excerpt: safeExcerpt,
      excerptZh: safeExcerptZh,
      content: contentListEn,
      contentZh: contentListZh,
      quote: typeof item.quote === 'string' ? item.quote.trim() : '',
      quoteZh: typeof item.quoteZh === 'string' ? item.quoteZh.trim() : '',
      image: typeof item.image === 'string' ? item.image.trim() : '',
      heroImage: typeof item.heroImage === 'string' ? item.heroImage.trim() : '',
      gallery: Array.isArray(item.gallery)
        ? item.gallery.map((entry) => String(entry || '').trim()).filter(Boolean)
        : [],
      category: typeof item.category === 'string' ? item.category.trim() : '',
      readTime: typeof item.readTime === 'string' ? item.readTime.trim() : '',
      featured: Boolean(item.featured)
    };
  }

  function sortNewsByDate(newsItems) {
    return newsItems.slice().sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      const aSafe = Number.isNaN(aDate) ? 0 : aDate;
      const bSafe = Number.isNaN(bDate) ? 0 : bDate;
      return bSafe - aSafe;
    });
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function setStatus(node, message, type) {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('success', 'error');
    if (type) node.classList.add(type);
  }

  function formatDateForMeta(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue || '';
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getContentSchema() {
    return Array.isArray(window.AAIA_CONTENT_SCHEMA) ? window.AAIA_CONTENT_SCHEMA : [];
  }

  function getContentDefaultMap() {
    if (window.aaiaContentUtils && typeof window.aaiaContentUtils.getDefaultMap === 'function') {
      return window.aaiaContentUtils.getDefaultMap();
    }

    return getContentSchema().reduce((acc, entry) => {
      if (!entry || typeof entry !== 'object') return acc;
      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      if (!key) return acc;
      acc[key] = typeof entry.default === 'string' ? entry.default : '';
      return acc;
    }, {});
  }

  function normalizeUsername(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  function normalizePortalUserRecord(value) {
    if (!value || typeof value !== 'object') return null;

    const username = normalizeUsername(value.username);
    const password = typeof value.password === 'string' ? value.password.trim() : '';
    if (!username || !password) return null;

    return {
      username,
      password,
      createdAt:
        typeof value.createdAt === 'string' && value.createdAt.trim()
          ? value.createdAt
          : new Date().toISOString()
    };
  }

  function savePortalUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadPortalUsers() {
    let parsed = [];
    try {
      parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (error) {
      parsed = [];
    }

    const users = Array.isArray(parsed)
      ? parsed.map((entry) => normalizePortalUserRecord(entry)).filter(Boolean)
      : [];

    if (users.length) {
      return users;
    }

    const fallbackUsers = [
      {
        username: LEGACY_DEFAULT_USERNAME,
        password: LEGACY_DEFAULT_PASSWORD,
        createdAt: new Date().toISOString()
      }
    ];
    savePortalUsers(fallbackUsers);
    return fallbackUsers;
  }

  const state = {
    settings:
      window.aaiaCMS && typeof window.aaiaCMS.getSettings === 'function'
        ? window.aaiaCMS.getSettings()
        : {
            globalLogo: '',
            homeHeroBackground: '',
            homeHeroBackgrounds: [],
            ircaiLogo: '',
            newsPlaceholderImage: '',
            partnerLogos: [],
            contentOverrides: {},
            contentOverridesI18n: {}
          },
    users: loadPortalUsers(),
    news: [],
    editingSlug: null,
    draftImages: {
      image: '',
      heroImage: '',
      gallery: []
    }
  };

  const storedNews =
    window.aaiaCMS && typeof window.aaiaCMS.getNews === 'function' ? window.aaiaCMS.getNews() : null;
  const initialNews = Array.isArray(storedNews) && storedNews.length ? storedNews : window.aaiaNews || [];
  state.news = sortNewsByDate(initialNews.map((item, index) => cloneNewsItem(item, index)));
  if (!state.settings.contentOverrides || typeof state.settings.contentOverrides !== 'object') {
    state.settings.contentOverrides = {};
  }
  if (!state.settings.contentOverridesI18n || typeof state.settings.contentOverridesI18n !== 'object') {
    state.settings.contentOverridesI18n = {};
  }

  const loginView = document.querySelector('[data-login-view]');
  const dashboardView = document.querySelector('[data-dashboard-view]');
  const loginForm = document.querySelector('[data-login-form]');
  const loginStatus = document.querySelector('[data-login-status]');
  const logoutButton = document.querySelector('[data-logout]');

  const brandingStatus = document.querySelector('[data-branding-status]');
  const saveBrandingButton = document.querySelector('[data-save-branding]');
  const saveIrcaiButton = document.querySelector('[data-save-ircai]');
  const ircaiStatus = document.querySelector('[data-ircai-status]');
  const heroBackgroundUploadInput = document.querySelector('[data-upload-multi="homeHeroBackgrounds"]');
  const heroBackgroundPreviewGrid = document.querySelector('[data-preview-group="homeHeroBackgrounds"]');
  const clearHeroBackgroundsButton = document.querySelector('[data-clear-group="homeHeroBackgrounds"]');

  const partnerUploadInput = document.querySelector('[data-partner-upload]');
  const addPartnerLogosButton = document.querySelector('[data-add-partner-logos]');
  const clearPartnerLogosButton = document.querySelector('[data-clear-partner-logos]');
  const savePartnerLogosButton = document.querySelector('[data-save-partner-logos]');
  const partnerEditor = document.querySelector('[data-partner-logo-editor]');
  const partnerStatus = document.querySelector('[data-partner-status]');

  const newsForm = document.querySelector('[data-news-form]');
  const newsEditorSection = document.querySelector('[data-news-editor]');
  const openNewsFormButton = document.querySelector('[data-open-news-form]');
  const closeNewsFormButton = document.querySelector('[data-close-news-form]');
  const newsStatus = document.querySelector('[data-news-status]');
  const newsListNode = document.querySelector('[data-news-list]');
  const featuredNewsSelect = document.querySelector('[data-featured-news-select]');
  const applyFeaturedNewsButton = document.querySelector('[data-apply-featured-news]');
  const featuredNewsStatus = document.querySelector('[data-featured-news-status]');
  const newsListSearchInput = document.querySelector('[data-news-list-search]');
  const resetNewsFormButton = document.querySelector('[data-reset-news-form]');
  const generateSlugButton = document.querySelector('[data-generate-slug]');

  const fieldTitleEn = document.querySelector('#news-title-en');
  const fieldTitleZh = document.querySelector('#news-title-zh');
  const fieldSlug = document.querySelector('#news-slug');
  const fieldDate = document.querySelector('#news-date');
  const fieldFeatured = document.querySelector('#news-featured');
  const fieldContentEn = document.querySelector('#news-content-en');
  const fieldContentZh = document.querySelector('#news-content-zh');
  const fieldQuoteEn = document.querySelector('#news-quote-en');
  const fieldQuoteZh = document.querySelector('#news-quote-zh');
  const fieldCategory = document.querySelector('#news-category');
  const fieldReadTime = document.querySelector('#news-read-time');

  const imageUploadInput = document.querySelector('[data-news-upload="image"]');
  const heroUploadInput = document.querySelector('[data-news-upload="heroImage"]');
  const generateCardFromHeroButton = document.querySelector('[data-generate-card-from-hero]');
  const galleryUploadInput = document.querySelector('[data-news-gallery-upload]');
  const imagePreview = document.querySelector('[data-news-preview="image"]');
  const heroPreview = document.querySelector('[data-news-preview="heroImage"]');
  const galleryPreview = document.querySelector('[data-news-gallery-preview]');
  const contentForm = document.querySelector('[data-content-form]');
  const contentFieldsNode = document.querySelector('[data-content-fields]');
  const contentStatus = document.querySelector('[data-content-status]');
  const contentSearchInput = document.querySelector('[data-content-search]');
  const contentResetButton = document.querySelector('[data-content-reset]');
  const currentUserNode = document.querySelector('[data-current-user]');
  const addUserForm = document.querySelector('[data-add-user-form]');
  const addUserStatus = document.querySelector('[data-add-user-status]');
  const changePasswordForm = document.querySelector('[data-change-password-form]');
  const changePasswordStatus = document.querySelector('[data-change-password-status]');
  const userListNode = document.querySelector('[data-user-list]');
  const userListStatus = document.querySelector('[data-user-list-status]');
  const exportCmsButton = document.querySelector('[data-export-cms]');
  const importCmsFileInput = document.querySelector('[data-import-cms-file]');
  const importCmsButton = document.querySelector('[data-import-cms]');
  const importExportStatus = document.querySelector('[data-import-export-status]');

  function showLoginView() {
    if (loginView) loginView.hidden = false;
    if (dashboardView) dashboardView.hidden = true;
  }

  function showDashboardView() {
    if (loginView) loginView.hidden = true;
    if (dashboardView) dashboardView.hidden = false;
  }

  function findPortalUser(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) return null;
    return state.users.find((user) => user.username === normalized) || null;
  }

  function getAuthenticatedUsername() {
    return normalizeUsername(sessionStorage.getItem(AUTH_USER_KEY) || '');
  }

  function renderCurrentUser() {
    if (!currentUserNode) return;
    const username = getAuthenticatedUsername();
    currentUserNode.textContent = username || '-';
  }

  function setAuthenticatedSession(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) return;
    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(AUTH_USER_KEY, normalized);
    renderCurrentUser();
  }

  function clearAuthenticatedSession() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    renderCurrentUser();
  }

  function isAuthenticated() {
    if (sessionStorage.getItem(AUTH_KEY) !== 'true') return false;
    const username = getAuthenticatedUsername();
    if (!username) return false;
    return Boolean(findPortalUser(username));
  }

  function saveSettingsWithStatus(statusNode, successMessage) {
    try {
      window.aaiaCMS.saveSettings(state.settings);
      setStatus(statusNode, successMessage, 'success');
    } catch (error) {
      setStatus(statusNode, 'Save failed. Image payload may be too large for local storage.', 'error');
    }
  }

  function getDeployBundle() {
    return {
      version: 'aaia-cms-bundle-v1',
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      news: state.news
    };
  }

  function triggerJsonDownload(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function exportDeployBundle() {
    try {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      triggerJsonDownload(`aaia-console-export-${stamp}.json`, getDeployBundle());
      setStatus(
        importExportStatus,
        'Export complete. Put the downloaded JSON file inside your AAIA Website folder before sharing.',
        'success'
      );
    } catch (error) {
      setStatus(importExportStatus, 'Export failed. Please try again.', 'error');
    }
  }

  async function importDeployBundle() {
    if (!importCmsFileInput) return;
    const file = importCmsFileInput.files && importCmsFileInput.files[0];
    if (!file) {
      setStatus(importExportStatus, 'Please choose a JSON file first.', 'error');
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        setStatus(importExportStatus, 'Invalid JSON structure.', 'error');
        return;
      }

      const importedSettings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
      const importedNews = Array.isArray(parsed.news) ? parsed.news : [];

      const normalizedSettings = window.aaiaCMS.saveSettings(importedSettings);
      const normalizedNews = sortNewsByDate(
        importedNews.map((item, index) => cloneNewsItem(item, index))
      );
      ensureSingleFeatured(normalizedNews);
      window.aaiaCMS.saveNews(normalizedNews);

      state.settings = normalizedSettings;
      state.news = normalizedNews;

      renderSinglePreview('globalLogo');
      renderHeroBackgroundPreviews();
      renderSinglePreview('ircaiLogo');
      renderSinglePreview('newsPlaceholderImage');
      renderContentEditor();
      renderPartnerLogoEditor();
      renderNewsList();
      renderFeaturedNewsSelector();
      renderCurrentUser();
      renderUserList();
      resetNewsForm();
      setNewsEditorVisibility(false);

      importCmsFileInput.value = '';
      setStatus(importExportStatus, 'Import complete. Website content and media have been restored.', 'success');
    } catch (error) {
      setStatus(importExportStatus, 'Import failed. Ensure this is a valid AAIA console export JSON.', 'error');
    }
  }

  function applyPortalHeaderLogo() {
    const logoImages = document.querySelectorAll('[data-portal-logo-image]');
    const logoFallbacks = document.querySelectorAll('[data-portal-logo-fallback]');
    if (!logoImages.length && !logoFallbacks.length) return;

    const customLogo = typeof state.settings.globalLogo === 'string' ? state.settings.globalLogo.trim() : '';

    logoImages.forEach((node) => {
      if (customLogo) {
        node.src = customLogo;
        node.hidden = false;
      } else {
        node.hidden = true;
        node.removeAttribute('src');
      }
    });

    logoFallbacks.forEach((node) => {
      node.hidden = Boolean(customLogo);
    });
  }

  function renderSinglePreview(key) {
    const previewNode = document.querySelector(`[data-preview="${key}"]`);
    if (!previewNode) {
      if (key === 'globalLogo') applyPortalHeaderLogo();
      return;
    }

    const src = typeof state.settings[key] === 'string' ? state.settings[key].trim() : '';
    if (!src) {
      previewNode.hidden = true;
      previewNode.removeAttribute('src');
      if (key === 'globalLogo') applyPortalHeaderLogo();
      return;
    }

    previewNode.src = src;
    previewNode.hidden = false;
    if (key === 'globalLogo') applyPortalHeaderLogo();
  }

  function renderHeroBackgroundPreviews() {
    if (!heroBackgroundPreviewGrid) return;

    const images = Array.isArray(state.settings.homeHeroBackgrounds)
      ? state.settings.homeHeroBackgrounds
      : [];

    if (!images.length) {
      heroBackgroundPreviewGrid.innerHTML =
        '<p class="portal-instruction compact">No custom hero photos uploaded. Default rotating hero will be used.</p>';
      return;
    }

    heroBackgroundPreviewGrid.innerHTML = images
      .map(
        (src, index) =>
          `<figure class="multi-upload-item"><img src="${src}" alt="Home hero photo ${index + 1}" /><figcaption>Photo ${index + 1}</figcaption></figure>`
      )
      .join('');
  }

  async function onSingleUploadChange(event) {
    const input = event.currentTarget;
    const key = input.dataset.uploadSingle;
    if (!key) return;

    const file = input.files && input.files[0];
    if (!file) return;

    try {
      const dataUrl = await window.aaiaCMS.fileToDataUrl(file);
      state.settings[key] = dataUrl;
      renderSinglePreview(key);
      setStatus(brandingStatus, 'File selected. Click Save Branding Settings to publish.', 'success');
      setStatus(ircaiStatus, 'File selected. Click Save IRCAI & Placeholder Media to publish.', 'success');
      input.value = '';
    } catch (error) {
      setStatus(brandingStatus, 'Could not read selected file.', 'error');
      setStatus(ircaiStatus, 'Could not read selected file.', 'error');
    }
  }

  async function onHeroBackgroundsUploadChange(event) {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);

    if (!files.length) return;
    if (files.length > 3) {
      setStatus(brandingStatus, 'Please select up to 3 hero photos only.', 'error');
      input.value = '';
      return;
    }

    try {
      const nextImages = [];
      for (const file of files) {
        nextImages.push(await window.aaiaCMS.fileToDataUrl(file));
      }

      state.settings.homeHeroBackgrounds = nextImages;
      state.settings.homeHeroBackground = nextImages[0] || '';
      renderHeroBackgroundPreviews();
      setStatus(brandingStatus, 'Hero photos selected. Click Save Branding Settings to publish.', 'success');
      input.value = '';
    } catch (error) {
      setStatus(brandingStatus, 'Could not read one or more selected hero photos.', 'error');
    }
  }

  function onSingleClearClick(event) {
    const button = event.currentTarget;
    const key = button.dataset.clearSingle;
    if (!key) return;

    state.settings[key] = '';
    renderSinglePreview(key);
    setStatus(brandingStatus, 'Cleared. Click Save Branding Settings to publish.', 'success');
    setStatus(ircaiStatus, 'Cleared. Click Save IRCAI & Placeholder Media to publish.', 'success');
  }

  function onHeroBackgroundsClearClick() {
    state.settings.homeHeroBackgrounds = [];
    state.settings.homeHeroBackground = '';
    renderHeroBackgroundPreviews();
    setStatus(brandingStatus, 'Hero photos cleared. Click Save Branding Settings to publish.', 'success');
  }

  function getContentOverrideMap() {
    return state.settings &&
      typeof state.settings.contentOverrides === 'object' &&
      state.settings.contentOverrides
      ? state.settings.contentOverrides
      : {};
  }

  function getContentOverrideMapI18n() {
    return state.settings &&
      typeof state.settings.contentOverridesI18n === 'object' &&
      state.settings.contentOverridesI18n
      ? state.settings.contentOverridesI18n
      : {};
  }

  function getContentOverridePair(key, defaultValue) {
    const overrides = getContentOverrideMap();
    const overridesI18n = getContentOverrideMapI18n();
    const localized =
      Object.prototype.hasOwnProperty.call(overridesI18n, key) && overridesI18n[key]
        ? overridesI18n[key]
        : null;

    const enFromLegacy =
      Object.prototype.hasOwnProperty.call(overrides, key) && typeof overrides[key] === 'string'
        ? overrides[key]
        : '';
    const enValue =
      localized && typeof localized.en === 'string' && localized.en.trim()
        ? localized.en
        : enFromLegacy || defaultValue;
    const zhValue =
      localized && typeof localized.zh === 'string' && localized.zh.trim() ? localized.zh : '';

    return {
      en: enValue,
      zh: zhValue
    };
  }

  function setContentGroupExpanded(groupNode, expanded) {
    if (!groupNode) return;

    const toggle = groupNode.querySelector('[data-content-group-toggle]');
    const body = groupNode.querySelector('[data-content-group-body]');
    if (!toggle || !body) return;

    const isExpanded = Boolean(expanded);
    body.hidden = !isExpanded;
    toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    groupNode.classList.toggle('is-expanded', isExpanded);
  }

  function renderContentEditor() {
    if (!contentFieldsNode) return;

    const schema = getContentSchema();
    if (!schema.length) {
      contentFieldsNode.innerHTML =
        '<p class="portal-instruction compact">Content schema is not available. Please ensure content schema script is loaded.</p>';
      return;
    }

    const grouped = schema.reduce((acc, entry) => {
      if (!entry || typeof entry !== 'object') return acc;
      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      if (!key) return acc;
      const groupName =
        typeof entry.group === 'string' && entry.group.trim() ? entry.group.trim() : 'Other Text';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(entry);
      return acc;
    }, {});

    contentFieldsNode.innerHTML = Object.keys(grouped)
      .map((groupName, groupIndex) => {
        const fields = grouped[groupName]
          .map((entry) => {
            const key = entry.key.trim();
            const defaultValue = typeof entry.default === 'string' ? entry.default : '';
            const valuePair = getContentOverridePair(key, defaultValue);
            const rows = entry.multiline || defaultValue.length > 120 ? 4 : 2;
            const searchIndex = `${groupName} ${entry.label || key} ${key} english traditional chinese`.toLowerCase();

            return `
              <div class="field-wrap content-field" data-content-item data-content-searchable="${escapeHtml(searchIndex)}">
                <label for="content-${escapeHtml(key)}-en">${escapeHtml(entry.label || key)}</label>
                <div class="content-i18n-grid">
                  <div class="content-lang-block">
                    <p class="content-lang-label">Eng</p>
                    <textarea
                      class="textarea content-input"
                      id="content-${escapeHtml(key)}-en"
                      rows="${rows}"
                      data-content-input-key="${escapeHtml(key)}"
                      data-content-lang="en"
                    >${escapeHtml(valuePair.en)}</textarea>
                  </div>
                  <div class="content-lang-block">
                    <p class="content-lang-label">繁體中文</p>
                    <textarea
                      class="textarea content-input"
                      id="content-${escapeHtml(key)}-zh"
                      rows="${rows}"
                      data-content-input-key="${escapeHtml(key)}"
                      data-content-lang="zh"
                    >${escapeHtml(valuePair.zh)}</textarea>
                  </div>
                </div>
                <p class="content-meta"><code>${escapeHtml(key)}</code></p>
              </div>
            `;
          })
          .join('');

        const bodyId = `content-group-body-${groupIndex}`;

        return `
          <section class="content-group" data-content-group>
            <button
              class="content-group-toggle"
              type="button"
              data-content-group-toggle
              aria-expanded="false"
              aria-controls="${escapeHtml(bodyId)}"
            >
              <span>${escapeHtml(groupName)}</span>
              <span class="content-group-toggle-icon" aria-hidden="true"></span>
            </button>
            <div class="content-group-grid" id="${escapeHtml(bodyId)}" data-content-group-body hidden>
              ${fields}
            </div>
          </section>
        `;
      })
      .join('');

    contentFieldsNode.querySelectorAll('[data-content-group]').forEach((groupNode) => {
      setContentGroupExpanded(groupNode, false);
    });

    if (contentSearchInput && contentSearchInput.value.trim()) {
      filterContentFields();
    }
  }

  function saveContentOverrides() {
    if (!contentFieldsNode) return;

    const defaults = getContentDefaultMap();
    const nextOverrides = {};
    const nextOverridesI18n = {};
    const valuesByKey = {};

    contentFieldsNode.querySelectorAll('[data-content-input-key][data-content-lang]').forEach((input) => {
      const key = String(input.getAttribute('data-content-input-key') || '').trim();
      const lang = String(input.getAttribute('data-content-lang') || '').trim();
      if (!key || (lang !== 'en' && lang !== 'zh')) return;

      if (!valuesByKey[key]) {
        valuesByKey[key] = { en: '', zh: '' };
      }
      valuesByKey[key][lang] = String(input.value || '').replace(/\r\n/g, '\n');
    });

    Object.keys(valuesByKey).forEach((key) => {
      const defaultValue = Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : '';
      const en = valuesByKey[key].en || '';
      const zh = valuesByKey[key].zh || '';
      const hasCustomEn = en !== defaultValue;
      const hasCustomZh = Boolean(zh.trim());

      if (hasCustomEn) {
        nextOverrides[key] = en;
      }

      if (hasCustomEn || hasCustomZh) {
        nextOverridesI18n[key] = {
          en: hasCustomEn ? en : '',
          zh: hasCustomZh ? zh : ''
        };
      }
    });

    state.settings.contentOverrides = nextOverrides;
    state.settings.contentOverridesI18n = nextOverridesI18n;
    saveSettingsWithStatus(contentStatus, 'Frontend text settings saved. Refresh the website to view updates.');
  }

  function filterContentFields() {
    if (!contentFieldsNode || !contentSearchInput) return;

    const keyword = contentSearchInput.value.trim().toLowerCase();
    contentFieldsNode.querySelectorAll('[data-content-item]').forEach((node) => {
      const searchIndex = String(node.getAttribute('data-content-searchable') || '');
      const isMatch = !keyword || searchIndex.includes(keyword);
      node.hidden = !isMatch;
    });

    contentFieldsNode.querySelectorAll('.content-group').forEach((groupNode) => {
      const visibleItems = groupNode.querySelectorAll('[data-content-item]:not([hidden])');
      const hasVisibleItems = visibleItems.length > 0;
      groupNode.hidden = !hasVisibleItems;

      if (keyword) {
        setContentGroupExpanded(groupNode, hasVisibleItems);
      }
    });
  }

  function resetContentOverrides() {
    const confirmed = window.confirm(
      'Reset all frontend UI text to defaults? This will remove all text overrides.'
    );
    if (!confirmed) return;

    state.settings.contentOverrides = {};
    state.settings.contentOverridesI18n = {};
    renderContentEditor();
    saveSettingsWithStatus(contentStatus, 'Frontend text has been reset to default values.');
  }

  function renderPartnerLogoEditor() {
    if (!partnerEditor) return;

    const logos = Array.isArray(state.settings.partnerLogos) ? state.settings.partnerLogos : [];
    if (!logos.length) {
      partnerEditor.innerHTML = '<p class="portal-instruction compact">No partner logos uploaded yet.</p>';
      return;
    }

    partnerEditor.innerHTML = logos
      .map(
        (logo, index) => `
          <div class="partner-logo-item">
            <img src="${logo.src}" alt="${logo.name || 'Partner logo'}" />
            <input class="input" type="text" value="${logo.name || ''}" data-partner-name-index="${index}" />
            <button class="btn btn-outline-plain" type="button" data-remove-partner-index="${index}">Remove</button>
          </div>
        `
      )
      .join('');
  }

  async function addPartnerLogos() {
    if (!partnerUploadInput) return;

    const files = Array.from(partnerUploadInput.files || []);
    if (!files.length) {
      setStatus(partnerStatus, 'Select at least one logo file first.', 'error');
      return;
    }

    const nextLogos = Array.isArray(state.settings.partnerLogos)
      ? state.settings.partnerLogos.slice()
      : [];

    try {
      for (const file of files) {
        const src = await window.aaiaCMS.fileToDataUrl(file);
        const fileName = file.name.replace(/\.[^/.]+$/, '').trim();
        nextLogos.push({
          name: fileName || 'Partner Logo',
          src
        });
      }

      state.settings.partnerLogos = nextLogos;
      renderPartnerLogoEditor();
      partnerUploadInput.value = '';
      saveSettingsWithStatus(partnerStatus, 'Partner logos saved. Refresh the home page to view updates.');
    } catch (error) {
      setStatus(partnerStatus, 'Could not read one or more selected files.', 'error');
    }
  }

  function resetNewsDraftImages() {
    state.draftImages = {
      image: '',
      heroImage: '',
      gallery: []
    };
  }

  function setNewsEditorVisibility(isVisible) {
    if (!newsEditorSection) return;
    newsEditorSection.hidden = !isVisible;
  }

  function renderNewsImagePreview(key) {
    const node = key === 'image' ? imagePreview : heroPreview;
    if (!node) return;

    const src = state.draftImages[key];
    if (!src) {
      node.hidden = true;
      node.removeAttribute('src');
      return;
    }

    node.src = src;
    node.hidden = false;
  }

  function renderGalleryPreview() {
    if (!galleryPreview) return;

    if (!state.draftImages.gallery.length) {
      galleryPreview.innerHTML = '';
      return;
    }

    galleryPreview.innerHTML = state.draftImages.gallery
      .map((src, index) => `<img src="${src}" alt="Gallery preview ${index + 1}" />`)
      .join('');
  }

  function fillNewsForm(item) {
    setNewsEditorVisibility(true);
    state.editingSlug = item.slug;
    if (fieldTitleEn) fieldTitleEn.value = item.title || '';
    if (fieldTitleZh) fieldTitleZh.value = item.titleZh || '';
    if (fieldSlug) fieldSlug.value = item.slug;
    if (fieldDate) fieldDate.value = item.date;
    if (fieldFeatured) fieldFeatured.value = item.featured ? 'true' : 'false';
    if (fieldContentEn) fieldContentEn.value = Array.isArray(item.content) ? item.content.join('\n\n') : '';
    if (fieldContentZh) fieldContentZh.value = Array.isArray(item.contentZh) ? item.contentZh.join('\n\n') : '';
    if (fieldQuoteEn) fieldQuoteEn.value = item.quote || '';
    if (fieldQuoteZh) fieldQuoteZh.value = item.quoteZh || '';
    if (fieldCategory) fieldCategory.value = item.category || '';
    if (fieldReadTime) fieldReadTime.value = item.readTime || '';

    state.draftImages.image = item.image || '';
    state.draftImages.heroImage = item.heroImage || '';
    state.draftImages.gallery = Array.isArray(item.gallery) ? item.gallery.slice() : [];

    renderNewsImagePreview('image');
    renderNewsImagePreview('heroImage');
    renderGalleryPreview();

    const previewTitle = item.title || item.titleZh || item.slug;
    setStatus(newsStatus, `Editing entry: ${previewTitle}`, 'success');
    if (newsForm) {
      newsForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetNewsForm() {
    if (newsForm) newsForm.reset();
    state.editingSlug = null;
    resetNewsDraftImages();
    renderNewsImagePreview('image');
    renderNewsImagePreview('heroImage');
    renderGalleryPreview();

    if (fieldFeatured) fieldFeatured.value = 'false';
    if (fieldDate) fieldDate.value = new Date().toISOString().slice(0, 10);

    setStatus(newsStatus, '', null);
  }

  function openNewsFormForCreate() {
    resetNewsForm();
    setNewsEditorVisibility(true);
    setStatus(newsStatus, 'Creating new entry. Fill in required fields and save.', 'success');
    if (newsEditorSection) {
      newsEditorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function closeNewsFormEditor() {
    resetNewsForm();
    setNewsEditorVisibility(false);
  }

  function ensureSingleFeatured(newsItems) {
    const featuredIndex = newsItems.findIndex((item) => item.featured);
    if (featuredIndex === -1 && newsItems.length) {
      newsItems[0].featured = true;
      return;
    }

    newsItems.forEach((item, index) => {
      item.featured = index === featuredIndex;
    });
  }

  function getNewsDisplayTitle(item) {
    const titleEn = typeof item.title === 'string' ? item.title.trim() : '';
    const titleZh = typeof item.titleZh === 'string' ? item.titleZh.trim() : '';
    if (titleEn && titleZh && titleEn !== titleZh) return `${titleEn} / ${titleZh}`;
    return titleEn || titleZh || item.slug;
  }

  function renderFeaturedNewsSelector() {
    if (!featuredNewsSelect) return;

    if (!state.news.length) {
      featuredNewsSelect.innerHTML = '<option value="">No news available</option>';
      featuredNewsSelect.disabled = true;
      if (applyFeaturedNewsButton) applyFeaturedNewsButton.disabled = true;
      if (featuredNewsStatus) setStatus(featuredNewsStatus, '', null);
      return;
    }

    const featuredItem = state.news.find((item) => item.featured) || state.news[0];
    featuredNewsSelect.innerHTML = state.news
      .map((item) => {
        const label = getNewsDisplayTitle(item);
        return `<option value="${escapeHtml(item.slug)}">${escapeHtml(label)}</option>`;
      })
      .join('');
    featuredNewsSelect.value = featuredItem.slug;
    featuredNewsSelect.disabled = false;
    if (applyFeaturedNewsButton) applyFeaturedNewsButton.disabled = false;
  }

  function applyFeaturedNewsSelection() {
    if (!featuredNewsSelect || !featuredNewsSelect.value) {
      setStatus(featuredNewsStatus, 'Please select a news item first.', 'error');
      return;
    }

    const slug = featuredNewsSelect.value;
    const target = state.news.find((entry) => entry.slug === slug);
    if (!target) {
      setStatus(featuredNewsStatus, 'Selected news was not found.', 'error');
      return;
    }

    state.news = state.news.map((entry) => ({
      ...entry,
      featured: entry.slug === slug
    }));

    ensureSingleFeatured(state.news);
    if (!saveNewsEntries()) return;

    renderNewsList();
    renderFeaturedNewsSelector();
    setStatus(featuredNewsStatus, `Featured news updated: ${getNewsDisplayTitle(target)}`, 'success');
  }

  function renderNewsList() {
    if (!newsListNode) return;

    const searchKeyword = newsListSearchInput ? newsListSearchInput.value.trim().toLowerCase() : '';
    const filteredNews = state.news.filter((item) => {
      if (!searchKeyword) return true;

      const titleEn = typeof item.title === 'string' ? item.title : '';
      const titleZh = typeof item.titleZh === 'string' ? item.titleZh : '';
      const slug = typeof item.slug === 'string' ? item.slug : '';
      const dateRaw = typeof item.date === 'string' ? item.date : '';
      const dateDisplay = formatDateForMeta(item.date);
      const haystack = `${titleEn} ${titleZh} ${slug} ${dateRaw} ${dateDisplay}`.toLowerCase();
      return haystack.includes(searchKeyword);
    });

    if (!state.news.length) {
      newsListNode.innerHTML = '<p class="portal-instruction compact">No news entries yet.</p>';
      return;
    }

    if (!filteredNews.length) {
      newsListNode.innerHTML =
        '<p class="portal-instruction compact">No entries match your search.</p>';
      return;
    }

    newsListNode.innerHTML = filteredNews
      .map(
        (item) => {
          const titleDisplay = getNewsDisplayTitle(item);
          const encodedSlug = encodeURIComponent(item.slug);

          return `
            <article class="news-item">
              <div>
                <p class="news-item-title">${escapeHtml(titleDisplay)}</p>
                <p class="news-item-meta">${escapeHtml(formatDateForMeta(item.date))} | slug: ${escapeHtml(item.slug)}${
                  item.featured ? ' | featured' : ''
                }</p>
              </div>
              <div class="news-item-actions">
                <button class="btn btn-outline-plain" type="button" data-news-edit="${encodedSlug}">Edit</button>
                <button class="btn btn-outline-plain" type="button" data-news-delete="${encodedSlug}">Delete</button>
              </div>
            </article>
          `;
        }
      )
      .join('');
  }

  async function handleNewsImageUpload(event) {
    const input = event.currentTarget;
    const key = input.dataset.newsUpload;
    if (!key) return;

    const file = input.files && input.files[0];
    if (!file) return;

    try {
      const src = await window.aaiaCMS.fileToDataUrl(file);
      state.draftImages[key] = src;
      renderNewsImagePreview(key);
      setStatus(newsStatus, 'Image selected. Save News Entry to publish changes.', 'success');
      input.value = '';
    } catch (error) {
      setStatus(newsStatus, 'Could not read selected image.', 'error');
    }
  }

  function generateCardImageFromHero() {
    const heroSource = typeof state.draftImages.heroImage === 'string' ? state.draftImages.heroImage : '';
    if (!heroSource) {
      setStatus(newsStatus, 'Upload a hero photo first, then use "Use Hero as Card Photo".', 'error');
      return;
    }

    state.draftImages.image = heroSource;
    renderNewsImagePreview('image');
    setStatus(newsStatus, 'Card photo updated from hero photo. Save News Entry to publish changes.', 'success');
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.currentTarget.files || []);
    if (!files.length) return;

    try {
      const images = [];
      for (const file of files) {
        images.push(await window.aaiaCMS.fileToDataUrl(file));
      }
      state.draftImages.gallery = images;
      renderGalleryPreview();
      setStatus(newsStatus, 'Gallery selected. Save News Entry to publish changes.', 'success');
      event.currentTarget.value = '';
    } catch (error) {
      setStatus(newsStatus, 'Could not read gallery image files.', 'error');
    }
  }

  function clearNewsImage(key) {
    state.draftImages[key] = '';
    renderNewsImagePreview(key);
    setStatus(newsStatus, 'Image cleared. Save News Entry to publish changes.', 'success');
  }

  function saveNewsEntries() {
    try {
      window.aaiaCMS.saveNews(state.news);
      return true;
    } catch (error) {
      setStatus(newsStatus, 'Save failed. News payload may exceed browser storage limit.', 'error');
      return false;
    }
  }

  function handleNewsSubmit(event) {
    event.preventDefault();

    const titleEn = fieldTitleEn ? fieldTitleEn.value.trim() : '';
    const titleZh = fieldTitleZh ? fieldTitleZh.value.trim() : '';
    const slugInput = fieldSlug ? fieldSlug.value.trim() : '';
    const generatedSlug = slugify(slugInput || titleEn || titleZh);
    const slug = generatedSlug || `news-${Date.now()}`;
    const date = fieldDate ? fieldDate.value.trim() : '';
    const contentRawEn = fieldContentEn ? fieldContentEn.value.trim() : '';
    const contentRawZh = fieldContentZh ? fieldContentZh.value.trim() : '';
    const contentEn = normalizeParagraphs(contentRawEn);
    const contentZh = normalizeParagraphs(contentRawZh);

    if ((!titleEn && !titleZh) || !slug || !date || (!contentEn.length && !contentZh.length)) {
      setStatus(
        newsStatus,
        'Please fill slug/date and at least one language for title and overview/body content.',
        'error'
      );
      return;
    }

    const duplicate = state.news.find(
      (entry) => entry.slug === slug && entry.slug !== state.editingSlug
    );
    if (duplicate) {
      setStatus(newsStatus, 'Slug already exists. Please use a unique slug.', 'error');
      return;
    }

    const excerptEn = buildOverviewText(contentEn, '');
    const excerptZh = buildOverviewText(contentZh, '');

    const item = {
      slug,
      title: titleEn || titleZh,
      titleZh,
      date,
      excerpt: excerptEn || excerptZh,
      excerptZh,
      content: contentEn.length ? contentEn : contentZh,
      contentZh,
      quote: fieldQuoteEn ? fieldQuoteEn.value.trim() : (fieldQuoteZh ? fieldQuoteZh.value.trim() : ''),
      quoteZh: fieldQuoteZh ? fieldQuoteZh.value.trim() : '',
      image: state.draftImages.image,
      heroImage: state.draftImages.heroImage,
      gallery: state.draftImages.gallery.slice(),
      category: fieldCategory ? fieldCategory.value.trim() : '',
      readTime: fieldReadTime ? fieldReadTime.value.trim() : '',
      featured: fieldFeatured ? fieldFeatured.value === 'true' : false
    };

    if (state.editingSlug) {
      state.news = state.news.map((entry) => (entry.slug === state.editingSlug ? item : entry));
    } else {
      state.news.unshift(item);
    }

    if (item.featured) {
      state.news = state.news.map((entry) => ({
        ...entry,
        featured: entry.slug === item.slug
      }));
    }

    state.news = sortNewsByDate(state.news);
    ensureSingleFeatured(state.news);

    if (!saveNewsEntries()) return;

    renderNewsList();
    renderFeaturedNewsSelector();
    resetNewsForm();
    setNewsEditorVisibility(false);
    setStatus(newsStatus, '', null);
  }

  function handleNewsListClick(event) {
    const editButton = event.target.closest('[data-news-edit]');
    if (editButton) {
      const slug = decodeURIComponent(editButton.getAttribute('data-news-edit') || '');
      const target = state.news.find((entry) => entry.slug === slug);
      if (target) fillNewsForm(target);
      return;
    }

    const deleteButton = event.target.closest('[data-news-delete]');
    if (deleteButton) {
      const slug = decodeURIComponent(deleteButton.getAttribute('data-news-delete') || '');
      const target = state.news.find((entry) => entry.slug === slug);
      if (!target) return;

      const targetTitle = target.title || target.titleZh || target.slug;
      const confirmed = window.confirm(`Delete news entry "${targetTitle}"?`);
      if (!confirmed) return;

      state.news = state.news.filter((entry) => entry.slug !== slug);
      ensureSingleFeatured(state.news);

      if (!saveNewsEntries()) return;

      renderNewsList();
      renderFeaturedNewsSelector();
      if (state.editingSlug === slug) {
        resetNewsForm();
      }
      setStatus(newsStatus, 'News entry deleted.', 'success');
    }
  }

  function renderUserList() {
    if (!userListNode) return;

    if (!state.users.length) {
      userListNode.innerHTML = '<p class="portal-instruction compact">No portal users configured.</p>';
      return;
    }

    const currentUsername = getAuthenticatedUsername();
    const sortedUsers = state.users
      .slice()
      .sort((a, b) => a.username.localeCompare(b.username));

    userListNode.innerHTML = sortedUsers
      .map((user) => {
        const isCurrent = user.username === currentUsername;
        const encodedUsername = encodeURIComponent(user.username);
        return `
          <article class="user-item">
            <div>
              <p class="news-item-title">${escapeHtml(user.username)}${isCurrent ? ' (current)' : ''}</p>
              <p class="news-item-meta">Created ${escapeHtml(formatDateForMeta(user.createdAt))}</p>
            </div>
            <div class="news-item-actions">
              <button
                class="btn btn-outline-plain"
                type="button"
                data-user-delete="${encodedUsername}"
                ${isCurrent ? 'disabled title="Current account cannot be deleted."' : ''}
              >
                Delete
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function handleUserListClick(event) {
    const deleteButton = event.target.closest('[data-user-delete]');
    if (!deleteButton) return;

    const username = normalizeUsername(
      decodeURIComponent(deleteButton.getAttribute('data-user-delete') || '')
    );
    if (!username) return;

    const target = findPortalUser(username);
    if (!target) {
      setStatus(userListStatus, 'User not found.', 'error');
      return;
    }

    const currentUsername = getAuthenticatedUsername();
    if (target.username === currentUsername) {
      setStatus(userListStatus, 'Current logged-in user cannot be deleted.', 'error');
      return;
    }

    if (state.users.length <= 1) {
      setStatus(userListStatus, 'At least one portal user is required.', 'error');
      return;
    }

    const confirmed = window.confirm(`Delete portal user "${target.username}"?`);
    if (!confirmed) return;

    state.users = state.users.filter((entry) => entry.username !== target.username);

    if (!savePortalUsers(state.users)) {
      state.users = loadPortalUsers();
      renderUserList();
      setStatus(userListStatus, 'Delete failed. User list could not be stored.', 'error');
      return;
    }

    renderUserList();
    setStatus(userListStatus, `User "${target.username}" deleted.`, 'success');
  }

  function handleAddUserSubmit(event) {
    event.preventDefault();
    if (!addUserForm) return;

    const formData = new FormData(addUserForm);
    const username = normalizeUsername(formData.get('username'));
    const password = String(formData.get('password') || '').trim();
    const confirmPassword = String(formData.get('confirm_password') || '').trim();

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      setStatus(
        addUserStatus,
        'Username must be 3-32 characters and use letters, numbers, dot, underscore, or hyphen.',
        'error'
      );
      return;
    }

    if (password.length < 6) {
      setStatus(addUserStatus, 'Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setStatus(addUserStatus, 'Password confirmation does not match.', 'error');
      return;
    }

    if (findPortalUser(username)) {
      setStatus(addUserStatus, 'Username already exists.', 'error');
      return;
    }

    state.users.push({
      username,
      password,
      createdAt: new Date().toISOString()
    });

    if (!savePortalUsers(state.users)) {
      state.users = loadPortalUsers();
      setStatus(addUserStatus, 'Save failed. User list could not be stored.', 'error');
      renderUserList();
      return;
    }

    addUserForm.reset();
    renderUserList();
    setStatus(addUserStatus, `User "${username}" added.`, 'success');
  }

  function handleChangePasswordSubmit(event) {
    event.preventDefault();
    if (!changePasswordForm) return;

    const currentUsername = getAuthenticatedUsername();
    const currentUser = findPortalUser(currentUsername);
    if (!currentUser) {
      setStatus(changePasswordStatus, 'Current user was not found. Please log in again.', 'error');
      return;
    }

    const formData = new FormData(changePasswordForm);
    const currentPassword = String(formData.get('current_password') || '').trim();
    const newPassword = String(formData.get('new_password') || '').trim();
    const confirmPassword = String(formData.get('confirm_new_password') || '').trim();

    if (currentUser.password !== currentPassword) {
      setStatus(changePasswordStatus, 'Current password is incorrect.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      setStatus(changePasswordStatus, 'New password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus(changePasswordStatus, 'New password confirmation does not match.', 'error');
      return;
    }

    currentUser.password = newPassword;

    if (!savePortalUsers(state.users)) {
      setStatus(changePasswordStatus, 'Save failed. Password could not be updated.', 'error');
      return;
    }

    changePasswordForm.reset();
    setStatus(changePasswordStatus, 'Password updated successfully.', 'success');
  }

  function bindEvents() {
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const username = normalizeUsername(formData.get('username'));
        const password = String(formData.get('password') || '').trim();
        const user = findPortalUser(username);

        if (user && user.password === password) {
          setAuthenticatedSession(user.username);
          setStatus(loginStatus, '', null);
          showDashboardView();
          renderUserList();
          return;
        }

        setStatus(loginStatus, 'Invalid username or password.', 'error');
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        clearAuthenticatedSession();
        if (loginForm) loginForm.reset();
        showLoginView();
      });
    }

    if (addUserForm) {
      addUserForm.addEventListener('submit', handleAddUserSubmit);
    }

    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
    }

    if (userListNode) {
      userListNode.addEventListener('click', handleUserListClick);
    }

    if (exportCmsButton) {
      exportCmsButton.addEventListener('click', exportDeployBundle);
    }

    if (importCmsButton) {
      importCmsButton.addEventListener('click', importDeployBundle);
    }

    document.querySelectorAll('[data-upload-single]').forEach((input) => {
      input.addEventListener('change', onSingleUploadChange);
    });

    if (heroBackgroundUploadInput) {
      heroBackgroundUploadInput.addEventListener('change', onHeroBackgroundsUploadChange);
    }

    document.querySelectorAll('[data-clear-single]').forEach((button) => {
      button.addEventListener('click', onSingleClearClick);
    });

    if (clearHeroBackgroundsButton) {
      clearHeroBackgroundsButton.addEventListener('click', onHeroBackgroundsClearClick);
    }

    if (saveBrandingButton) {
      saveBrandingButton.addEventListener('click', () => {
        saveSettingsWithStatus(brandingStatus, 'Branding settings saved. Refresh the website to view updates.');
      });
    }

    if (saveIrcaiButton) {
      saveIrcaiButton.addEventListener('click', () => {
        saveSettingsWithStatus(
          ircaiStatus,
          'IRCAI and news placeholder media saved. Refresh website pages to view updates.'
        );
      });
    }

    if (contentForm) {
      contentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveContentOverrides();
      });
    }

    if (contentSearchInput) {
      contentSearchInput.addEventListener('input', filterContentFields);
    }

    if (contentFieldsNode) {
      contentFieldsNode.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-content-group-toggle]');
        if (!toggle) return;

        const groupNode = toggle.closest('[data-content-group]');
        if (!groupNode) return;

        const currentlyExpanded = toggle.getAttribute('aria-expanded') === 'true';
        setContentGroupExpanded(groupNode, !currentlyExpanded);
      });
    }

    if (contentResetButton) {
      contentResetButton.addEventListener('click', resetContentOverrides);
    }

    if (addPartnerLogosButton) {
      addPartnerLogosButton.addEventListener('click', addPartnerLogos);
    }

    if (clearPartnerLogosButton) {
      clearPartnerLogosButton.addEventListener('click', () => {
        state.settings.partnerLogos = [];
        renderPartnerLogoEditor();
        saveSettingsWithStatus(partnerStatus, 'Partner logos cleared. Refresh the home page to view updates.');
      });
    }

    if (savePartnerLogosButton) {
      savePartnerLogosButton.addEventListener('click', () => {
        saveSettingsWithStatus(partnerStatus, 'Partner logo library saved. Refresh the home page to view updates.');
      });
    }

    if (partnerEditor) {
      partnerEditor.addEventListener('input', (event) => {
        const input = event.target.closest('[data-partner-name-index]');
        if (!input) return;
        const index = Number(input.getAttribute('data-partner-name-index'));
        if (!Number.isInteger(index)) return;
        if (!state.settings.partnerLogos[index]) return;
        state.settings.partnerLogos[index].name = input.value.trim() || 'Partner Logo';
      });

      partnerEditor.addEventListener('click', (event) => {
        const removeButton = event.target.closest('[data-remove-partner-index]');
        if (!removeButton) return;
        const index = Number(removeButton.getAttribute('data-remove-partner-index'));
        if (!Number.isInteger(index)) return;
        state.settings.partnerLogos.splice(index, 1);
        renderPartnerLogoEditor();
        saveSettingsWithStatus(partnerStatus, 'Partner logo removed. Refresh the home page to view updates.');
      });

      partnerEditor.addEventListener('change', (event) => {
        const input = event.target.closest('[data-partner-name-index]');
        if (!input) return;
        saveSettingsWithStatus(partnerStatus, 'Partner logo label saved. Refresh the home page to view updates.');
      });
    }

    if (imageUploadInput) {
      imageUploadInput.addEventListener('change', handleNewsImageUpload);
    }

    if (heroUploadInput) {
      heroUploadInput.addEventListener('change', handleNewsImageUpload);
    }

    if (generateCardFromHeroButton) {
      generateCardFromHeroButton.addEventListener('click', generateCardImageFromHero);
    }

    if (galleryUploadInput) {
      galleryUploadInput.addEventListener('change', handleGalleryUpload);
    }

    document.querySelectorAll('[data-clear-news-image]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-clear-news-image');
        if (!key) return;
        clearNewsImage(key);
      });
    });

    const clearGalleryButton = document.querySelector('[data-clear-news-gallery]');
    if (clearGalleryButton) {
      clearGalleryButton.addEventListener('click', () => {
        state.draftImages.gallery = [];
        renderGalleryPreview();
        setStatus(newsStatus, 'Gallery cleared. Save News Entry to publish changes.', 'success');
      });
    }

    if (generateSlugButton) {
      generateSlugButton.addEventListener('click', () => {
        if (!fieldSlug) return;
        const sourceTitle = fieldTitleEn && fieldTitleEn.value.trim()
          ? fieldTitleEn.value.trim()
          : fieldTitleZh && fieldTitleZh.value.trim()
            ? fieldTitleZh.value.trim()
            : '';
        fieldSlug.value = slugify(sourceTitle) || fieldSlug.value || `news-${Date.now()}`;
      });
    }

    if (newsForm) {
      newsForm.addEventListener('submit', handleNewsSubmit);
    }

    if (resetNewsFormButton) {
      resetNewsFormButton.addEventListener('click', () => {
        resetNewsForm();
        setStatus(newsStatus, 'Form reset. Continue editing this draft.', 'success');
      });
    }

    if (openNewsFormButton) {
      openNewsFormButton.addEventListener('click', openNewsFormForCreate);
    }

    if (closeNewsFormButton) {
      closeNewsFormButton.addEventListener('click', closeNewsFormEditor);
    }

    if (newsListNode) {
      newsListNode.addEventListener('click', handleNewsListClick);
    }

    if (applyFeaturedNewsButton) {
      applyFeaturedNewsButton.addEventListener('click', applyFeaturedNewsSelection);
    }

    if (featuredNewsSelect) {
      featuredNewsSelect.addEventListener('change', () => {
        if (featuredNewsStatus) setStatus(featuredNewsStatus, '', null);
      });
    }

    if (newsListSearchInput) {
      newsListSearchInput.addEventListener('input', renderNewsList);
    }
  }

  function initDashboard() {
    renderSinglePreview('globalLogo');
    renderHeroBackgroundPreviews();
    renderSinglePreview('ircaiLogo');
    renderSinglePreview('newsPlaceholderImage');
    renderContentEditor();
    renderPartnerLogoEditor();
    renderNewsList();
    renderFeaturedNewsSelector();
    renderCurrentUser();
    renderUserList();
    resetNewsForm();
    setNewsEditorVisibility(false);
  }

  function init() {
    bindEvents();
    initDashboard();

    if (isAuthenticated()) {
      renderCurrentUser();
      showDashboardView();
    } else {
      clearAuthenticatedSession();
      showLoginView();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
