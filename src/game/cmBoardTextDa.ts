// Danske udgaver af bestyrelsens tekster (cmBoardText.ts) – samme form som de engelske tabeller, så oversættelsen kan vælges ved visning.
// De 290 blade til tillidsteksten (0x690d80) ligger i data/cmBoardTexts.da.json (samme rækkefølge som data/cmBoardTexts.json).
import S_DA from './data/cmBoardTexts.da.json';

export const SDA = S_DA as string[];

export const TITLE_DA = {
  fa: 'FA offentliggør forventninger',
  glory: 'Bestyrelsen forventer ære og berømmelse',
  title: 'Bestyrelsen vil have titlen',
  hope: 'Bestyrelsen håber på en succesfuld sæson',
  difficult: 'Bestyrelsen forventer en vanskelig sæson',
  look: 'Bestyrelsen ser frem til den nye sæson',
  announce: 'Bestyrelsen offentliggør forventninger',
  confidence: 'Opdatering af bestyrelsens tillid',
};

export const FA_HOW_DA = ['henrykt', 'meget fornøjet', 'fornøjet', 'tilfreds', 'ikke tilfreds', 'meget skuffet'];
export const FA_CONF_DA = (national: string, how: string) => `Det ${national} fodboldforbund er ${how} med din indsats som manager.`;

export const TAIL_DA = {
  a1: 'Bestyrelsen i {club} er noget utilfreds med din indsats som manager, især i lyset af din seneste arrogance over for bestyrelsen.\n\nBestyrelsen har tilkendegivet, at det udelukkende er fansenes begejstrede støtte til dig, der overbeviser dem om at beholde dig som manager.',
  a2: 'Bestyrelsen i {club} er noget utilfreds med din indsats som manager, især i lyset af din seneste arrogance over for bestyrelsen.',
  a3: 'Bestyrelsen i {club} er skuffet over din indsats som manager, især i lyset af din seneste arrogance over for bestyrelsen.\n\nBestyrelsen har tilkendegivet, at hvis det ikke var for fansenes begejstrede støtte, ville de overveje din stilling i klubben.',
  a4: 'Bestyrelsen i {club} er noget skuffet over din indsats som manager, især i lyset af din seneste arrogance over for bestyrelsen.',
  f1: 'Hvis det ikke bliver bedre, må vi måske til at lytte til de fans, der har efterlyst din afgang.',
  f2: 'Se bort fra de fans, der har efterlyst din afgang.\n\nDu har vores fulde tillid og støtte.',
  f3: 'Det er ærgerligt at se, at fansenes begejstrede støtte til holdet ser ud til at dale.',
  f4: 'Det glæder os at se, at du har opbygget et godt forhold til fansene.',
};

export const REQUEST_TITLE_DA: Record<number, string> = {
  1: 'Bestyrelsens reaktion på ønsket om at udvide stadion', 2: 'Bestyrelsens reaktion på ønsket om investering i ungdommen', 3: 'Bestyrelsens reaktion på ønsket om transferpenge',
  4: 'Bestyrelsens reaktion på ønsket om et højere lønbudget', 5: 'Bestyrelsens reaktion på ønsket om tid til at genopbygge truppen', 6: 'Bestyrelsens reaktion på ønsket om bonusbetalinger til spillerne',
};
export const REQUEST_TITLE_DA_DEFAULT = 'Bestyrelsens reaktion på ønsket om flere appelsiner til pausen';

export const RQ_DA = {
  c: 'Bestyrelsen i {club} har afvist dit ønske, men understregede, at de straks giver dig besked, hvis situationen ændrer sig.',
  a: 'Bestyrelsen i {club} har afvist dit ønske.\n\nDe minder høfligt om, at dit job er at lede holdet og ikke at drive klubbens forretningsside.',
};

export const REPLY_DA: Record<number, [string[], string]> = {
  1: [['Bestyrelsen i {club} er enig i, at stadion skal forbedres, hvis klubben skal udnytte sit fulde potentiale.\n\nDe forsikrer dig om, at der er planer på vej om at udvide stadion.',
    'Bestyrelsen i {club} mener ikke, at klubbens stadion trænger til en udvidelse.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} oplyser, at klubben ikke kan overveje at udvide stadion på nuværende tidspunkt på grund af manglende midler.',
    'Bestyrelsen i {club} mener ikke, at klubbens stadion trænger til en udvidelse.\n\nDe vil desuden helst ikke have spildt deres tid på sager, der ikke har noget med dine managerpligter at gøre.',
    'Bestyrelsen i {club} oplyser, at de ikke mener, at klubben har brug for en udvidelse af stadion på nuværende tidspunkt.',
    'Bestyrelsen i {club} oplyser, at de ikke mener, at klubben har brug for en udvidelse af stadion på nuværende tidspunkt.',
    'Bestyrelsen i {club} minder høfligt om, at de allerede har oplyst, at de overvejer at udvide klubbens stadion.',
    'Bestyrelsen i {club} minder dig om, at klubben desværre ikke ejer stadion og derfor ikke kan udvide dets kapacitet.'],
  'Bestyrelsen i {club} oplyser, at de ikke mener, at klubben har brug for en udvidelse af stadion på nuværende tidspunkt.'],
  2: [['Bestyrelsen i {club} oplyser, at de investerer i at udvide klubbens træningsfaciliteter.',
    'Bestyrelsen i {club} mener ikke, at klubbens træningsfaciliteter trænger til forbedring.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} oplyser, at klubben ikke kan overveje at forbedre træningsfaciliteterne på nuværende tidspunkt på grund af manglende midler.',
    'Bestyrelsen i {club} mener ikke, at klubbens træningsfaciliteter trænger til forbedring.\n\nDe vil desuden helst ikke have spildt deres tid på sager, der ikke har noget med dine managerpligter at gøre.',
    'Bestyrelsen i {club} oplyser, at de ikke mener, at klubbens træningsfaciliteter trænger til forbedring.',
    'Bestyrelsen i {club} oplyser, at de ikke mener, at klubbens træningsfaciliteter trænger til forbedring.',
    'Bestyrelsen i {club} minder høfligt om, at de allerede har godkendt forbedringen af klubbens træningsfaciliteter.'],
  'Bestyrelsen i {club} oplyser, at de ikke mener, at klubbens træningsfaciliteter trænger til forbedring.'],
  3: [['Bestyrelsen i {club} oplyser, at de straks stiller ekstra transferpenge til rådighed for dig.',
    'Bestyrelsen i {club} har allerede oplyst, at de ikke er villige til at give dig ekstra transferpenge.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} oplyser, at klubben ikke har råd til at afsætte ekstra transferpenge til dig.',
    'Bestyrelsen i {club} har allerede oplyst, at de ikke er villige til at give dig ekstra transferpenge.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} mener, at du har tilstrækkelige ressourcer til at udføre dit arbejde.',
    'Bestyrelsen i {club} mener, at du har tilstrækkelige ressourcer til at udføre dit arbejde.',
    'Bestyrelsen i {club} minder høfligt om, at de for nylig allerede har givet dig ekstra transferpenge.',
    'Bestyrelsen i {club} mener, at du har tilstrækkelige ressourcer til at udføre dit arbejde.',
    'Bestyrelsen i {club} minder høfligt om, at de endnu ikke har set noget udbytte af de penge, du allerede har brugt i denne sæson.'],
  'Bestyrelsen i {club} mener, at du har tilstrækkelige ressourcer til at udføre dit arbejde.'],
  4: [['Bestyrelsen i {club} oplyser, at de ændrer klubbens lønstruktur en smule, så du kan tiltrække flere spillere til klubben.',
    'Bestyrelsen i {club} har allerede oplyst, at de ikke er villige til at ændre lønstrukturen i klubben.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} har allerede oplyst, at de ikke er villige til at ændre lønstrukturen i klubben, da de mener, det ville bringe klubbens økonomiske stabilitet i fare.',
    'Bestyrelsen i {club} har allerede oplyst, at de ikke er villige til at ændre lønstrukturen i klubben.\n\nDe vil desuden helst ikke have spildt deres tid gentagne gange på dette spørgsmål.',
    'Bestyrelsen i {club} mener, at den nuværende lønstruktur i klubben burde give dig mulighed for at tiltrække spillere af en tilstrækkelig kaliber til at få succes.',
    'Bestyrelsen i {club} mener, at den nuværende lønstruktur i klubben burde give dig mulighed for at tiltrække spillere af en tilstrækkelig kaliber til at få succes.',
    'Bestyrelsen i {club} minder høfligt om, at de for nylig allerede har ændret klubbens lønstruktur for dig.'],
  'Bestyrelsen i {club} mener, at den nuværende lønstruktur i klubben burde give dig mulighed for at tiltrække spillere af en tilstrækkelig kaliber til at få succes.'],
};
export const TIME_DA: Record<number, string> = {
  0: 'Bestyrelsen i {club} oplyser, at de har tiltro til din evne som manager og vil give dig tid til at vende klubben.',
  4: 'Bestyrelsen i {club} er overrasket over dit ønske om mere tid til at omforme truppen, da bestyrelsen indtil nu ikke har vist nogen utilfredshed med din indsats.',
  6: 'Bestyrelsen i {club} har allerede oplyst, at de er villige til at vente på, at dit styre giver resultater, men de finder din usikkerhed temmelig foruroligende.',
};
export const TIME_DA_DEFAULT = 'Bestyrelsen i {club} mener, at du har haft mere end rigeligt med tid til at gøre dette hold til dit eget.\n\nDin jobsikkerhed afhænger af de resultater, dit hold opnår.';

export const ULT_CONFIRM_DA: Record<number, string> = {
  1: 'de enten går med til at udvide klubbens stadion', 2: 'de enten går med til at forbedre klubbens træningsfaciliteter', 3: 'de enten går med til at stille flere transferpenge til rådighed',
};
export const ULT_CONFIRM_DA_DEFAULT = 'de enten går med til at øge lønbudgettet';
export const ultConfirmDa = (short: string, what: string) => `Er du sikker på, at du vil stille bestyrelsen i ${short} et ultimatum ?\n\nDet vil være en kort erklæring om, at ${what}, eller at du træder tilbage fra dit job.`;

export const ULT_TITLE_DA = {
  fans: (short: string) => `${short}-fans reagerer på spekulationer`,
  stadium: ['Bestyrelsen går med til at udvide stadion', 'Bestyrelsen nægter at udvide stadion'],
  training: ['Bestyrelsen går med til at forbedre træningsfaciliteterne', 'Bestyrelsen nægter at forbedre træningsfaciliteterne'],
  funds: ['Bestyrelsen går med til at stille flere penge til rådighed til transfers', 'Bestyrelsen nægter at stille flere penge til rådighed til transfers'],
};

const RUMOUR_DA = 'Det rygtes, at {club}-manager {m} har stillet sin klubs bestyrelse et ultimatum: Enten';
export const FANS_DA = {
  s1: `${RUMOUR_DA} skal de udvide stadion som et tegn på ambitioner for fremtiden, ellers forlader han klubben.\n\nTilhængerne siges at miste tålmodigheden med {m} og mener, at {stadium} allerede er et værdigt hjem for holdet.`,
  s1b: `${RUMOUR_DA} skal de udvide stadion som et tegn på ambitioner for fremtiden, ellers forlader han klubben.\n\nSelv om klubbens tilhængere siges at miste tålmodigheden med {m}, har de givet udtryk for, at det er på tide, at bestyrelsen forbedrer stadion.`,
  t1: `${RUMOUR_DA} skal de investere i at forbedre klubbens træningsfaciliteter, ellers forlader han klubben.\n\nTilhængerne siges at mene, at klubben allerede har et fremragende træningsanlæg, og de kan ikke forstå {m's} klager.`,
  t1b: `${RUMOUR_DA} skal de investere i at forbedre træningsfaciliteterne, ellers forlader han klubben.\n\nSelv om tilhængerne siges at miste tålmodigheden med {m's} lederstil, har de givet udtryk for, at det er på tide, at bestyrelsen indser, at klubbens fremtid ligger i ungdomsholdet, og at den fremtid bliver dyster uden ordentlig investering i træningsfaciliteterne.`,
  f1: `${RUMOUR_DA} skal de give ham de transferpenge, han har brug for, for at gøre holdet virkelig konkurrencedygtigt, ellers forlader han klubben.\n\nTilhængerne har givet udtryk for, at de forstår bestyrelsens modvilje mod at overøse {m} med penge, og de mener, at pengene bedre kan gemmes, til der står en mere kompetent manager ved roret.`,
  w1: `${RUMOUR_DA} skal de give ham en lønstruktur, der kan tiltrække spillere af bedre kaliber, ellers forlader han klubben.\n\nTilhængerne sagde, at de ikke kan forstå {m's} klager, og at de tror, han forsøger at fremtvinge en grund til at forlade klubben.`,
  s2: `${RUMOUR_DA} skal de udvide stadion, ellers forlader han klubben.\n\nTilhængerne siges at forstå {m's} frustrationer og har givet udtryk for, at det er på tide, at bestyrelsen skaber den slags stadion, klubben fortjener.`,
  t2: `${RUMOUR_DA} skal de investere i træningsfaciliteterne, ellers forlader han klubben.\n\nTilhængerne siges at forstå {m's} frustrationer og har givet udtryk for, at det er på tide, at bestyrelsen indser, at klubbens fremtid ligger i ungdomsholdet, og at den fremtid bliver dyster uden ordentlig investering i træningsfaciliteterne.`,
  f2: `${RUMOUR_DA} skal de give ham de transferpenge, han har brug for, for at gøre holdet virkelig konkurrencedygtigt, ellers forlader han klubben.\n\nTilhængerne siges at forstå {m's} frustrationer og har givet udtryk for, at det er på tide, at bestyrelsen bakker sine udtalte ambitioner op med rigtige penge.`,
  w2: `${RUMOUR_DA} skal de give ham en lønstruktur i klubben, der kan tiltrække spillere af bedre kaliber, ellers forlader han klubben.\n\nTilhængerne siges at forstå {m's} frustrationer og har givet udtryk for, at det er på tide, at bestyrelsen bakker sine udtalte ambitioner op med rigtige penge.`,
};
export const BOARD_DA: Record<number, string[]> = {
  1: ['Et kort fax fra bestyrelsen i {club} oplyser, at de allerede overvejede at udvide stadion og forventer, at byggearbejdet begynder i den nærmeste fremtid ',
    'Et kort fax fra bestyrelsen i {club} oplyser, at de allerede overvejede at forbedre klubbens træningsfaciliteter og forventer, at arbejdet begynder i den nærmeste fremtid.',
    'Et kort fax fra bestyrelsen i {club} oplyser, at de stiller ekstra transferpenge til rådighed for dig.\n\nDe har gjort det klart, at de forventer, at de ekstra penge bringer klubben succes.',
    'Et kort fax fra bestyrelsen i {club} oplyser, at de øger budgettet til spillerlønninger.\n\nDe forventer at se dig foretage nogle vigtige køb i den allernærmeste fremtid.'],
  2: ['Bestyrelsen i {club} oplyste, at de ikke kan efterkomme dit krav om at udvide stadion. De mener, at denne beslutning er en forretningsmæssig beslutning og ikke noget, en manager bør blande sig i.\n\nDe kan ikke acceptere den slags udbrud og forventer, at dit skrivebord er ryddet inden i morgen tidlig.',
    'Bestyrelsen i {club} oplyste, at de ikke kan efterkomme dit krav om forbedringer af klubbens træningsfaciliteter.\n\nDe kan ikke acceptere den slags udbrud og forventer, at dit skrivebord er ryddet inden i morgen tidlig.',
    'Bestyrelsen i {club} oplyste, at de ikke kan efterkomme dit krav om ekstra transferpenge.\n\nDe kan ikke acceptere den slags udbrud og forventer, at dit skrivebord er ryddet inden i morgen tidlig.',
    'Bestyrelsen i {club} oplyste, at de ikke kan efterkomme dit krav om at forbedre det nuværende lønbudget.\n\nDe mener, at det nuværende lønbudget er rigtigt i betragtning af klubbens nuværende økonomiske situation.\n\nDe kan ikke acceptere den slags udbrud og forventer, at dit skrivebord er ryddet inden i morgen tidlig.'],
  3: ['Ved et privat møde med dig oplyste bestyrelsen i {club}, at enhver beslutning om at udvide stadion ville være en kommerciel beslutning og ikke noget, klubbens manager afgør.\n\nDe værdsætter dog det arbejde, du tidligere har udført i klubben, og er villige til at se bort fra dit udbrud denne ene gang.',
    'Ved et privat møde med dig oplyste bestyrelsen i {club}, at de ikke er villige til at forbedre klubbens træningsfaciliteter på nuværende tidspunkt.\n\nDe værdsætter dog det arbejde, du tidligere har udført i klubben, og er villige til at se bort fra dit udbrud denne ene gang.',
    'Ved et privat møde med dig oplyste bestyrelsen i {club}, at der simpelthen ikke er flere penge til rådighed til transfers.\n\nDe værdsætter dog det arbejde, du tidligere har udført i klubben, og er villige til at se bort fra dit udbrud denne ene gang.',
    'Ved et privat møde med dig oplyste bestyrelsen i {club}, at der simpelthen ikke er flere penge til rådighed til at øge lønbudgettet.\n\nDe værdsætter dog det arbejde, du tidligere har udført i klubben, og er villige til at se bort fra dit udbrud denne ene gang.'],
};
export const INEXPERIENCED_DA = 'Ved et privat møde med dig oplyste bestyrelsen i {club}, at sådanne krav er upassende fra en så uerfaren manager.\n\nDe er villige til at undskylde dette udbrud, men anbefaler, at du ikke gentager det.';

export const APPOINT_DA = {
  prev: (club: string, manager: string, prevClub: string) => `${club} har ansat ${manager} som deres nye manager.\n\n${prevClub} leder nu efter en ny manager.`,
  plain: (club: string, manager: string) => `${club} har ansat ${manager} som manager.`,
};

/** Danske udgaver af forventningens brødtekst (0x694440) */
export function expectBodyDa(club: string, f: number, nonEurope: boolean, autoPromo: boolean): string {
  const pre = `Bestyrelsen i ${club} forventer`;
  const eu = (e: string, c: string) => (nonEurope ? c : e);
  if (f & 1) {
    if (f & 0x400) return `${pre} succes ${eu('i Europa', 'i kontinentale turneringer')} og en fremragende placering i ligaen ved sæsonens slutning.`;
    if (f & 0x100) return `${pre} succes både hjemme og ${eu('i Europa', 'på kontinentet')}.`;
    return `${pre} ${eu('europæisk', 'kontinental')} kvalifikation.`;
  }
  if (f & 2) {
    if (f & (0x400 | 0x100)) return `${pre} stor succes på alle områder i denne sæson.`;
    return `${pre}, at klubben gør et seriøst forsøg på ${autoPromo ? 'oprykning' : 'mesterskabet'} i denne sæson.`;
  }
  const grp = (base: string, euro: string, cup: string) => `${pre}, at ${f & 0x400 ? euro : f & 0x100 ? cup : base} i denne sæson.`;
  if (f & 4) return grp('holdet rykker op', 'holdet rykker op og opnår europæisk succes', 'holdet rykker op og får et succesfuldt pokalløb');
  if (f & 8) return grp('klubben når playoff', 'klubben når playoff og opnår europæisk succes', 'klubben når playoff og får et succesfuldt pokalløb');
  if (f & 0x40) return grp('klubben opnår en respektabel placering i ligaen', 'klubben opnår europæisk succes og en respektabel placering i ligaen', 'klubben opnår pokalsucces og en respektabel placering i ligaen');
  if (f & 0x10) return grp('klubben holder sig fri af nedrykning', 'klubben opnår europæisk succes og holder sig fri af nedrykning', 'klubben opnår pokalsucces og holder sig fri af nedrykning');
  if (f & 0x20) return grp('klubben kæmper tappert mod nedrykning', 'klubben opnår europæisk succes og kæmper tappert mod nedrykning', 'klubben opnår pokalsucces og kæmper tappert mod nedrykning');
  return `${pre}, at du forbedrer klubbens trup i løbet af denne sæson.`;
}
