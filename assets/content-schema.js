(function () {
  const CONTENT_SCHEMA = [
    {
      key: 'nav.home',
      group: 'Global Header',
      label: 'Navigation: Home',
      selector: '.nav-links li:nth-child(1) .nav-link',
      default: 'Home'
    },
    {
      key: 'nav.about',
      group: 'Global Header',
      label: 'Navigation: About',
      selector: '.nav-links li:nth-child(2) .nav-link',
      default: 'About'
    },
    {
      key: 'nav.events_news',
      group: 'Global Header',
      label: 'Navigation: Events & News',
      selector: '.nav-links li:nth-child(3) .nav-link',
      default: 'Events & News'
    },
    {
      key: 'nav.partners',
      group: 'Global Header',
      label: 'Navigation: Partners',
      selector: '.nav-links li:nth-child(4) .nav-link',
      default: 'Partners'
    },
    {
      key: 'nav.contact',
      group: 'Global Header',
      label: 'Navigation: Contact',
      selector: '.nav-links li:nth-child(5) .nav-link',
      default: 'Contact'
    },
    {
      key: 'nav.partner_cta',
      group: 'Global Header',
      label: 'Navigation CTA Button',
      selector: '.nav-links .nav-cta .btn',
      default: 'Partner With Us'
    },

    {
      key: 'home.hero.eyebrow',
      group: 'Home Hero',
      label: 'Hero Eyebrow',
      selector: 'body.home-page .hero-inner > .eyebrow',
      default: 'UNESCO IRCAI NAIXUS Network Asia-Pacific Official Partner'
    },
    {
      key: 'home.hero.title',
      group: 'Home Hero',
      label: 'Hero Title',
      selector: 'body.home-page .hero-inner > h1',
      default: 'A Trusted Cross-Sector Alliance for AI Education, Sustainability, and Youth Innovation'
    },
    {
      key: 'home.hero.description',
      group: 'Home Hero',
      label: 'Hero Description',
      selector: 'body.home-page .hero-inner > p',
      default:
        'Connecting schools, universities, industry, and government across Asia-Pacific.',
      multiline: true
    },
    {
      key: 'home.hero.cta_primary',
      group: 'Home Hero',
      label: 'Hero Primary Button',
      selector: 'body.home-page .hero-actions .btn-primary',
      default: 'Explore News'
    },
    {
      key: 'home.hero.cta_secondary',
      group: 'Home Hero',
      label: 'Hero Secondary Button',
      selector: 'body.home-page .hero-actions .btn-outline',
      default: 'Partner With Us'
    },

    {
      key: 'home.partners.eyebrow',
      group: 'Home Partners Section',
      label: 'Partners Section Eyebrow',
      selector: 'body.home-page #partners .section-header .eyebrow',
      default: 'Institutional Network'
    },

    {
      key: 'home.about.eyebrow',
      group: 'Home About Section',
      label: 'About Section Eyebrow',
      selector: 'body.home-page #about > .container > .eyebrow',
      default: 'About AAIA'
    },
    {
      key: 'home.about.title',
      group: 'Home About Section',
      label: 'About Section Title',
      selector: 'body.home-page #about > .container > .section-title',
      default: 'An Alliance Built on Institutional Trust, Shared Purpose, and Regional Impact'
    },
    {
      key: 'home.about.intro',
      group: 'Home About Section',
      label: 'About Section Intro',
      selector: 'body.home-page #about > .container > .section-intro',
      default:
        'Through collaboration across schools, universities, enterprises, and public institutions, AAIA advances AI education, sustainability-focused innovation, and youth leadership pathways for the next generation.',
      multiline: true
    },
    {
      key: 'home.about.card1.title',
      group: 'Home About Section',
      label: 'About Card 1 Title',
      selector: 'body.home-page #about .about-card:nth-child(1) h3',
      default: 'Who We Are'
    },
    {
      key: 'home.about.card1.body',
      group: 'Home About Section',
      label: 'About Card 1 Description',
      selector: 'body.home-page #about .about-card:nth-child(1) p',
      default:
        'AAIA is a cross-sector platform uniting education leaders, policy stakeholders, and technology partners to accelerate high-quality AI and innovation opportunities for students across Asia.',
      multiline: true
    },
    {
      key: 'home.about.card2.title',
      group: 'Home About Section',
      label: 'About Card 2 Title',
      selector: 'body.home-page #about .about-card:nth-child(2) h3',
      default: 'Our Mission'
    },
    {
      key: 'home.about.card2.body',
      group: 'Home About Section',
      label: 'About Card 2 Description',
      selector: 'body.home-page #about .about-card:nth-child(2) p',
      default:
        'We build practical, policy-aligned ecosystems that connect learning, sustainability, and emerging technology so that young people can contribute meaningfully to the SDGs and future regional development.',
      multiline: true
    },
    {
      key: 'home.about.card3.title',
      group: 'Home About Section',
      label: 'About Card 3 Title',
      selector: 'body.home-page #about .about-card:nth-child(3) h3',
      default: 'Our Network'
    },
    {
      key: 'home.about.card3.body',
      group: 'Home About Section',
      label: 'About Card 3 Description',
      selector: 'body.home-page #about .about-card:nth-child(3) p',
      default:
        'Our partner network spans Hong Kong (HK), Macau, Singapore, Indonesia, and wider partnerships across East, Southeast, and South Asia, supported by leading universities, international organizations, and affiliated associations.',
      multiline: true
    },
    {
      key: 'home.about.highlight',
      group: 'Home About Section',
      label: 'About Section Highlight Line',
      selector: 'body.home-page #about .highlight-line',
      default:
        "AAIA's institutional model integrates AI, education, sustainability, and youth empowerment into one coordinated regional platform.",
      multiline: true
    },

    {
      key: 'home.impact.eyebrow',
      group: 'Home Impact Section',
      label: 'Impact Section Eyebrow',
      selector: 'body.home-page .impact-section > .container > .eyebrow',
      default: 'Impact at a Glance'
    },
    {
      key: 'home.impact.title',
      group: 'Home Impact Section',
      label: 'Impact Section Title',
      selector: 'body.home-page .impact-section .section-title',
      default: 'Regional Impact by the Numbers'
    },
    {
      key: 'home.impact.intro',
      group: 'Home Impact Section',
      label: 'Impact Section Intro',
      selector: 'body.home-page .impact-section .section-intro',
      default:
        'AAIA combines strategic partnerships with program execution to deliver consistent regional outcomes in youth innovation, AI literacy, and cross-border collaboration.',
      multiline: true
    },
    {
      key: 'home.impact.metric1.label',
      group: 'Home Impact Section',
      label: 'Metric 1 Label',
      selector: 'body.home-page .impact-section .metric-card:nth-child(1) .metric-label',
      default: 'of secondary schools in Hong Kong and Macao reached through strategic collaboration',
      multiline: true
    },
    {
      key: 'home.impact.metric2.label',
      group: 'Home Impact Section',
      label: 'Metric 2 Label',
      selector: 'body.home-page .impact-section .metric-card:nth-child(2) .metric-label',
      default:
        'active geographies in partnership network including Macao, Hong Kong, Indonesia, and Asia-Pacific platforms',
      multiline: true
    },
    {
      key: 'home.impact.metric3.label',
      group: 'Home Impact Section',
      label: 'Metric 3 Label',
      selector: 'body.home-page .impact-section .metric-card:nth-child(3) .metric-label',
      default: 'students and educators reached through selected outreach and academic exchange initiatives',
      multiline: true
    },
    {
      key: 'home.impact.metric4.label',
      group: 'Home Impact Section',
      label: 'Metric 4 Label',
      selector: 'body.home-page .impact-section .metric-card:nth-child(4) .metric-label',
      default: 'signature events and forums delivered across science, diplomacy, and smart education',
      multiline: true
    },
    {
      key: 'home.impact.metric5.label',
      group: 'Home Impact Section',
      label: 'Metric 5 Label',
      selector: 'body.home-page .impact-section .metric-card:nth-child(5) .metric-label',
      default: 'formal cooperation with UNESCO IRCAI NAIXUS supporting SDG-focused AI initiatives',
      multiline: true
    },

    {
      key: 'home.news.eyebrow',
      group: 'Home News Section',
      label: 'Latest News Eyebrow',
      selector: 'body.home-page #news-preview > .container > .eyebrow',
      default: 'Latest Events & News'
    },
    {
      key: 'home.news.title',
      group: 'Home News Section',
      label: 'Latest News Title',
      selector: 'body.home-page #news-preview > .container > .section-title',
      default: 'Latest Updates'
    },
    {
      key: 'home.news.intro',
      group: 'Home News Section',
      label: 'Latest News Intro',
      selector: 'body.home-page #news-preview > .container > .section-intro',
      default:
        "Explore AAIA's latest developments, including institutional collaborations, flagship forums, and measurable outcomes across our education alliance.",
      multiline: true
    },
    {
      key: 'home.news.view_all',
      group: 'Home News Section',
      label: 'View All News Button',
      selector: 'body.home-page #news-preview .center-cta .btn',
      default: 'View All News'
    },

    {
      key: 'home.cta.title',
      group: 'Home Partner CTA Band',
      label: 'CTA Band Title',
      selector: 'body.home-page #partner-cta h2',
      default: 'Collaborate with AAIA to Shape the Future of AI Education in Asia',
      multiline: true
    },
    {
      key: 'home.cta.description',
      group: 'Home Partner CTA Band',
      label: 'CTA Band Description',
      selector: 'body.home-page #partner-cta p',
      default:
        'We welcome schools, universities, industry leaders, NGOs, and public-sector institutions seeking meaningful collaboration in youth innovation, sustainability, and responsible AI development.',
      multiline: true
    },
    {
      key: 'home.cta.button',
      group: 'Home Partner CTA Band',
      label: 'CTA Band Button',
      selector: 'body.home-page #partner-cta .btn',
      default: 'Become a Partner'
    },

    {
      key: 'home.form.eyebrow',
      group: 'Partnership Form',
      label: 'Form Eyebrow',
      selector: 'body.home-page #partner-form .partner-form-intro .eyebrow',
      default: 'Partnership Inquiry'
    },
    {
      key: 'home.form.title',
      group: 'Partnership Form',
      label: 'Form Title',
      selector: 'body.home-page #partner-form .partner-form-intro .section-title',
      default: 'Partner With AAIA'
    },
    {
      key: 'home.form.intro',
      group: 'Partnership Form',
      label: 'Form Intro',
      selector: 'body.home-page #partner-form .partner-form-intro .section-intro',
      default:
        'Submit your interest to collaborate with AAIA across schools, universities, enterprises, NGOs, and public institutions.',
      multiline: true
    },
    {
      key: 'home.form.label.organization_name',
      group: 'Partnership Form',
      label: 'Label: Organization Name',
      selector: 'label[for="organization-name"]',
      default: 'Organization Name'
    },
    {
      key: 'home.form.label.contact_person',
      group: 'Partnership Form',
      label: 'Label: Contact Person',
      selector: 'label[for="contact-person"]',
      default: 'Contact Person'
    },
    {
      key: 'home.form.label.email',
      group: 'Partnership Form',
      label: 'Label: Email',
      selector: 'label[for="contact-email"]',
      default: 'Email'
    },
    {
      key: 'home.form.label.phone',
      group: 'Partnership Form',
      label: 'Label: Phone',
      selector: 'label[for="contact-phone"]',
      default: 'Phone'
    },
    {
      key: 'home.form.label.organization_type',
      group: 'Partnership Form',
      label: 'Label: Organization Type',
      selector: 'label[for="organization-type"]',
      default: 'Organization Type'
    },
    {
      key: 'home.form.label.region',
      group: 'Partnership Form',
      label: 'Label: Country / Region',
      selector: 'label[for="region"]',
      default: 'Country / Region'
    },
    {
      key: 'home.form.label.focus',
      group: 'Partnership Form',
      label: 'Label: Partnership Focus',
      selector: 'label[for="partnership-focus"]',
      default: 'Partnership Focus'
    },
    {
      key: 'home.form.label.message',
      group: 'Partnership Form',
      label: 'Label: Message',
      selector: 'label[for="message"]',
      default: 'Message'
    },
    {
      key: 'home.form.placeholder.organization_type',
      group: 'Partnership Form',
      label: 'Organization Type Placeholder',
      selector: '#organization-type option[value=""]',
      default: 'Select organization type'
    },
    {
      key: 'home.form.option.school',
      group: 'Partnership Form',
      label: 'Organization Type Option: School',
      selector: '#organization-type option[value="school"]',
      default: 'School'
    },
    {
      key: 'home.form.option.university',
      group: 'Partnership Form',
      label: 'Organization Type Option: University',
      selector: '#organization-type option[value="university"]',
      default: 'University'
    },
    {
      key: 'home.form.option.enterprise',
      group: 'Partnership Form',
      label: 'Organization Type Option: Technology Enterprise',
      selector: '#organization-type option[value="enterprise"]',
      default: 'Technology Enterprise'
    },
    {
      key: 'home.form.option.ngo',
      group: 'Partnership Form',
      label: 'Organization Type Option: NGO / Association',
      selector: '#organization-type option[value="ngo"]',
      default: 'NGO / Association'
    },
    {
      key: 'home.form.option.government',
      group: 'Partnership Form',
      label: 'Organization Type Option: Government / Public Sector',
      selector: '#organization-type option[value="government"]',
      default: 'Government / Public Sector'
    },
    {
      key: 'home.form.option.other',
      group: 'Partnership Form',
      label: 'Organization Type Option: Other',
      selector: '#organization-type option[value="other"]',
      default: 'Other'
    },
    {
      key: 'home.form.placeholder.focus',
      group: 'Partnership Form',
      label: 'Partnership Focus Placeholder',
      selector: '#partnership-focus',
      type: 'attr',
      attr: 'placeholder',
      default: 'Examples: AI education programs, events, sponsorship, policy dialogue'
    },
    {
      key: 'home.form.placeholder.message',
      group: 'Partnership Form',
      label: 'Message Placeholder',
      selector: '#message',
      type: 'attr',
      attr: 'placeholder',
      default: 'Please share your collaboration goals, target participants, and expected timeline.'
    },
    {
      key: 'home.form.consent',
      group: 'Partnership Form',
      label: 'Consent Text',
      selector: 'label[for="consent"] span',
      default: 'I confirm that the information provided is accurate and can be used for partnership follow-up.',
      multiline: true
    },
    {
      key: 'home.form.submit',
      group: 'Partnership Form',
      label: 'Submit Button',
      selector: 'body.home-page #partner-form button[type="submit"]',
      default: 'Submit Partnership Inquiry'
    },
    {
      key: 'home.form.status.required',
      group: 'Partnership Form',
      label: 'Validation Message (Required Fields)',
      default: 'Please complete all required fields.'
    },
    {
      key: 'home.form.status.submitting',
      group: 'Partnership Form',
      label: 'Submitting Button Text',
      default: 'Submitting...'
    },
    {
      key: 'home.form.status.success',
      group: 'Partnership Form',
      label: 'Success Message',
      default: 'Inquiry received. Thank you.'
    },
    {
      key: 'home.form.status.error',
      group: 'Partnership Form',
      label: 'Error Message',
      default: 'Unable to send inquiry right now. Please try again.'
    },

    {
      key: 'news.listing.hero.eyebrow',
      group: 'Events & News Page',
      label: 'Page Hero Eyebrow',
      selector: 'body .page-hero .eyebrow',
      default: 'AAIA Events & Newsroom'
    },
    {
      key: 'news.listing.hero.title',
      group: 'Events & News Page',
      label: 'Page Hero Title',
      selector: 'body .page-hero h1',
      default: 'Latest Events & News'
    },
    {
      key: 'news.listing.hero.description',
      group: 'Events & News Page',
      label: 'Page Hero Description',
      selector: 'body .page-hero p',
      default:
        'Official updates on AAIA collaborations, major events, and youth innovation milestones shaping responsible AI and education across Asia-Pacific.',
      multiline: true
    },
    {
      key: 'news.listing.search.label',
      group: 'Events & News Page',
      label: 'Search Label',
      selector: 'label[for="news-search"]',
      default: 'Search'
    },
    {
      key: 'news.listing.search.placeholder',
      group: 'Events & News Page',
      label: 'Search Placeholder',
      selector: '#news-search',
      type: 'attr',
      attr: 'placeholder',
      default: 'Search by keyword, partner, or topic'
    },
    {
      key: 'news.language.label',
      group: 'Events & News Page',
      label: 'Language Switch Label',
      selector: '[data-news-language-label]',
      default: 'Language'
    },
    {
      key: 'news.language.eng',
      group: 'Events & News Page',
      label: 'Language Switch Button: Eng',
      selector: '[data-news-lang-btn="en"]',
      default: 'Eng'
    },
    {
      key: 'news.language.zh',
      group: 'Events & News Page',
      label: 'Language Switch Button: 繁',
      selector: '[data-news-lang-btn="zh"]',
      default: '繁'
    },
    {
      key: 'news.listing.load_more',
      group: 'Events & News Page',
      label: 'Load More Button Text',
      selector: '[data-load-more]',
      default: 'Load More News'
    },
    {
      key: 'news.listing.load_more_done',
      group: 'Events & News Page',
      label: 'No More Articles Button Text',
      default: 'No More Articles'
    },
    {
      key: 'news.listing.featured_cta',
      group: 'Events & News Page',
      label: 'Featured Story Button',
      default: 'Read More'
    },
    {
      key: 'news.listing.empty.no_match',
      group: 'Events & News Page',
      label: 'No Match Message',
      default: 'No news matched your search. Try a broader keyword.'
    },
    {
      key: 'news.listing.empty.no_match_title',
      group: 'Events & News Page',
      label: 'No Match Featured Title',
      default: 'No matching result'
    },
    {
      key: 'news.listing.empty.no_match_description',
      group: 'Events & News Page',
      label: 'No Match Featured Description',
      default: 'Try another search keyword to browse events and news.'
    },
    {
      key: 'news.listing.empty.single_result',
      group: 'Events & News Page',
      label: 'Single Result Message',
      default: 'Showing 1 matched result in the featured panel above.'
    },

    {
      key: 'news.detail.back_link',
      group: 'News Detail Page',
      label: 'Back Link',
      selector: '.article-header .back-link',
      default: '\u2190 Back to Events & News'
    },
    {
      key: 'news.detail.facts_heading',
      group: 'News Detail Page',
      label: 'Details Panel Title',
      selector: '.article-sidebar .panel:nth-child(1) h3',
      default: 'Details'
    },
    {
      key: 'news.detail.share_heading',
      group: 'News Detail Page',
      label: 'Share Panel Title',
      selector: '.article-sidebar .panel:nth-child(2) h3',
      default: 'Share'
    },
    {
      key: 'news.detail.share.linkedin',
      group: 'News Detail Page',
      label: 'Share Button: LinkedIn',
      selector: '[data-share="linkedin"]',
      default: 'LinkedIn'
    },
    {
      key: 'news.detail.share.x',
      group: 'News Detail Page',
      label: 'Share Button: X',
      selector: '[data-share="x"]',
      default: 'X'
    },
    {
      key: 'news.detail.share.copy',
      group: 'News Detail Page',
      label: 'Share Button: Copy Link',
      selector: '[data-share="copy"]',
      default: 'Copy Link'
    },
    {
      key: 'news.detail.share.native',
      group: 'News Detail Page',
      label: 'Share Button: Native Share',
      selector: '[data-share="native"]',
      default: 'Share'
    },
    {
      key: 'news.detail.related_heading',
      group: 'News Detail Page',
      label: 'Related News Heading',
      selector: '.related-news h2',
      default: 'Related News'
    },
    {
      key: 'news.detail.content_heading',
      group: 'News Detail Page',
      label: 'Article Body Subheading',
      default: 'Overview'
    },
    {
      key: 'news.detail.facts.published',
      group: 'News Detail Page',
      label: 'Facts Label: Published',
      default: 'Published:'
    },
    {
      key: 'news.detail.facts.section',
      group: 'News Detail Page',
      label: 'Facts Label: Section',
      default: 'Section:'
    },
    {
      key: 'news.detail.facts.section_value',
      group: 'News Detail Page',
      label: 'Facts Value: Section',
      default: 'Events and News'
    },
    {
      key: 'news.detail.share.copied',
      group: 'News Detail Page',
      label: 'Copy Link Temporary Text',
      default: 'Copied'
    },
    {
      key: 'news.detail.share.copy_prompt',
      group: 'News Detail Page',
      label: 'Copy Prompt Label',
      default: 'Copy this link:'
    },

    {
      key: 'news.card.read_more',
      group: 'Shared News Cards',
      label: 'News Card Link Text',
      default: 'Read More'
    },

    {
      key: 'footer.description',
      group: 'Global Footer',
      label: 'Footer Description',
      selector: '.footer-brand-card > p',
      default:
        'The Asia Artificial Intelligence Alliance is a cross-sector institutional network connecting education, technology, and policy partners to empower future innovators across Asia-Pacific.',
      multiline: true
    },
    {
      key: 'footer.pill1',
      group: 'Global Footer',
      label: 'Footer Badge 1',
      selector: '.footer-pill-row .footer-pill:nth-child(1)',
      default: 'UNESCO IRCAI NAIXUS Official Partner'
    },
    {
      key: 'footer.pill2',
      group: 'Global Footer',
      label: 'Footer Badge 2',
      selector: '.footer-pill-row .footer-pill:nth-child(2)',
      default: 'Cross-Sector Alliance'
    },
    {
      key: 'footer.pill3',
      group: 'Global Footer',
      label: 'Footer Badge 3',
      selector: '.footer-pill-row .footer-pill:nth-child(3)',
      default: 'Asia-Pacific Network'
    },
    {
      key: 'footer.contact_title',
      group: 'Global Footer',
      label: 'Footer Contact Title',
      selector: '.footer-contact-card .footer-title',
      default: 'Institutional Contact'
    },
    {
      key: 'footer.contact_note',
      group: 'Global Footer',
      label: 'Footer Contact Note',
      selector: '.footer-contact-card .footer-note',
      default: 'For partnership proposals, event collaboration, and institutional inquiries.',
      multiline: true
    },
    {
      key: 'footer.form_button',
      group: 'Global Footer',
      label: 'Footer Form Button',
      selector: '.footer-contact-card .footer-btn',
      default: 'Open Partnership Form'
    },
    {
      key: 'footer.bottom_html',
      group: 'Global Footer',
      label: 'Footer Copyright (HTML)',
      selector: '.footer-bottom',
      type: 'html',
      default: '&copy; <span data-year></span> Asia Artificial Intelligence Alliance. All rights reserved.'
    }
  ];

  function getDefaultMap() {
    return CONTENT_SCHEMA.reduce((acc, entry) => {
      if (!entry || typeof entry !== 'object') return acc;
      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      if (!key) return acc;
      acc[key] = typeof entry.default === 'string' ? entry.default : '';
      return acc;
    }, {});
  }

  function getEntryByKey(key) {
    return CONTENT_SCHEMA.find((entry) => entry.key === key) || null;
  }

  window.AAIA_CONTENT_SCHEMA = CONTENT_SCHEMA;
  window.aaiaContentUtils = {
    getDefaultMap,
    getEntryByKey
  };
})();
