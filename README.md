# Corpup — website

Static, dependency-free website for **Corpup**, a specialist data centre cleaning company.
Swedish is the default language with an English toggle in the header.

## Structure

```
index.html               Home — hero background video slot
tjanster.html            Services (8 detailed services + FAQ) — before/after slider
kvalitet-sakerhet.html   Quality & safety (ISO 45001 focus)
om-oss.html              About us — photo gallery + lightbox
kontakt.html             Contact + quote form
css/style.css            Design system + all components
js/i18n.js               English translation dictionary (only)
js/main.js               Language switch, mobile nav, scroll reveal, form
js/media.js              Hero video, before/after slider, lightbox gallery
assets/favicon.svg
assets/MEDIA-GUIDE.md    Exact file paths/specs for real photos & video
robots.txt · sitemap.xml
```

No build step, no framework, no npm. Open `index.html` or upload the folder to any host.

## Running locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## How the bilingual setup works

Swedish text lives **in the HTML**, so pages are fully readable and indexable
without JavaScript. `js/i18n.js` contains *only* the English strings, keyed by the
`data-i18n` attribute on each element. There is no duplication of the Swedish copy.

Adding or editing text:

1. Write the Swedish directly in the HTML and give the element a key:
   `<h2 data-i18n="home.why.h2">Damm är en driftrisk.</h2>`
2. Add the same key to `js/i18n.js` with the English value.
   A missing key is harmless — the Swedish text simply stays.

Attributes (placeholders, titles) use
`data-i18n-attr="placeholder:form.placeholder"`.

Page `<title>` and meta description are translated from the `TITLES` map at the top
of `js/main.js`.

The chosen language is remembered in `localStorage`, and `?lang=en` / `?lang=sv`
force a language on load — useful for linking to the English version directly.

## Wiring up the contact form

The form works out of the box: with no backend configured it opens the visitor's
mail client with the enquiry pre-filled. To post it to a real endpoint instead,
set one value near the bottom of `js/main.js`:

```js
var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
```

It then POSTs the fields as JSON. Works with Formspree, Netlify Forms, Basin or
your own handler. A honeypot field (`company_url`) is already in place for spam.

## Interactive media (photos & video)

Three components are built and wired up, but no real photos or video exist
yet — **see `assets/MEDIA-GUIDE.md` for exact file paths and specs.**

- **Hero background video** (`index.html`) — a muted looping video behind
  the homepage hero. Falls back to the current static light hero if no
  file is present; respects `prefers-reduced-motion`.
- **Before/after slider** (`tjanster.html`) — a drag-to-compare slider,
  fully keyboard-accessible via the underlying range input.
- **Photo gallery + lightbox** (`om-oss.html`) — a 6-photo grid that opens
  full-screen with keyboard (arrows/Escape) and swipe navigation.

Until real files exist at the documented paths, the before/after slider and
the 6 gallery items show a small hand-drawn line illustration instead of a
real photo, each tagged with a visible "Exempelbild" / "Sample illustration"
badge — **these are
placeholders, not real photos of Corpup's facilities or work**, and must be
swapped for real files before launch. Any slot without a custom
illustration falls back to a plain diagonal-hatch pattern naming the exact
path it's waiting for. Drop a real file in at that path and the
illustration/hatch disappears automatically — no code changes needed.

## Placeholders to replace before launch

These are stand-ins and must be updated with the real details:

| Where | Placeholder |
|---|---|
| All pages, header/footer/contact | `08-000 00 00` (switchboard) |
| All pages | `08-000 00 01` (emergency line) |
| All pages | `info@corpup.se`, `offert@corpup.se` |
| `kontakt.html` | Visiting address `Exempelgatan 12, 111 22 Stockholm` |
| All pages, footer | `Org.nr 559XXX-XXXX` |
| `<head>` canonical + `sitemap.xml` + `robots.txt` | `https://www.corpup.se/` |
| `index.html` | JSON-LD block (`ProfessionalService`) — phone, email, URL |

Search for `000 00 00` and `559XXX` to find them all quickly.

Claims that should be verified against actual certification before publishing:
ISO 45001, and the references to ISO 9001 / ISO 14001 on `kvalitet-sakerhet.html`
(currently worded as *standards we work to*, not as held certificates — tighten or
strengthen that wording depending on what Corpup is actually certified for).

## Design

- **Colour** — light throughout: white/`#f7f9fb` grounds, dark navy text (`#0b1220`),
  technical teal `#00a3b5` as the only accent. The site intentionally always renders
  light — `prefers-color-scheme: dark` is not honoured, by request. All colours are
  still tokens in `:root` if that's ever revisited.
- **Type** — Inter (Google Fonts) with a system fallback stack.
- **Motion** — subtle scroll reveal, fully disabled under `prefers-reduced-motion`.
  The hero video (once added) is muted, loops, pauses off-screen, and never
  autoplays for visitors with reduced motion set.
- **Accessibility** — skip link, focus-visible outlines, `aria-current` on nav,
  labelled form fields, live region on the form status, keyboard-dismissable mobile
  menu, and a fully keyboard/swipe-navigable lightbox with a focus trap.
- **Photography** — the hero background is an animated SVG illustration
  (`assets/datacentre-cleaning-hero.svg`, with a static fallback for
  `prefers-reduced-motion`). The before/after slider and gallery are real
  interactive components (see "Interactive media" above) that ship with
  placeholder illustrations until real assets are added — see the note
  there. The homepage's "Dust is not dirt" section is a single framed
  infographic image (`assets/infographics/dust-risk.jpg`); its text is
  baked into the image in **English only** and does not participate in the
  SV/EN language toggle — Swedish visitors will see English text there
  until/unless a Swedish version of the graphic is produced.

## Content sources

Terminology and service scope were modelled on the Swedish market references
supplied: Nordic Imperium Facilities, Öhrn Olsson and PIMA. All copy is original.
