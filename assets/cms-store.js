(function () {
  const STORAGE_KEYS = {
    settings: 'aaia_site_settings_v1',
    news: 'aaia_news_data_v1'
  };

  const DEFAULT_SETTINGS = {
    globalLogo: '',
    homeHeroBackground: '',
    homeHeroBackgrounds: [],
    ircaiLogo: '',
    newsPlaceholderImage: '',
    partnerLogos: [],
    contentOverrides: {},
    contentOverridesI18n: {}
  };

  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function normalizePartnerLogos(value) {
    if (!Array.isArray(value)) return [];

    return value
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const src = typeof item.src === 'string' ? item.src.trim() : '';
        if (!src) return null;
        return {
          name: typeof item.name === 'string' ? item.name.trim() : 'Partner Logo',
          src
        };
      })
      .filter(Boolean);
  }

  function normalizeHeroBackgrounds(value, legacyValue) {
    const normalizeList = (items) =>
      items
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean)
        .slice(0, 3);

    if (Array.isArray(value)) {
      return normalizeList(value);
    }

    if (typeof legacyValue === 'string' && legacyValue.trim()) {
      return normalizeList([legacyValue]);
    }

    return [];
  }

  function normalizeContentOverrides(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

    const normalized = {};
    Object.keys(value).forEach((key) => {
      const safeKey = typeof key === 'string' ? key.trim() : '';
      if (!safeKey) return;
      const raw = value[key];
      if (typeof raw === 'string') {
        normalized[safeKey] = raw.replace(/\r\n/g, '\n');
      }
    });
    return normalized;
  }

  function normalizeContentOverridesI18n(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

    const normalized = {};
    Object.keys(value).forEach((key) => {
      const safeKey = typeof key === 'string' ? key.trim() : '';
      if (!safeKey) return;
      const raw = value[key];
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;

      const en = typeof raw.en === 'string' ? raw.en.replace(/\r\n/g, '\n') : '';
      const zh = typeof raw.zh === 'string' ? raw.zh.replace(/\r\n/g, '\n') : '';
      if (!en && !zh) return;

      normalized[safeKey] = { en, zh };
    });
    return normalized;
  }

  function getSettings() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings));
    if (!stored || typeof stored !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      globalLogo: typeof stored.globalLogo === 'string' ? stored.globalLogo.trim() : '',
      homeHeroBackground:
        typeof stored.homeHeroBackground === 'string' ? stored.homeHeroBackground.trim() : '',
      homeHeroBackgrounds: normalizeHeroBackgrounds(
        stored.homeHeroBackgrounds,
        stored.homeHeroBackground
      ),
      ircaiLogo: typeof stored.ircaiLogo === 'string' ? stored.ircaiLogo.trim() : '',
      newsPlaceholderImage:
        typeof stored.newsPlaceholderImage === 'string' ? stored.newsPlaceholderImage.trim() : '',
      partnerLogos: normalizePartnerLogos(stored.partnerLogos),
      contentOverrides: normalizeContentOverrides(stored.contentOverrides),
      contentOverridesI18n: normalizeContentOverridesI18n(stored.contentOverridesI18n)
    };
  }

  function saveSettings(settings) {
    const normalized = {
      ...DEFAULT_SETTINGS,
      ...(settings || {}),
      homeHeroBackgrounds: normalizeHeroBackgrounds(
        settings ? settings.homeHeroBackgrounds : [],
        settings ? settings.homeHeroBackground : ''
      ),
      partnerLogos: normalizePartnerLogos(settings ? settings.partnerLogos : []),
      contentOverrides: normalizeContentOverrides(settings ? settings.contentOverrides : {}),
      contentOverridesI18n: normalizeContentOverridesI18n(
        settings ? settings.contentOverridesI18n : {}
      )
    };

    normalized.homeHeroBackground = normalized.homeHeroBackgrounds[0] || '';
    normalized.newsPlaceholderImage =
      typeof normalized.newsPlaceholderImage === 'string'
        ? normalized.newsPlaceholderImage.trim()
        : '';

    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(normalized));
    return normalized;
  }

  function getNews() {
    const stored = safeJsonParse(localStorage.getItem(STORAGE_KEYS.news));
    return Array.isArray(stored) ? stored : null;
  }

  function saveNews(newsItems) {
    if (!Array.isArray(newsItems)) {
      throw new Error('News payload must be an array.');
    }

    localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(newsItems));
    return newsItems;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });
  }

  window.aaiaCMS = {
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    getNews,
    saveNews,
    fileToDataUrl
  };
})();
