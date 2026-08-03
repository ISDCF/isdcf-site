'use strict';

/*
 * Pure (Hexo-independent) logic for porting the ISDCF Registries site
 * (https://github.com/ISDCF/registries-site) into this Hexo site as native
 * pages.
 *
 * This module has no dependency on the `hexo` runtime object, so it can be
 * required directly from a plain Node script for testing/verification, as
 * well as from scripts/registries.js (the actual Hexo generator).
 *
 * All paths below assume this file lives at <repo root>/scripts/lib/.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'registries', 'content');
const IMG_DIR = path.join(ROOT_DIR, 'registries', 'img');
const REGISTRIES_DATA_DIR = path.join(ROOT_DIR, 'external', 'registries', 'src', 'main', 'data');

/*
 * The page manifest, ported (order, titles, menu levels, page orders) from
 * registries-site's build.js. `pageType` is one of "descriptiveText" |
 * "registryTable" | "menuCollapse" | "menuCollapseEnd". Only entries with a
 * numeric `pageOrder` are actual pages/routes; the "menuCollapse"/
 * "menuCollapseEnd" entries are sidebar section markers -- the sidebar
 * (layout/registry.ejs) only lists the menuLevel-3 entries between the
 * marker pair matching the current page's own section.
 *
 * Deviation from the original: registries-site had a single combined
 * "index" page (pageOrder 1, menuLevel 1) covering the whole /registry/
 * section, with only the Metadata Registry group having its own
 * "Introduction" sub-page. Here that combined page has been replaced with
 * "dcncintro" -- an Introduction sub-page for the Naming Convention group,
 * mirroring "registryintro" -- so all three sections (Naming Convention,
 * Metadata Registry, Terminology Registry) are reachable as their own
 * top-level pages (see _config.isdcf.yml's "DCNC and Registry" menu),
 * rather than through one shared landing page.
 */
const pages = [
  { pageType: 'menuCollapse', pageTemplate: 'namingconvention', pageTitle: 'Digital Cinema Naming Convention', menuLevel: 2 },
  { pageType: 'descriptiveText', pageTemplate: 'illustratedguide', pageTitle: 'Illustrated Guide', menuLevel: 3, pageOrder: 1 },
  { pageType: 'descriptiveText', pageTemplate: 'dcncintro', pageTitle: 'Introduction', menuLevel: 3, pageOrder: 2 },
  { pageType: 'descriptiveText', pageTemplate: 'general', pageTitle: 'General Tips', menuLevel: 3, pageOrder: 3 },
  { pageType: 'registryTable', pageTemplate: 'contenttypes', idType: 'contenttype', pageTitle: 'Content Types', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 4 },
  { pageType: 'registryTable', pageTemplate: 'contentmodifiers', idType: 'contentmodifier', pageTitle: 'Content Modifiers', schemaBuild: '1.0.1', menuLevel: 3, pageOrder: 5 },
  { pageType: 'descriptiveText', pageTemplate: 'labeling3dproduct', pageTitle: "Labeling 3D Product", menuLevel: 3, pageOrder: 6 },
  { pageType: 'descriptiveText', pageTemplate: 'labelingcombotrailers', pageTitle: "Labeling 'Combo' Trailers", menuLevel: 3, pageOrder: 7 },
  { pageType: 'registryTable', pageTemplate: 'projectoraspectratios', idType: 'projectoraspectratio', pageTitle: 'Projector Aspect Ratios and Resolutions', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 8 },
  { pageType: 'registryTable', pageTemplate: 'languages', idType: 'language', pageTitle: 'Language Codes', schemaBuild: '1.0.1', menuLevel: 3, pageOrder: 9 },
  { pageType: 'descriptiveText', pageTemplate: 'openandclosedcaptions', pageTitle: 'Open and Closed Captions', menuLevel: 3, pageOrder: 10 },
  { pageType: 'registryTable', pageTemplate: 'territories', idType: 'territory', pageTitle: 'Territory Codes', schemaBuild: '1.0.3', menuLevel: 3, pageOrder: 11 },
  { pageType: 'registryTable', pageTemplate: 'ratings', idType: 'rating', pageTitle: 'Ratings', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 12 },
  { pageType: 'registryTable', pageTemplate: 'audioconfigs', idType: 'audioconfig', pageTitle: 'Audio Config and Narrative Description Tracks', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 13 },
  { pageType: 'registryTable', pageTemplate: 'studios', idType: 'studio', pageTitle: 'Studio Codes', schemaBuild: '1.0.0', menuLevel: 3, pageOrder: 14 },
  { pageType: 'descriptiveText', pageTemplate: 'creationdate', pageTitle: 'Creation Date', menuLevel: 3, pageOrder: 15 },
  { pageType: 'registryTable', pageTemplate: 'facilities', idType: 'facility', pageTitle: 'Facility Codes', schemaBuild: '2.0.0', menuLevel: 3, pageOrder: 16 },
  { pageType: 'descriptiveText', pageTemplate: 'standard', pageTitle: 'Standard', menuLevel: 3, pageOrder: 17 },
  { pageType: 'descriptiveText', pageTemplate: 'pkgtypes', pageTitle: 'Package Types', menuLevel: 3, pageOrder: 18 },
  { pageType: 'descriptiveText', pageTemplate: 'imax', pageTitle: 'IMAX', menuLevel: 3, pageOrder: 19 },
  { pageType: 'descriptiveText', pageTemplate: 'references', pageTitle: 'References', menuLevel: 3, pageOrder: 20 },
  { pageType: 'descriptiveText', pageTemplate: 'acknowledgements', pageTitle: 'Acknowledgements', menuLevel: 3, pageOrder: 21 },
  { pageType: 'descriptiveText', pageTemplate: 'translations', pageTitle: 'Translations', menuLevel: 3, pageOrder: 22 },
  { pageType: 'descriptiveText', pageTemplate: 'updates', pageTitle: 'Updates', menuLevel: 3, pageOrder: 23 },
  { pageType: 'menuCollapseEnd', pageTemplate: 'namingconvention', pageTitle: 'Naming Convention End', menuLevel: 2 },
  { pageType: 'menuCollapse', pageTemplate: 'metadataregistry', pageTitle: 'Metadata Registry', menuLevel: 2 },
  { pageType: 'descriptiveText', pageTemplate: 'registryintro', pageTitle: 'Introduction', menuLevel: 3, pageOrder: 24 },
  { pageType: 'registryTable', pageTemplate: 'cplmetadataexts', idType: 'cplmetadataext', pageTitle: 'CPL Metadata Extensions', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 25 },
  { pageType: 'registryTable', pageTemplate: 'kdmforensicflags', idType: 'kdmforensicflag', pageTitle: 'KDM Forensic Flags', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 26 },
  { pageType: 'registryTable', pageTemplate: 'uls', idType: 'ul', pageTitle: 'ULs', schemaBuild: '1.0.0-beta.1', menuLevel: 3, pageOrder: 27 },
  { pageType: 'menuCollapseEnd', pageTemplate: 'metadataregistry', pageTitle: 'Metadata Registry End', menuLevel: 2 },
  { pageType: 'menuCollapse', pageTemplate: 'terminologyregistry', pageTitle: 'Terminology Registry', menuLevel: 2 },
  { pageType: 'registryTable', pageTemplate: 'terms', idType: 'term', pageTitle: 'Terms', schemaBuild: '1.0.0-beta.2', menuLevel: 3, pageOrder: 28 },
  { pageType: 'menuCollapseEnd', pageTemplate: 'terminologyregistry', pageTitle: 'Terminology Registry End', menuLevel: 2 }
];

const realPages = pages.filter(function (p) { return typeof p.pageOrder === 'number'; });

function routePath(pageTemplate) {
  return '/registry/' + pageTemplate + '/';
}

function stripIllegalChars(s) {
  return String(s == null ? '' : s).replace(/([^a-z0-9]+)/gi, '');
}

/* ---------------------------------------------------------------------- */
/* Markdown rendering                                                      */
/* ---------------------------------------------------------------------- */

function createMarkdownRenderer() {
  const MarkdownIt = require('markdown-it');
  const md = new MarkdownIt({ html: true, breaks: true });
  md.use(require('markdown-it-footnote'));
  md.use(require('markdown-it-attrs'), {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: ['id', 'class', /^regex.*$/]
  });
  return md;
}

const SECTION_KEYS = ['int', 'ov', 'rls', 'ctt', 'cpl', 'spn', 'lst'];

// Ported content markdown contains site-root-absolute links/images (e.g.
// href="/registry/languages/", src="/img/registries/dcnc_ov-vf.jpg", and
// xlink:href="/registry/..." inside the illustratedguide SVG). These are
// baked into pre-rendered HTML strings (rendered by our own standalone
// markdown-it instance, not Hexo's own renderer/helpers), so they bypass
// Hexo's url_for()-based root-path prefixing entirely -- which breaks as
// soon as the site is served from a subpath (config.url has a pathname
// component, e.g. "https://isdcf.github.io/new-site/"). Rewrite them here
// using the same `urlFor` function the rest of the site uses, so behavior
// (root prefix, pretty_urls, relative_link mode, external-link passthrough)
// stays byte-for-byte consistent with every other page.
const INTERNAL_URL_ATTR_RE = /((?:[\w-]+:)?(?:href|src))="(\/[^"]*)"/g;

function rewriteInternalUrls(html, urlFor) {
  if (!urlFor) return html;
  return html.replace(INTERNAL_URL_ATTR_RE, function (match, attr, value) {
    return attr + '="' + urlFor(value) + '"';
  });
}

// Loads and renders whichever `{pageTemplate}-{section}.md` files exist for
// a given page, returning e.g. { ov: '<p>...</p>', rls: '<p>...</p>' }.
// Sections that have no corresponding file are simply absent from the
// result (matching registries-site's `{{#templateSections}}` behaviour,
// which only ever populated the sections it found files for).
//
// `urlFor`, if provided, is called to rewrite any site-root-absolute
// href/src/xlink:href found in the rendered HTML (see rewriteInternalUrls).
function loadSections(pageTemplate, md, urlFor) {
  const sections = {};
  SECTION_KEYS.forEach(function (key) {
    const file = path.join(CONTENT_DIR, pageTemplate + '-' + key + '.md');
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      let html = md.render(raw);
      html = rewriteInternalUrls(html, urlFor);
      // Mirrors registries-site's `{{#if section-X}}` truthiness check: a
      // handful of section files (e.g. imax-ctt.md) exist but are empty, in
      // which case the tab/box should simply not be rendered.
      if (html.trim()) sections[key] = html;
    }
  });
  return sections;
}

/* ---------------------------------------------------------------------- */
/* Registry data loading + per-registry special-case transforms            */
/* ---------------------------------------------------------------------- */

function loadRegistryJSON(pageTemplate) {
  const file = path.join(REGISTRIES_DATA_DIR, pageTemplate + '.json');
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

// ratings: compute `ratingsdcnc` from each entry's `ratings` array.
function transformRatings(data) {
  data.forEach(function (entry) {
    entry.ratingsdcnc = (entry.ratings || []).map(function (v) {
      return String(v).replace(/[^0-9a-zA-Z]/g, '').toUpperCase().substr(0, 5);
    });
  });
  return data;
}

// languages: resolve CLDR display names via ./language-utilities.js (a local
// port of external/registries' script of the same name).
function transformLanguages(data) {
  const utils = require('./language-utilities');
  data.forEach(function (entry) {
    try {
      const ptag = utils.parseLanguageTag(entry.rfc5646Tag);
      if (!ptag) throw new Error('Invalid RFC 5646 tag: ' + entry.rfc5646Tag);
      const locale = utils.parsedTagToCLDRLocale(ptag);
      entry.cldrLocale = utils.fromParsedTagToCanonicalTag(locale);
      entry.displayName = utils.buildDisplayName(locale);
    } catch (e) {
      console.warn('[registries] Could not resolve display name for language tag "' + entry.rfc5646Tag + '": ' + e.message);
    }
    // Fall back to whatever human-readable name is available so the table
    // cell is never left blank because of an unresolved CLDR lookup.
    if (!entry.displayName) {
      entry.displayName = entry.dcncLanguage || entry.rfc5646Tag;
    }
  });
  return data;
}

const REGISTRY_TRANSFORMS = {
  ratings: transformRatings,
  languages: transformLanguages
};

// Loads (and, where applicable, transforms) the registry data for a
// registryTable page. `pageTemplate` is e.g. "terms", "ratings", etc.
function loadRegistryData(pageTemplate) {
  const data = loadRegistryJSON(pageTemplate);
  const transform = REGISTRY_TRANSFORMS[pageTemplate];
  return transform ? transform(data) : data;
}

/* ---------------------------------------------------------------------- */
/* Static image assets                                                     */
/* ---------------------------------------------------------------------- */

// Ported content markdown references these at "/img/registries/<file>".
// Since they live under registries/img/ (not themes/isdcf/source/),
// Hexo's normal theme-asset pipeline won't publish them, so the Hexo
// generator registers an explicit route per file (see scripts/registries.js).
function loadImageAssets() {
  if (!fs.existsSync(IMG_DIR)) return [];
  return fs.readdirSync(IMG_DIR).map(function (filename) {
    return {
      path: 'img/registries/' + filename,
      data: fs.readFileSync(path.join(IMG_DIR, filename))
    };
  });
}

module.exports = {
  ROOT_DIR,
  CONTENT_DIR,
  IMG_DIR,
  REGISTRIES_DATA_DIR,
  pages,
  realPages,
  routePath,
  stripIllegalChars,
  createMarkdownRenderer,
  loadSections,
  rewriteInternalUrls,
  loadRegistryJSON,
  loadRegistryData,
  transformRatings,
  transformLanguages,
  loadImageAssets
};
