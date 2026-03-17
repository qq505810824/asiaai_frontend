(function () {
  const DEFAULT_NEWS_PLACEHOLDER = 'assets/logos/aaia-news-placeholder.svg';

  function toLanguageCode(value) {
    return value === 'zh' ? 'zh' : 'en';
  }

  function getCurrentLanguage() {
    if (window.aaiaI18n && typeof window.aaiaI18n.getLanguage === 'function') {
      return toLanguageCode(window.aaiaI18n.getLanguage());
    }
    return 'en';
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

  function localizeArticle(item, language) {
    if (window.newsUtils && typeof window.newsUtils.localizeNewsItem === 'function') {
      return window.newsUtils.localizeNewsItem(item, language);
    }
    return item;
  }

  function createRelatedCard(article, language) {
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

  function initShareButtons(getCurrentArticle) {
    const buttons = document.querySelectorAll('[data-share]');
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.onclick = async () => {
        const current = getCurrentArticle();
        if (!current) return;

        const pageUrl = `${window.location.origin}${window.location.pathname}?slug=${current.slug}`;
        const shareText = `${current.title} | Asia Artificial Intelligence Alliance`;
        const target = button.dataset.share;

        if (target === 'copy') {
          try {
            await navigator.clipboard.writeText(pageUrl);
            button.textContent = getFallbackContentValue('news.detail.share.copied', 'Copied');
            window.setTimeout(() => {
              button.textContent = getFallbackContentValue('news.detail.share.copy', 'Copy Link');
            }, 1200);
          } catch (error) {
            window.prompt(getFallbackContentValue('news.detail.share.copy_prompt', 'Copy this link:'), pageUrl);
          }
          return;
        }

        if (target === 'native' && navigator.share) {
          try {
            await navigator.share({
              title: current.title,
              text: shareText,
              url: pageUrl
            });
          } catch (error) {
            // Ignore cancelled share actions.
          }
          return;
        }

        if (target === 'linkedin') {
          const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }

        if (target === 'x') {
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      };
    });

    if (!navigator.share) {
      const nativeButton = document.querySelector('[data-share="native"]');
      if (nativeButton) nativeButton.hidden = true;
    }
  }

  function initGalleryLightbox(galleryNode) {
    if (!galleryNode || galleryNode.dataset.lightboxReady === 'true') return;

    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('hidden', '');
    lightbox.innerHTML = `
      <div class="gallery-lightbox-backdrop" data-lightbox-close></div>
      <figure class="gallery-lightbox-frame">
        <button class="gallery-lightbox-close" type="button" data-lightbox-close aria-label="Close image preview">&times;</button>
        <img src="" alt="Enlarged gallery image" data-lightbox-image />
      </figure>
    `;

    document.body.appendChild(lightbox);

    const imageNode = lightbox.querySelector('[data-lightbox-image]');
    if (!imageNode) return;

    const closeLightbox = () => {
      lightbox.setAttribute('hidden', '');
      imageNode.removeAttribute('src');
      document.body.classList.remove('lightbox-open');
    };

    const openLightbox = (src, alt) => {
      if (!src) return;
      imageNode.src = src;
      imageNode.alt = alt || 'Enlarged gallery image';
      lightbox.removeAttribute('hidden');
      document.body.classList.add('lightbox-open');
    };

    galleryNode.addEventListener('click', (event) => {
      const targetImage = event.target.closest('img');
      if (!targetImage) return;
      openLightbox(targetImage.getAttribute('src') || '', targetImage.getAttribute('alt') || '');
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target.closest('[data-lightbox-close]')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
        closeLightbox();
      }
    });

    galleryNode.dataset.lightboxReady = 'true';
  }

  function initDetail() {
    if (!window.aaiaNews || !window.newsUtils) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const baseArticle = window.newsUtils.getNewsBySlug(slug) || window.aaiaNews[0];
    if (!baseArticle) return;

    if (window.aaiaI18n && typeof window.aaiaI18n.initSwitches === 'function') {
      window.aaiaI18n.initSwitches(document);
    }

    const heroSection = document.querySelector('.article-hero');
    const heroImage = document.querySelector('[data-article-hero-image]');
    const titleNode = document.querySelector('[data-article-title]');
    const metaNode = document.querySelector('[data-article-meta]');
    const contentNode = document.querySelector('[data-article-content]');
    const galleryNode = document.querySelector('[data-article-gallery]');
    const factsNode = document.querySelector('[data-article-facts]');
    const relatedNode = document.querySelector('[data-related-news]');

    if (
      !heroImage ||
      !titleNode ||
      !metaNode ||
      !contentNode ||
      !galleryNode ||
      !factsNode ||
      !relatedNode
    ) {
      return;
    }

    initGalleryLightbox(galleryNode);
    initShareButtons(() => localizeArticle(baseArticle, getCurrentLanguage()));

    const hideHero = () => {
      if (heroSection) heroSection.hidden = true;
      document.body.classList.add('no-article-hero');
      heroImage.removeAttribute('src');
    };

    function render() {
      const language = getCurrentLanguage();
      const current = localizeArticle(baseArticle, language);
      document.title = `${current.title} | AAIA News`;

      const heroSource =
        typeof baseArticle.heroImage === 'string' ? baseArticle.heroImage.trim() : '';

      if (!heroSource) {
        hideHero();
      } else {
        if (heroSection) heroSection.hidden = false;
        document.body.classList.remove('no-article-hero');
        heroImage.alt = current.title;
        heroImage.onerror = hideHero;
        heroImage.src = heroSource;
      }

      titleNode.textContent = current.title;
      metaNode.innerHTML = `
        <span>${window.newsUtils.formatDate(baseArticle.date, language)}</span>
      `;

      const excerpt = typeof current.excerpt === 'string' ? current.excerpt.trim() : '';
      const contentParagraphs = Array.isArray(current.content) ? current.content : [];
      const quoteText = typeof current.quote === 'string' ? current.quote.trim() : '';
      const firstBodyParagraph = contentParagraphs.length ? String(contentParagraphs[0] || '').trim() : '';
      const introParagraph =
        excerpt && excerpt !== firstBodyParagraph ? `<p>${excerpt}</p>` : '';
      const bodyParagraphs = contentParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
      const quote = quoteText ? `<blockquote>${quoteText}</blockquote>` : '';
      const sectionHeading = bodyParagraphs
        ? `<h2>${getFallbackContentValue(
            'news.detail.content_heading',
            'Overview',
            language
          )}</h2>`
        : '';

      contentNode.innerHTML = `${introParagraph}${sectionHeading}${bodyParagraphs}${quote}`;

      const gallery = Array.isArray(baseArticle.gallery) ? baseArticle.gallery.filter(Boolean) : [];
      galleryNode.innerHTML = gallery
        .map(
          (image, index) =>
            `<img src="${image}" alt="${current.title} supporting image ${index + 1}" loading="lazy" />`
        )
        .join('');

      factsNode.innerHTML = `
        <li><strong>${getFallbackContentValue('news.detail.facts.published', 'Published:', language)}</strong> ${window.newsUtils.formatDate(baseArticle.date, language)}</li>
        <li><strong>${getFallbackContentValue('news.detail.facts.section', 'Section:', language)}</strong> ${getFallbackContentValue('news.detail.facts.section_value', 'Events and News', language)}</li>
      `;

      const related = window.aaiaNews
        .filter((item) => item.slug !== baseArticle.slug)
        .slice(0, 3);

      relatedNode.innerHTML = related.map((item) => createRelatedCard(item, language)).join('');
      applyAutoImageFit(relatedNode);

      document.querySelectorAll('.reveal').forEach((el) => {
        requestAnimationFrame(() => {
          el.classList.add('visible');
        });
      });
    }

    if (window.aaiaI18n && typeof window.aaiaI18n.onChange === 'function') {
      window.aaiaI18n.onChange(() => {
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', initDetail);
})();
