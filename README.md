# juliettegudknecht.github.io/portfolio

Personal portfolio of Juliette Gudknecht, federal data scientist and data steward. Live at [juliettegudknecht-code.github.io/portfolio](https://juliettegudknecht-code.github.io/portfolio/).

Hand-built with plain HTML, CSS, and JavaScript. No frameworks, no build step, no trackers. Everything the site needs is in this repository.

## Structure

```
index.html                          page content and a small inline intro gate
og.jpg                              social share card
assets/
  css/
    base.css                        fonts, color variables, resets, typography
    components.css                  hero, case studies, sections, folders, timeline, dark starfield theme
    responsive.css                  tablet and mobile adjustments (loads last)
  js/
    main.js                         tabs, career timeline, dialogs, scrollspy, and music
    accessibility.js                accessibility panel, settings persisted to localStorage
    animations.js                   scroll reveal and starfield
  images/                           photos and the nebula background
  fonts/                            Atkinson Hyperlegible and Bricolage Grotesque (woff2)
  Juliette-Gudknecht-Resume.pdf     one-page resume served by the Export button
```

## Running locally

Any static server works:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly from disk also works for most of the site.

## Accessibility

The panel in the corner offers reduced motion, plain language, larger text, high contrast, a readable font, underlined links, and image captions. Settings persist between visits. All animations also respect the `prefers-reduced-motion` system setting, and the site is keyboard navigable.

## Credits

- [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) by the Braille Institute
- [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) by Mathieu Triay
- Photos are my own. The nebula background texture was generated with an AI image tool and sits behind a hand-drawn star field.

(c) 2026 Juliette Gudknecht. Views my own.
