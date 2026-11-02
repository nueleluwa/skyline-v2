# Henry Montego Homes — Oniru Twin Towers (one-page site) · v3

Plain HTML, CSS and JavaScript. No build step, no dependencies. Open `index.html`, or upload the folder to any static host.

**The idea.** The place carries it. The opening screen follows the client's hero reference: the brochure's glowing line drawing centred on navy, a serif headline with a gold italic line, and gold light along the foot. Every section below carries the same language: small gold labels, serif headings with a gold italic phrase, gold frames and gold primary buttons. Further down, one pinned frame moves in from the whole building to the Atlantic water running down its terraces.

```
index.html        all sections, semantic markup, SEO / social metadata
css/styles.css    tokens, one type scale, one block per section
js/config.js      the only file you normally need to edit
js/main.js        Atlantic zoom, film on view, bar, reveals, floor-plan dialog, enquiry form
assets/           optimised WebP renders, logo, Clash Grotesk (self-hosted), two credited Wikimedia files, favicon, og-image
.taste-skill/     the art direction this version was built from (direction-sheet.txt); v2/ keeps the previous one
```

## Before launch

Edit `js/config.js`:

| Setting | What it does |
| --- | --- |
| `formEndpoint` | URL that accepts a JSON POST (Formspree, CRM webhook, Zapier/Make, your API). While empty the form validates, then offers the visitor a pre-filled **email** (info@henrymontegohomes.com) or **WhatsApp** (09025441368) message. It never shows a fake "sent" message. |
| `registerInterestUrl` | The existing Tally form. When set, every "Register interest" link opens it. While empty they scroll to the enquiry form. |

Also in `index.html`:

- Make `og:image` / `twitter:image` absolute URLs on the live domain, and add `<link rel="canonical">` and `og:url`.
- Add the Facebook link in the footer (comment marks the spot) once supplied.
- Check the amenities sheet and the five rows under "Residences, retail and more" against the approved development documentation. The short descriptions under each amenity are sample copy.
- "Launch date to be confirmed" appears in the development facts, the amenities sheet and the form intro. Update all three when a date is set.
- Two pictures are not the client's own: the Victoria Island aerial (Ayorinde Ogundele) and the Atlantic film at Jacqueville beach, Côte d'Ivoire (Poro26). Both are CC BY-SA 4.0 and credited in the footer; details in `assets/credits.json`.
- There is no "Watch the Film" button because no film of the development exists. Add a button and a dialog when one does.

Type: Clash Grotesk (Fontshare free licence) for text, Libre Caslon Text (SIL Open Font Licence) for the hero headline, both self-hosted in `assets/fonts/`. The General Sans files there are left over from v2 and unused. Icons: Phosphor (MIT).
