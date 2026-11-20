# TEAM — Campus Marketplace

## Members & module allocation
| Student ID | Name | Module(s) owned |
|---|---|---|
| 20XXXXXX | Fatima Raeef | m1_auth |
| 202209427 | Maryam Ali Hasan | m2_catalog |
| 20XXXXXX | Alia | m3_cart |
| 20XXXXXX |  | m4_orders |
| 20XXXXXX | Maryam Khalid | m5_admin |

## Weekly contribution log (optional)
| Week | Student | What I did (module, files, PRs) |
|---|---|---|
| 4 |  |  |
| 6 |  |  |
| 10 | Maryam Ali Hasan | m2_catalog: API endpoints (products list + filters, product detail, categories) in `modules/m2_catalog/handler.php`; catalog page `public/catalog/` (search, category filter, product sheet, shared tile `tile.js`); home page (`public/index.html`, `home.js`); shared theme (`public/theme.css`, `color-mode.js`, `fonts/`, `favicon.svg`) |
| 13 |  |  |

## Frontend style (all module pages)
Set up by Maryam Ali Hasan (m2_catalog): shared theme, color mode, font, favicon and the home page layout.

- One framework only: Bootstrap 5.3.3 (CSS only, no Bootstrap JS — vanilla JS rule).
- Shared theme: `public/theme.css` (colors, light/dark mode, Inter font from `public/fonts/`) + `public/color-mode.js` (theme switch).
- Copy the `<head>` of `public/catalog/index.html` to start a new page; use relative paths (`../theme.css`).
- Use normal Bootstrap classes: `btn btn-primary`, `card`, `alert alert-danger` (error banner); `btn-close` for close buttons.

