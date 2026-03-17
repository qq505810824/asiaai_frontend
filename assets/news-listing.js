(function () {
  const PAGE_SIZE = 6;
  const DEFAULT_NEWS_PLACEHOLDER = 'assets/logos/aaia-news-placeholder.svg';
  let featuredSlug = '';

  function toLanguageCode(value) {
    return value === 'zh' ? 'zh' : 'en';
  }

  function getCurrentLanguage() {
    if (window.aaiaI18n && typeof window.aaiaI18n.getLanguage === 'function') {
      return toLanguageCode(window.aaiaI18n.getLanguage());
    }
    return 'en';
  }

  function localizeArticle(item, language) {
    if (window.newsUtils && typeof window.newsUtils.localizeNewsItem === 'function') {
      return window.newsUtils.localizeNewsItem(item, language);
    }
    return item;
  }

  function toTimestamp(dateValue) {
    const time = new Date(dateValue).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  function sortByDateDesc(items) {
    return items.slice().sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }

  function getFallbackContentValue(key, fallback, language) {
    const safeLanguage = toLanguageCode(language || getCurrentLanguage());

    if (typeof window.aaiaGetContentValue === 'function') {
      return window.aaiaGetContentValue(key, fallback, safeLanguage);
    }

    if (window.aaiaCMS && typeof window.aaiaCMS.getSettings === 'function') {
      const settings = window.aaiaCMS.getSettings();
      const i18n =
        settings && typeof settings.contentOverridesI18n === 'object' && settings.contentOverridesI18n
          ? settings.contentOverridesI18n
          : {};
      const localized = i18n[key];
      if (localized && typeof localized === 'object') {
        if (safeLanguage === 'zh') {
          if (typeof localized.zh === 'string' && localized.zh.trim()) return localized.zh;
          if (typeof localized.en === 'string' && localized.en.trim()) return localized.en;
        } else if (typeof localized.en === 'string' && localized.en.trim()) {
          return localized.en;
        }
      }

      const overrides =
        settings && typeof settings.contentOverrides === 'object' && settings.contentOverrides
          ? settings.contentOverrides
          : {};
      if (Object.prototype.hasOwnProperty.call(overrides, key) && typeof overrides[key] === 'string') {
        return overrides[key];
      }
    }

    return fallback;
  }

  function getNewsPlaceholderImage() {
    if (window.aaiaCMS && typeof window.aaiaCMS.getSettings === 'function') {
      const settings = window.aaiaCMS.getSettings();
      const customPlaceholder =
        settings && typeof settings.newsPlaceholderImage === 'string'
          ? settings.newsPlaceholderImage.trim()
          : '';
      if (customPlaceholder) return customPlaceholder;
    }

    return DEFAULT_NEWS_PLACEHOLDER;
  }

  function applyAutoImageFit(root) {
    if (typeof window.aaiaApplyAutoImageFit === 'function') {
      window.aaiaApplyAutoImageFit(root);
    }
  }

  function createNewsCard(article, language) {
    const localized = localizeArticle(article, language);
    const cardImage = typeof article.image === 'string' ? article.image.trim() : '';
    const heroImage = typeof article.heroImage === 'string' ? article.heroImage.trim() : '';
    const imageSrc = cardImage || heroImage;
    const readMoreText = getFallbackContentValue('news.card.read_more', 'Read More', language);
    const dateText =
      window.newsUtils && typeof window.newsUtils.formatDate === 'function'
        ? window.newsUtils.formatDate(article.date, language)
        : article.date;
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
            <span>${dateText}</span>
          </div>
          <h3><a href="news-detail.html?slug=${article.slug}">${localized.title}</a></h3>
          <p>${localized.excerpt}</p>
          <a class="btn-link" href="news-detail.html?slug=${article.slug}">${readMoreText}</a>
        </div>
      </article>
    `;
  }

  function renderFeatured(article, language) {
    const root = document.querySelector('[data-featured-news]');
    if (!root || !article) return;

    const localized = localizeArticle(article, language);
    const cardImage = typeof article.image === 'string' ? article.image.trim() : '';
    const heroImage = typeof article.heroImage === 'string' ? article.heroImage.trim() : '';
    const imageSrc = cardImage || heroImage;
    const featuredCtaRaw = getFallbackContentValue('news.listing.featured_cta', 'Read More', language);
    const featuredCta = featuredCtaRaw === 'Read Featured Story' ? 'Read More' : featuredCtaRaw;
    const dateText =
      window.newsUtils && typeof window.newsUtils.formatDate === 'function'
        ? window.newsUtils.formatDate(article.date, language)
        : article.date;
    const mediaMarkup = imageSrc
      ? `<div class="featured-media">
          <img src="${imageSrc}" alt="${localized.title}" loading="eager" data-auto-fit />
        </div>`
      : '';

    root.classList.toggle('no-media', !imageSrc);

    root.innerHTML = `
      ${mediaMarkup}
      <div class="featured-body">
        <div class="news-meta">
          <span>${dateText}</span>
        </div>
        <h2>${localized.title}</h2>
        <p>${localized.excerpt}</p>
        <a class="btn btn-primary" href="news-detail.html?slug=${article.slug}">${featuredCta}</a>
      </div>
    `;
    applyAutoImageFit(root);
  }

  function createSearchIndex(item, language) {
    const localized = localizeArticle(item, language);
    const allText = [
      localized.title,
      localized.excerpt,
      Array.isArray(localized.content) ? localized.content.join(' ') : '',
      item.title,
      item.titleZh,
      item.excerpt,
      item.excerptZh,
      Array.isArray(item.content) ? item.content.join(' ') : '',
      Array.isArray(item.contentZh) ? item.contentZh.join(' ') : '',
      window.newsUtils && typeof window.newsUtils.formatDate === 'function'
        ? window.newsUtils.formatDate(item.date, language)
        : item.date
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return allText;
  }

  function revealVisibleNodes() {
    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.classList.contains('visible')) {
        const delay = el.dataset.delay;
        if (delay) el.style.transitionDelay = delay;
        requestAnimationFrame(() => {
          el.classList.add('visible');
        });
      }
    });
  }

  function selectFeaturedItem(items) {
    if (!Array.isArray(items) || !items.length) return null;
    const manuallyFeatured = items.find((item) => Boolean(item && item.featured));
    return manuallyFeatured || items[0] || null;
  }

  function initListing() {
    if (!window.aaiaNews || !window.newsUtils) return;

    const grid = document.querySelector('[data-news-grid]');
    const loadMoreBtn = document.querySelector('[data-load-more]');
    const searchInput = document.querySelector('[data-news-search]');

    if (!grid || !loadMoreBtn || !searchInput) return;

    const sortedBase = sortByDateDesc(window.aaiaNews);
    const firstFeatured = selectFeaturedItem(sortedBase);
    featuredSlug = firstFeatured ? firstFeatured.slug : '';
    if (firstFeatured) {
      renderFeatured(firstFeatured, getCurrentLanguage());
    }

    if (window.aaiaI18n && typeof window.aaiaI18n.initSwitches === 'function') {
      window.aaiaI18n.initSwitches(document);
    }

    let visibleCount = PAGE_SIZE;
    const baseItems = sortedBase;

    function applyFilters(language) {
      const query = searchInput.value.trim().toLowerCase();

      const filtered = baseItems.filter((item) => {
        if (!query) return true;
        return createSearchIndex(item, language).includes(query);
      });

      return sortByDateDesc(filtered);
    }

    function render() {
      const language = getCurrentLanguage();
      const filtered = applyFilters(language);

      if (filtered.length) {
        const nextFeatured = selectFeaturedItem(filtered);
        featuredSlug = nextFeatured.slug;
        renderFeatured(nextFeatured, language);
      }

      const listPool = filtered.filter((item) => item.slug !== featuredSlug);
      const visibleItems = listPool.slice(0, visibleCount);

      if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state">${getFallbackContentValue(
          'news.listing.empty.no_match',
          'No news matched your search. Try a broader keyword.',
          language
        )}</div>`;
        const root = document.querySelector('[data-featured-news]');
        if (root) {
          root.classList.add('no-media');
          root.innerHTML = `<div class="featured-body"><h2>${getFallbackContentValue(
            'news.listing.empty.no_match_title',
            'No matching result',
            language
          )}</h2><p>${getFallbackContentValue(
            'news.listing.empty.no_match_description',
            'Try another search keyword to browse events and news.',
            language
          )}</p></div>`;
        }
        loadMoreBtn.hidden = true;
        return;
      }

      if (!visibleItems.length) {
        grid.innerHTML = `<div class="empty-state">${getFallbackContentValue(
          'news.listing.empty.single_result',
          'Showing 1 matched result in the featured panel above.',
          language
        )}</div>`;
        loadMoreBtn.hidden = true;
        return;
      }

      grid.innerHTML = visibleItems.map((item) => createNewsCard(item, language)).join('');
      applyAutoImageFit(grid);

      const hasMore = listPool.length > visibleCount;
      loadMoreBtn.hidden = !hasMore;
      loadMoreBtn.textContent = hasMore
        ? getFallbackContentValue('news.listing.load_more', 'Load More News', language)
        : getFallbackContentValue('news.listing.load_more_done', 'No More Articles', language);

      revealVisibleNodes();
    }

    function resetAndRender() {
      visibleCount = PAGE_SIZE;
      render();
    }

    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      render();
    });

    searchInput.addEventListener('input', resetAndRender);

    if (window.aaiaI18n && typeof window.aaiaI18n.onChange === 'function') {
      window.aaiaI18n.onChange(() => {
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', initListing);
})();
