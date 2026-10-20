# 3D scroll prototip (Three.js)

Frontend loyihadan alohida sinov. Build kerak emas — Three.js CDN'dan yuklanadi.

## Ishga tushirish

```bash
cd ~/KHOProjects/KHOPortfolio/test && python3 -m http.server 5500
```

Brauzerda: http://localhost:5500

## Boshqarish
- Sichqoncha g'ildiragi / touchpad / telefonda barmoq — scroll
- `↓ ↑`, `PageDown`, `Space` — klaviatura, `Home` — boshiga
- Konsolda `__scrollTo(5)` — 5 ekran pastga sakrash (debug)

## Sozlash (`main.js` boshida)
| O'zgaruvchi | Ma'nosi |
|---|---|
| `WALK_END` | Odam necha ekran scroll'da yaqinlashadi |
| `OPEN_END` | Noutbuk qachon ochilib bo'ladi |
| `INTRO_END` | Birinchi (chapga) burilish tugashi |
| `SEGMENT` | Har bir chap/o'ng almashinuv uzunligi |
| `HOLD_FRAC` | Segmentning to'xtab turish qismi (karta ko'rinadi) |
| `TURN` | Burilish burchagi (45°) |
| `PROJECTS` | Kartalardagi loyihalar (cheksiz aylanadi) |
