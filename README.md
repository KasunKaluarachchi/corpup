# CoreUp Datacenter Cleaning Website

Static multi-page CoreUp website with separate HTML pages, shared CSS/JS, the CoreUp logo, and a varied set of generated photographic/technical visuals.

## Pages
- `index.html` — Home
- `services.html` — Services
- `quality-safety.html` — Quality & Safety
- `industries.html` — Environments
- `about.html` — About
- `contact.html` — Contact

## Assets
```
assets/
├── css/style.css          Shared stylesheet
├── js/main.js             Shared behaviour (menu, reveal, counters, contact form, parallax)
└── images/
    ├── brand/             Logo
    ├── home/              index.html
    ├── services/          services.html
    ├── quality-safety/    quality-safety.html
    ├── industries/        industries.html
    ├── about/             about.html
    └── contact/           contact.html
```
Each page folder holds that page's `hero.*` background plus the images used in its sections. The site intentionally avoids repeating the same image across pages.

## Run locally
Use a local web server rather than `file://` so all asset paths behave consistently:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` from the `site` directory.
