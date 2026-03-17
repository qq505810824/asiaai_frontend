(function () {
  const DEFAULT_NEWS_PLACEHOLDER = 'assets/logos/aaia-news-placeholder.svg';
  const SUPPORTED_LANGUAGES = ['en', 'zh'];

  const DEFAULT_SITE_SETTINGS = {
    globalLogo: '',
    homeHeroBackground: '',
    homeHeroBackgrounds: [],
    ircaiLogo: '',
    newsPlaceholderImage: '',
    partnerLogos: [],
    contentOverrides: {},
    contentOverridesI18n: {}
  };

  let runtimeSettings = { ...DEFAULT_SITE_SETTINGS };

  function toLanguageCode(value) {
    if (typeof value !== 'string') return 'en';
    const safe = value.trim().toLowerCase();
    return SUPPORTED_LANGUAGES.includes(safe) ? safe : 'en';
  }

  function isNewsPageContext() {
    const body = document.body;
    if (!body) return false;
    return body.classList.contains('news-page') || body.classList.contains('news-detail-page');
  }

  function getPageLanguage(languageOverride) {
    if (typeof languageOverride === 'string' && languageOverride.trim()) {
      return toLanguageCode(languageOverride);
    }

    if (isNewsPageContext() && window.aaiaI18n && typeof window.aaiaI18n.getLanguage === 'function') {
      return toLanguageCode(window.aaiaI18n.getLanguage());
    }

    return 'en';
  }

  function getSiteSettings() {
    if (window.aaiaCMS && typeof window.aaiaCMS.getSettings === 'function') {
      return window.aaiaCMS.getSettings();
    }

    return { ...DEFAULT_SITE_SETTINGS };
  }

  function getContentOverrides(settings) {
    const source = settings && typeof settings === 'object' ? settings.contentOverrides : null;
    if (!source || typeof source !== 'object' || Array.isArray(source)) return {};

    const normalized = {};
    Object.keys(source).forEach((key) => {
      const safeKey = typeof key === 'string' ? key.trim() : '';
      if (!safeKey) return;
      const value = source[key];
      if (typeof value === 'string') {
        normalized[safeKey] = value;
      }
    });
    return normalized;
  }

  function getContentOverridesI18n(settings) {
    const source = settings && typeof settings === 'object' ? settings.contentOverridesI18n : null;
    if (!source || typeof source !== 'object' || Array.isArray(source)) return {};

    const normalized = {};
    Object.keys(source).forEach((key) => {
      const safeKey = typeof key === 'string' ? key.trim() : '';
      if (!safeKey) return;
      const value = source[key];
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;

      const en = typeof value.en === 'string' ? value.en : '';
      const zh = typeof value.zh === 'string' ? value.zh : '';
      if (!en && !zh) return;
      normalized[safeKey] = { en, zh };
    });
    return normalized;
  }

  function getContentValue(key, fallback, languageOverride) {
    const safeKey = typeof key === 'string' ? key.trim() : '';
    if (!safeKey) return fallback;

    const language = getPageLanguage(languageOverride);
    const i18nOverrides = getContentOverridesI18n(runtimeSettings);
    const localizedEntry = i18nOverrides[safeKey];
    if (localizedEntry) {
      if (language === 'zh') {
        if (typeof localizedEntry.zh === 'string' && localizedEntry.zh.trim()) return localizedEntry.zh;
        if (typeof localizedEntry.en === 'string' && localizedEntry.en.trim()) return localizedEntry.en;
      } else if (typeof localizedEntry.en === 'string' && localizedEntry.en.trim()) {
        return localizedEntry.en;
      }
    }

    const overrides = getContentOverrides(runtimeSettings);
    if (Object.prototype.hasOwnProperty.call(overrides, safeKey)) {
      return overrides[safeKey];
    }
    return fallback;
  }

  function getNewsPlaceholderImage() {
    const customPlaceholder =
      runtimeSettings && typeof runtimeSettings.newsPlaceholderImage === 'string'
        ? runtimeSettings.newsPlaceholderImage.trim()
        : '';
    return customPlaceholder || DEFAULT_NEWS_PLACEHOLDER;
  }

  function evaluateImageAutoFit(imageNode) {
    if (!imageNode || !imageNode.parentElement) return;
    const container = imageNode.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (!containerWidth || !containerHeight || !imageNode.naturalWidth || !imageNode.naturalHeight) return;

    const containerRatio = containerWidth / containerHeight;
    const imageRatio = imageNode.naturalWidth / imageNode.naturalHeight;
    const shouldContain = imageRatio > containerRatio * 1.2 || imageRatio < containerRatio * 0.68;
    imageNode.classList.toggle('media-fit-contain', shouldContain);
  }

  function applyAutoImageFit(root) {
    const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    scope.querySelectorAll('img[data-auto-fit]').forEach((imageNode) => {
      const evaluate = () => evaluateImageAutoFit(imageNode);
      if (imageNode.complete && imageNode.naturalWidth) {
        evaluate();
      } else {
        imageNode.addEventListener('load', evaluate, { once: true });
      }
    });
  }

  function applyContentOverrides(settings, languageOverride) {
    const schema = Array.isArray(window.AAIA_CONTENT_SCHEMA) ? window.AAIA_CONTENT_SCHEMA : [];
    if (!schema.length) return;

    schema.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;

      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      const selector = typeof entry.selector === 'string' ? entry.selector.trim() : '';
      const defaultValue = typeof entry.default === 'string' ? entry.default : '';
      if (!key || !selector) return;

      const value = getContentValue(key, defaultValue, languageOverride);
      const nodes = document.querySelectorAll(selector);
      if (!nodes.length) return;

      nodes.forEach((node) => {
        if (entry.type === 'html') {
          node.innerHTML = value;
          return;
        }

        if (entry.type === 'attr') {
          const attrName =
            typeof entry.attr === 'string' && entry.attr.trim() ? entry.attr.trim() : 'placeholder';
          node.setAttribute(attrName, value);
          return;
        }

        node.textContent = value;
      });
    });
  }

  function initHeader() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    const toggle = header.querySelector('[data-mobile-toggle]');
    const navLinks = header.querySelectorAll('.nav-link');
    const shouldStartTransparent = header.dataset.transparent === 'true';

    const updateHeaderState = () => {
      const scrolled = window.scrollY > 24;
      header.classList.toggle('is-scrolled', scrolled);

      if (shouldStartTransparent) {
        header.classList.toggle('transparent', !scrolled);
      }
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    if (toggle) {
      toggle.addEventListener('click', () => {
        header.classList.toggle('menu-open');
        const expanded = header.classList.contains('menu-open');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('menu-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initReveal() {
    const revealNodes = document.querySelectorAll('.reveal');
    if (!revealNodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay;
            if (delay) {
              entry.target.style.transitionDelay = delay;
            }
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
  }

  function initCountUp() {
    const counters = document.querySelectorAll('[data-count-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target;
          const target = Number(node.dataset.countTarget || '0');
          const duration = 1200;
          const prefix = node.dataset.countPrefix || '';
          const suffix = node.dataset.countSuffix || '';
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            node.textContent = `${prefix}${value}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
          observer.unobserve(node);
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function applyGlobalLogo(settings) {
    const customLogo = typeof settings.globalLogo === 'string' ? settings.globalLogo.trim() : '';
    const logoImages = document.querySelectorAll('[data-site-logo-image]');

    document.body.classList.toggle('custom-brand-logo', Boolean(customLogo));

    logoImages.forEach((imageNode) => {
      if (customLogo) {
        imageNode.src = customLogo;
        imageNode.hidden = false;
      } else {
        imageNode.removeAttribute('src');
        imageNode.hidden = true;
      }
    });
  }

  function applyHeroBackground(settings) {
    const heroMedia = document.querySelector('[data-hero-media]');
    if (!heroMedia) return;

    const customBackgrounds = Array.isArray(settings.homeHeroBackgrounds)
      ? settings.homeHeroBackgrounds
          .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
          .filter(Boolean)
          .slice(0, 3)
      : [];
    const legacyBackground =
      typeof settings.homeHeroBackground === 'string' ? settings.homeHeroBackground.trim() : '';
    const images = customBackgrounds.length ? customBackgrounds : legacyBackground ? [legacyBackground] : [];

    if (!images.length) return;

    heroMedia.innerHTML = '';
    const total = images.length;
    const cycleDuration = total === 1 ? 0 : total === 2 ? 18 : 24;

    images.forEach((source, index) => {
      const slide = document.createElement('div');
      slide.className = total === 1 ? 'hero-slide static' : 'hero-slide';
      slide.style.backgroundImage = `url("${source.replace(/"/g, '\\"')}")`;
      if (total > 1) {
        if (total === 2) {
          slide.style.animationName = 'hero-fade-duo';
        }
        slide.style.animationDuration = `${cycleDuration}s`;
        slide.style.animationDelay = `${(cycleDuration / total) * index}s`;
      }
      heroMedia.appendChild(slide);
    });
  }

  function applyIrcaiLogo(settings) {
    const logoNode = document.querySelector('[data-ircai-logo]');
    if (!logoNode) return;

    const customLogo = typeof settings.ircaiLogo === 'string' ? settings.ircaiLogo.trim() : '';
    if (!customLogo) return;

    logoNode.src = customLogo;
  }

  function buildPartnerRow(logos, reverse, delay) {
    const row = document.createElement('div');
    row.className = reverse ? 'marquee-row reverse reveal' : 'marquee-row reveal';
    row.dataset.delay = delay;

    const track = document.createElement('div');
    track.className = 'marquee-track';

    const doubled = [...logos, ...logos];
    doubled.forEach((logo) => {
      const figure = document.createElement('figure');
      figure.className = 'logo-chip';

      const image = document.createElement('img');
      image.src = logo.src;
      image.alt = logo.name || 'Partner logo';
      image.loading = 'lazy';

      figure.appendChild(image);
      track.appendChild(figure);
    });

    row.appendChild(track);
    return row;
  }

  function splitPartnerLogosIntoRows(logos, rowCount) {
    const safeRows = Number.isInteger(rowCount) && rowCount > 0 ? rowCount : 1;
    const rows = Array.from({ length: safeRows }, () => []);

    logos.forEach((logo, index) => {
      rows[index % safeRows].push(logo);
    });

    if (!logos.length) return rows;
    return rows.map((row) => (row.length ? row : logos.slice()));
  }

  function renderPartnerMarquee(settings) {
    const root = document.querySelector('[data-partner-marquee]');
    if (!root) return;

    const customLogos = Array.isArray(settings.partnerLogos)
      ? settings.partnerLogos.filter((item) => item && typeof item.src === 'string' && item.src.trim())
      : [];

    document.body.classList.toggle('has-managed-partners', customLogos.length > 0);
    if (!customLogos.length) return;

    const [firstRow, secondRow, thirdRow] = splitPartnerLogosIntoRows(customLogos, 3);

    root.innerHTML = '';
    root.appendChild(buildPartnerRow(firstRow, false, '0.05s'));
    root.appendChild(buildPartnerRow(secondRow, true, '0.12s'));
    root.appendChild(buildPartnerRow(thirdRow, false, '0.18s'));
  }

  function createNewsCard(article) {
    const localized = window.newsUtils && typeof window.newsUtils.localizeNewsItem === 'function'
      ? window.newsUtils.localizeNewsItem(article, 'en')
      : article;
    const cardImage = typeof article.image === 'string' ? article.image.trim() : '';
    const heroImage = typeof article.heroImage === 'string' ? article.heroImage.trim() : '';
    const imageSrc = cardImage || heroImage;
    const readMoreText = getContentValue('news.card.read_more', 'Read More', 'en');
    const mediaMarkup = imageSrc
      ? `<a href="news-detail.html?slug=${article.slug}" class="news-card-media" aria-label="Read ${localized.title}">
          <img src="${imageSrc}" alt="${localized.title}" loading="lazy" data-auto-fit />
        </a>`
      : '';
    const cardClass = imageSrc ? 'news-card reveal' : 'news-card reveal no-media';

    return `
      <article class="${cardClass}">
        ${mediaMarkup}
        <div class="news-card-body">
          <div class="news-meta">
            <span>${window.newsUtils.formatDate(article.date, 'en')}</span>
          </div>
          <h3><a href="news-detail.html?slug=${article.slug}">${localized.title}</a></h3>
          <p>${localized.excerpt}</p>
          <a class="btn-link" href="news-detail.html?slug=${article.slug}">${readMoreText}</a>
        </div>
      </article>
    `;
  }

  function renderLatestNewsPreview() {
    const previewGrid = document.querySelector('[data-latest-news]');
    if (!previewGrid || !window.aaiaNews) return;

    const latest = window.aaiaNews.slice(0, 3);
    previewGrid.innerHTML = latest.map(createNewsCard).join('');
    applyAutoImageFit(previewGrid);
  }

  function setYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach((node) => {
      node.textContent = String(year);
    });
  }

  function initPartnerForm() {
    const form = document.querySelector('[data-partner-form]');
    if (!form) return;

    const status = form.querySelector('[data-form-status]');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.textContent = getContentValue(
            'home.form.status.required',
            'Please complete all required fields.',
            'en'
          );
          status.classList.remove('success');
          status.classList.add('error');
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = getContentValue('home.form.status.submitting', 'Submitting...', 'en');
      }

      const rawPayload = Object.fromEntries(new FormData(form).entries());
      const payload = {
        ...rawPayload,
        consent: Boolean(rawPayload.consent),
        submitted_at: new Date().toISOString(),
        page_url: window.location.href
      };

      try {
        const response = await fetch('/api/partnership-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.ok === false) {
          throw new Error(
            result && typeof result.message === 'string' && result.message.trim()
              ? result.message
              : getContentValue(
                  'home.form.status.error',
                  'Unable to send inquiry right now. Please try again.',
                  'en'
                )
          );
        }

        form.reset();
        if (status) {
          status.textContent = getContentValue(
            'home.form.status.success',
            'Inquiry received. Thank you.',
            'en'
          );
          status.classList.remove('error');
          status.classList.add('success');
        }
      } catch (error) {
        if (status) {
          status.textContent =
            error && error.message
              ? error.message
              : getContentValue(
                  'home.form.status.error',
                  'Unable to send inquiry right now. Please try again.',
                  'en'
                );
          status.classList.remove('success');
          status.classList.add('error');
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = getContentValue('home.form.submit', 'Submit Partnership Inquiry', 'en');
        }
      }
    });
  }

  function initBrandingAndManagedAssets(settings) {
    applyGlobalLogo(settings);
    applyHeroBackground(settings);
    applyIrcaiLogo(settings);
    renderPartnerMarquee(settings);
  }

  document.addEventListener('DOMContentLoaded', () => {
    runtimeSettings = getSiteSettings();
    window.aaiaGetContentValue = getContentValue;
    window.aaiaGetPageLanguage = getPageLanguage;
    window.aaiaApplyAutoImageFit = applyAutoImageFit;

    initHeader();
    applyContentOverrides(runtimeSettings, getPageLanguage());
    initBrandingAndManagedAssets(runtimeSettings);
    renderLatestNewsPreview();
    initReveal();
    initCountUp();
    initPartnerForm();
    setYear();
    applyAutoImageFit(document);

    window.addEventListener('resize', () => {
      applyAutoImageFit(document);
    });

    if (isNewsPageContext() && window.aaiaI18n && typeof window.aaiaI18n.onChange === 'function') {
      window.aaiaI18n.onChange((nextLanguage) => {
        applyContentOverrides(runtimeSettings, nextLanguage);
      });
    }
  });
})();
