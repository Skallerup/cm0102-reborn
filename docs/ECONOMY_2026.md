# Økonomien i 2026/27-databasen – kalibrering mod virkeligheden

Gælder kun nye spil med den moderne database (ikke originalen: `g.econ`/`cmActive` er urørt). Slået til ved spilstart
(`GameState.m26`, `src/game/econ26.ts`) – ældre gemte spil bruger de gamle formler. Valutaen internt er **€**.
Mål: `NATIONS="England,Spain,Germany,Italy,France,Holland,Portugal,Denmark" npx tsx scripts/econ-run.ts 3 public/data/world.json`.
Test: `tests/economy2026.test.ts`.

## Virkelighedens tal (sæson 2024/25, hentet 16/11-2026)

| Kilde | Tal |
|---|---|
| Deloitte Football Money League 2026 (jan. 2026) | De 20 største klubber: rekord €12,4 mia. (+11 %); commercial €5,3 mia. (43 %), broadcast 38 %, matchday €2,4 mia. (~19 %, +16 %). 9 PL-klubber i top 20. |
| Deloitte Annual Review of Football Finance 2026 (jul. 2026) | Premier League: omsætning £6,8 mia. (+8 %; ≈ £340 mio./klub ≈ €400 mio.), løn £4,4 mia. (≈ 65 %), tab før skat £948 mio. (2023/24: £135 mio.). Championship: omsætning £942 mio. (−2 %), tab £355 mio., kun 3 klubber i overskud. Europa: over €40 mia. |
| UEFA European Club Finance and Investment Landscape 2025 | Topdivisioner: ca. €28,6 mia. (2024) → over €30 mia. (2025); løn ≈ 47 % af omsætningen i snit; PL = 60 % af transferforbruget (gns. €24 mio. pr. spiller mod €4-5 mio. i andre ligaer); Man Utd netto-transferforbrug €794 mio., Chelsea €754 mio., Arsenal €675 mio. (5 år). |
| Deloitte/ligarapporter 2024/25 | Bundesliga (DFL): €5,0+ mia. (18 klubber), løn €2,3 mia., løn/omsætning 54 % (58 % året før), spillerløn €1,72 mia. LaLiga: €4,1 mia. (+9 %), løn €2,5 mia., ≈ 60 %. Serie A: ≈ €3,0 mia. (+4 %), løn/omsætning 66 %. Ligue 1: €2,2 mia. (−15 %), løn €1,7 mia., løn/omsætning ≈ 77-80 %. |
| Premier League udbetalinger 2024/25 | Lige andel ≈ £96,9 mio. + £7,9 mio. central commercial; Liverpool (1.) £174,9 mio. i alt (merit + facility £53,1 mio. + ...), Southampton (20.) £109,2 mio. i alt (merit £2,6 mio. + facility £9,7 mio.); ≈ £2,7 mio. pr. placering. |
| UEFA Champions League 2025/26 | €2,467 mia. til CL-klubberne (+ Super Cup), EL €565 mio., ECL €285 mio.; deltagelse €18,62 mio., sejr €2,1 mio., uafgjort €0,7 mio., finalisterne €18,5 mio. (+ €6,5 mio. til vinderen); gennemsnit pr. CL-hold ≈ €68 mio. |
| Tilskuere/billetter 2024/25 | PL gns. 40k+ (billet ≈ £38/€43 i snit), Bundesliga 38,1k/38,6k (€28,8), Eredivisie 20,0k, LaLiga ≈ €40, Ligue 1 ≈ €24. |
| Danmark | F.C. København omsætning DKK 711,6 mio. (2025; 2024 DKK 466,6 mio.); Brøndby i størrelsesordenen DKK 450 mio. (*estimeret*). |

Kilder (links): Deloitte Money League (goal.com/espn.com/rte.ie referater), Deloitte Annual Review of Football Finance 2026
(deloitte.com, thescore.com, bloomberglaw.com), UEFA ECFIL 2025 (ecfil.uefa.com, skysports.com), DFL Economic Report 24-25
(report.bundesliga.de), UEFA prize distribution 2025/26 (uefa.com, beinsports.com, football365.com, footballtransfers.com),
PL prize money (si.com, football365.com), attendance (bundesliga.com, inkl.com), FCK (companydata.dk).

### Medianklubbens omsætning pr. liga, afledt af totalerne (mio. €, *estimeret*)
Medianen er lavere end gennemsnittet, fordi de 3-5 største klubber tager en uforholdsmæssig del.

| Liga | Total | Gns./klub | Median (mål i spillet) | Løn/omsætning | Top (kendt) |
|---|---|---|---|---|---|
| England PL | £6,8 mia. | ≈ 400 | **310** | 0,65 | ≈ 830 (City/United) |
| Spanien | 4,1 mia. | ≈ 205 | **100** | 0,60 | ≈ 1.160 (Real Madrid) |
| Tyskland | 5,0 mia. | ≈ 280 | **190** | 0,54 | ≈ 1.000 (Bayern) |
| Italien | ≈ 3,0-3,4 mia. | ≈ 150 | **108** | 0,66 | ≈ 540 (Inter) |
| Frankrig | 2,2 mia. | ≈ 110 | **66** | 0,77 | ≈ 800 (PSG) |
| Holland | ≈ 1,0 mia. | ≈ 55 | **45** | 0,60 | ≈ 280 (PSV) |
| Portugal | ≈ 1,0 mia. | ≈ 55 | **30** | 0,60 | ≈ 450 (Benfica) |
| Danmark | ≈ 0,4 mia. | ≈ 30 | **22** | 0,55 | ≈ 95 (FCK) |

Fordeling for medianklubben (*estimeret*, tabellen i `econ26.ts`): PL entré 15 %, tv 40 %, ligapræmie (merit + facility) 11 %,
sponsor + merchandise 34 %; øvrige ligaer tilsvarende (Holland entré 27 %, Spanien tv 45 % …). Matchday ≈ 14-20 %,
broadcast ≈ 40-55 %, commercial ≈ 30-40 % passer til Deloitte (top 20: 19/38/43).

## Hvad spillet gjorde før (mål 3 sæsoner, 8 ligaer, seed 3)

| | Virkelighed | Før | Efter |
|---|---|---|---|
| PL medianomsætning | 310 | 163-206 (−45 %) | 326-330 |
| La Liga | 100 | 149-163 | 96-100 |
| Bundesliga | 190 | 137-167 | 186-238 |
| Serie A | 108 | 110-136 | 111-123 |
| Ligue 1 | 66 | 101-130 | 63-75 |
| Eredivisie | 45 | 57-64 | 50-51 |
| Primeira Liga | 30 | 61-80 | 31-32 |
| Superliga | 22 | 28-34 | 24-28 |
| PL top (omsætning) | ≈ 830 | 274-340 | 981 |
| PL løn/omsætning | 0,65 | 0,30-0,33 | 0,52-0,61 |
| PL lønsum/år | ≈ 215 | 48-59 | 181-195 |
| PL saldo (median, start → 3. år) | ≈ 70-150 | 60 → 259 (×4,3) | 76 → 152 (×2) |
| Haaland efter 2 sæsoner | ≈ 190-200 | 193 → 127-139 | 193 → 205 → 193 |
| Europa-præmie, CL-klub (median; liga + Europa i alt) | ≈ 68 (gns. for Europa-delen) | ≈ 25-30 | 69-71 (Europa-delen ≈ 35-45; EL 20, ECL 14; max 167-195) |
| Championship (2. række England) | omsætning ≈ 46, løn/omsætning > 1,0, tab | – | omsætning 39-44, løn/omsætning 0,74-0,87, ingen klubber i minus |

(Tallene "Før" er fra den gamle formel: løn/omsætning 0,30 fordi lønningerne var ca. en fjerdedel af virkeligheden.)

## Hvad der blev ændret (kun nye spil, `g.m26`)
- `src/game/econ26.ts`: pr. liga medianomsætning, andele og hældninger (`kTv`, `kCom` = ln-vækst pr. omdømmepunkt – stejlere i
  Spanien/Italien/Frankrig, hvor de største klubber er langt foran). tv = medianens tv × e^(kTv·(rep − medianrep)); sponsor (80 %)
  + merchandise (20 %) tilsvarende. Ligaer uden tabel: Premier League-medianen × (wealth/2)^2,2 (hældningen mellem de otte
  kalibrerede ligaer).
- Billetprisen (`fairTicketPrice`) afledes af matchday-andelen (medianklubbens stadion × 83 % fyldning × hjemmekampe), +2,2 % pr. omdømmepunkt.
- Ligapræmie (`leaguePrize`): 1,6 × medianen til vinderen, 0,4 × til nr. sidst (PL: £53 mio. til nr. 1 mod £12 mio. til nr. 20).
- Europapræmier (`euroPrize`, UEFA 2025/26): deltagelse + værdisøjle (efter omdømme) fordelt over ligafasens kampe, sejr/uafgjort,
  1/8-, kvart-, semi-, finale-beløb (pr. kamp), vinderbonus. EL ≈ en fjerdedel, ECL ≈ en ottendedel (*estimeret*). Før: kun
  sejr/uafgjort (CL 2,8/0,9 mio.) og en halv sejrspræmie til knockout-kampe, som ikke engang kom i regnskabet.
- Lønkurven: ugeløn = 5.200 · (værdi/1 mio.)^0,72 + 800, ganget med en faktor pr. liga (`GameState.m26.kw`), målt ved spilstart,
  så medianklubbens lønsum (+ stab ≈ 12 %) = virkelighedens løn/omsætning × omsætningen. Løn aftager med værdien (en
  100 mio.-spiller tjener ca. 25 × en 1 mio.-spiller, ikke 100 ×). Maks. ugeløn uændret (750.000).
- Driftsudgifter (`upkeep`) = 34 % af tv + sponsor + merchandise ≈ 25 % af omsætningen (Deloitte: øvrige driftsudgifter 20-30 %).
- Startsaldo = 10 % af trupværdien + 14 ugers løn (før 12 % + 30 ugers løn – med de nye lønninger ville PL-medianen ellers have
  fået 150+ mio.). Ejernes udbytte: kassen holdes på 35 % af omsætningen (før 60 %).
- Udviklingen (`training.ts`, kun `g.m26`): loftet for spillernes CA er PA − 7 (før PA − 13, kalibreret til originalen) og det ugentlige
  CA-udsving 0,3 (før 0,8). 2026/27-databasens spillere har CA tæt på PA; med PA − 13 og fri tilfældig gang tabte stjernerne
  ~10 CA (≈ −35 % værdi) på to sæsoner (Haaland 193 → 127 mio.). Nu: 193 → 205 → 193.

## Kendte forbehold
- Ligalukket økonomi: klubberne i en liga handler mest med hinanden, så mediannetto-transferforbruget er ≈ 0 (virkeligheden: PL-klubber
  køber udefra for 50-70 mio. netto). Transferbudgettet (PL 65-76 mio.) følger i stedet virkelighedens netto-forbrug.
- Medianen for en enkelt sæson svinger ±10-15 % (sammensætning af op-/nedrykkere og Europa); testen tillader −25 % / +30 %.
- Andre divisioner (2. række m.fl.) bruger wealth-formlen; ikke målt mod virkelige regnskaber (Championship: tab £355 mio.).
- Tallene for Italien, Frankrig, Holland, Portugal og Danmark er afledt (totaler ÷ klubber, median skønnet) – *estimeret*.
