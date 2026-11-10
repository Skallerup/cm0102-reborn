// Enhedsguider på de andre sprog: "CM 01/02 beder om cd'en", Windows 11, Android, iPhone/iPad, Mac – og svaret
// "åbn browseren". Søgeordsanalysen (docs/SEO-KEYWORDS.md): tr "cd istiyor", "nasıl oynanır"; pt "como jogar no
// android/iphone", "sem cd"; es "jugar en android"; de "windows 11", "browsergame". Én side pr. sprog, med hreflang
// til hinanden og til den engelske /cm-01-02-windows-11/ (cd-fejlen, Windows 11 og Steam Deck).
import { esc, shotFig, type Page } from './layout';

interface D {
  lang: string; hreflang: string; dir: string; slug: string;
  title: string; h1: string; desc: string; lead: string;
  /** [overskrift, html] */
  sections: [string, string][];
  faq: [string, string][];
  cta: string; ctaNote: string; footer: string; en: string; shotAlt: string;
}

const EN = '/cm-01-02-windows-11/';
const MORE = (l: string) => `<p class="note">${l}: <a href="/cm-01-02-android/" hreflang="en">Android</a> · <a href="/cm-01-02-iphone-ipad/" hreflang="en">iPhone/iPad</a> · <a href="/cm-01-02-windows-11/" hreflang="en">Windows 11 / CD</a> · <a href="/cm-01-02-mac-ipad-chromebook/" hreflang="en">Mac/Chromebook</a></p>`;

const D: D[] = [
  {
    lang: 'da', hreflang: 'da', dir: 'da', slug: 'da/cm-01-02-mac-iphone-android/',
    title: 'CM 01/02 på Mac, iPhone, Android og Windows 11 – uden cd | CM Reborn',
    h1: 'Spil CM 01/02 på Mac, iPhone, Android og Windows 11 – uden cd',
    desc: 'Championship Manager 01/02 beder om cd\'en, virker ikke på Mac eller mobilen? Sådan spiller du CM 01/02 gratis i browseren – på Mac, iPhone, iPad, Android og Windows 11, uden cd og uden installation.',
    lead: 'CM 01/02 er et Windows-program fra 2001: det forlanger en cd i drevet, det findes ikke til Mac, iPhone eller Android, og på Windows 11 driller det med opløsning og kompatibilitet. Den nemmeste vej udenom er browseren.',
    sections: [
      ['"Indsæt cd\'en" og Windows 11', '<p>Originalen tjekker efter sin cd, når den starter. Den gratis download fra fællesskabet (champman0102.net) kommer med en no-cd-udgave og 3.9.68-rettelsen – brug den i stedet for en gammel disk. Starter spillet ikke på Windows 10/11, så kør det i kompatibilitetstilstand for Windows XP og som administrator, og gem dine spil uden for "Programmer".</p>'],
      ['Mac, iPhone og iPad', '<p>CM 01/02 er aldrig udkommet til Mac eller iOS, og Apple tillader ikke de Windows-emulatorer, originalen kræver. <a href="/">CM Reborn</a> kører i Safari: åbn siden, tryk på del-knappen og <b>Føj til hjemmeskærm</b> – så åbner det som en app, og dine gemte spil ligger på enheden.</p>'],
      ['Android', '<p>Der findes ingen APK til CM 01/02, og emulatorer som Winlator er besværlige og æder batteri. Åbn i stedet CM Reborn i Chrome, vælg <b>Installér</b>, og spil med den originale 2001/02-database – skærmene er lavet til touch.</p>'],
      ['Sådan kommer du i gang', '<ol><li>Åbn <a href="/">cm0102reborn.com</a> i browseren.</li><li>Vælg <b>Nyt spil</b>, den originale CM 01/02-database (3.9.60, 3.9.65 eller 3.9.68) eller 2026/27-databasen – og en klub.</li><li>Installér siden som app, hvis du vil spille offline.</li></ol><p>Det er gratis, uden reklamer, og der skal hverken cd, patch eller emulator til.</p>'],
    ],
    faq: [
      ['Kan jeg spille CM 01/02 på Mac?', 'Ikke originalen – den er til Windows. CM Reborn, et gratis remake med den originale 2001/02-database, kører i Safari, Chrome og Firefox på Mac.'],
      ['Hvorfor beder CM 01/02 om cd\'en?', 'Programmet fra 2001 tjekker efter sin cd ved start. Fællesskabets download har en no-cd-udgave – eller spil CM Reborn i browseren, som slet ikke bruger en cd.'],
      ['Virker det på iPhone og Android?', 'Ja. CM Reborn kører i Safari og Chrome på telefonen, kan lægges på hjemmeskærmen og virker offline.'],
    ],
    cta: '▶ Spil gratis i browseren', ctaNote: 'Ingen download · ingen reklamer', en: 'Engelske guider', shotAlt: 'CM Reborn på mobilen – det klassiske CM 01/02-udseende',
    footer: 'CM Reborn er et uafhængigt, gratis fanprojekt inspireret af Championship Manager 01/02 og har ingen forbindelse til Sports Interactive, SEGA eller Eidos.',
  },
  {
    lang: 'sv', hreflang: 'sv', dir: 'sv', slug: 'sv/cm-01-02-mac-iphone-android/',
    title: 'CM 01/02 på Mac, iPhone, Android och Windows 11 – utan cd | CM Reborn',
    h1: 'Spela CM 01/02 på Mac, iPhone, Android och Windows 11 – utan cd',
    desc: 'Championship Manager 01/02 kräver cd-skivan eller fungerar inte på Mac och mobilen? Så spelar du CM 01/02 gratis i webbläsaren – på Mac, iPhone, iPad, Android och Windows 11, utan cd och utan installation.',
    lead: 'CM 01/02 är ett Windows-program från 2001: det kräver en cd i enheten, finns inte till Mac, iPhone eller Android, och på Windows 11 krånglar det med upplösning och kompatibilitet. Enklaste vägen runt är webbläsaren.',
    sections: [
      ['"Sätt i cd-skivan" och Windows 11', '<p>Originalet letar efter sin cd vid start. Den fria nedladdningen från communityn (champman0102.net) innehåller en no-cd-version och patch 3.9.68 – använd den i stället för en gammal skiva. Startar spelet inte på Windows 10/11: kör i kompatibilitetsläge för Windows XP och som administratör, och spara spelen utanför "Program".</p>'],
      ['Mac, iPhone och iPad', '<p>CM 01/02 har aldrig släppts till Mac eller iOS, och Apple tillåter inte Windows-emulatorerna som originalet kräver. <a href="/">CM Reborn</a> körs i Safari: öppna sidan, tryck på dela-knappen och <b>Lägg till på hemskärmen</b> – då öppnas det som en app och dina sparade spel ligger på enheten.</p>'],
      ['Android', '<p>Det finns ingen APK för CM 01/02, och emulatorer som Winlator är krångliga och drar batteri. Öppna i stället CM Reborn i Chrome, välj <b>Installera</b> och spela med den ursprungliga 2001/02-databasen – skärmarna är gjorda för touch.</p>'],
      ['Så kommer du igång', '<ol><li>Öppna <a href="/">cm0102reborn.com</a> i webbläsaren.</li><li>Välj <b>Nytt spel</b>, den ursprungliga CM 01/02-databasen (3.9.60, 3.9.65 eller 3.9.68) eller 2026/27-databasen – och en klubb.</li><li>Installera sidan som app om du vill spela offline.</li></ol><p>Gratis, utan annonser, och varken cd, patch eller emulator behövs.</p>'],
    ],
    faq: [
      ['Kan jag spela CM 01/02 på Mac?', 'Inte originalet – det är ett Windows-spel. CM Reborn, en gratis remake med originaldatabasen från 2001/02, körs i Safari, Chrome och Firefox på Mac.'],
      ['Varför kräver CM 01/02 cd-skivan?', 'Programmet från 2001 letar efter sin cd vid start. Communityns nedladdning har en no-cd-version – eller spela CM Reborn i webbläsaren, som inte använder någon cd alls.'],
      ['Fungerar det på iPhone och Android?', 'Ja. CM Reborn körs i Safari och Chrome på mobilen, kan läggas på hemskärmen och fungerar offline.'],
    ],
    cta: '▶ Spela gratis i webbläsaren', ctaNote: 'Ingen nedladdning · inga annonser', en: 'Engelska guider', shotAlt: 'CM Reborn på mobilen – det klassiska CM 01/02-utseendet',
    footer: 'CM Reborn är ett oberoende, gratis fanprojekt inspirerat av Championship Manager 01/02 och har ingen koppling till Sports Interactive, SEGA eller Eidos.',
  },
  {
    lang: 'nb', hreflang: 'nb', dir: 'nb', slug: 'no/cm-01-02-mac-iphone-android/',
    title: 'CM 01/02 på Mac, iPhone, Android og Windows 11 – uten CD | CM Reborn',
    h1: 'Spill CM 01/02 på Mac, iPhone, Android og Windows 11 – uten CD',
    desc: 'Championship Manager 01/02 ber om CD-en eller virker ikke på Mac og mobilen? Slik spiller du CM 01/02 gratis i nettleseren – på Mac, iPhone, iPad, Android og Windows 11, uten CD og uten installasjon.',
    lead: 'CM 01/02 er et Windows-program fra 2001: det krever en CD i stasjonen, finnes ikke til Mac, iPhone eller Android, og på Windows 11 lager det trøbbel med oppløsning og kompatibilitet. Den enkleste veien utenom er nettleseren.',
    sections: [
      ['"Sett inn CD-en" og Windows 11', '<p>Originalen ser etter CD-en sin ved oppstart. Den gratis nedlastingen fra fellesskapet (champman0102.net) kommer med en no-CD-utgave og 3.9.68-oppdateringen – bruk den i stedet for en gammel plate. Starter ikke spillet på Windows 10/11: kjør det i kompatibilitetsmodus for Windows XP og som administrator, og lagre spillene utenfor "Programfiler".</p>'],
      ['Mac, iPhone og iPad', '<p>CM 01/02 har aldri kommet til Mac eller iOS, og Apple tillater ikke Windows-emulatorene originalen trenger. <a href="/">CM Reborn</a> kjører i Safari: åpne siden, trykk på del-knappen og <b>Legg til på Hjem-skjerm</b> – da åpner det som en app, og de lagrede spillene ligger på enheten.</p>'],
      ['Android', '<p>Det finnes ingen APK for CM 01/02, og emulatorer som Winlator er tungvinte og tapper batteriet. Åpne heller CM Reborn i Chrome, velg <b>Installer</b> og spill med den originale 2001/02-databasen – skjermene er laget for touch.</p>'],
      ['Slik kommer du i gang', '<ol><li>Åpne <a href="/">cm0102reborn.com</a> i nettleseren.</li><li>Velg <b>Nytt spill</b>, den originale CM 01/02-databasen (3.9.60, 3.9.65 eller 3.9.68) eller 2026/27-databasen – og en klubb.</li><li>Installer siden som app hvis du vil spille offline.</li></ol><p>Gratis, uten reklame, og verken CD, patch eller emulator trengs.</p>'],
    ],
    faq: [
      ['Kan jeg spille CM 01/02 på Mac?', 'Ikke originalen – det er et Windows-spill. CM Reborn, en gratis remake med originaldatabasen fra 2001/02, kjører i Safari, Chrome og Firefox på Mac.'],
      ['Hvorfor ber CM 01/02 om CD-en?', 'Programmet fra 2001 ser etter CD-en sin ved oppstart. Fellesskapets nedlasting har en no-CD-utgave – eller spill CM Reborn i nettleseren, som ikke bruker CD i det hele tatt.'],
      ['Virker det på iPhone og Android?', 'Ja. CM Reborn kjører i Safari og Chrome på mobilen, kan legges på Hjem-skjermen og virker offline.'],
    ],
    cta: '▶ Spill gratis i nettleseren', ctaNote: 'Ingen nedlasting · ingen reklame', en: 'Engelske guider', shotAlt: 'CM Reborn på mobilen – det klassiske CM 01/02-utseendet',
    footer: 'CM Reborn er et uavhengig, gratis fanprosjekt inspirert av Championship Manager 01/02 og har ingen tilknytning til Sports Interactive, SEGA eller Eidos.',
  },
  {
    lang: 'de', hreflang: 'de', dir: 'de', slug: 'de/cm-01-02-windows-11-android-iphone/',
    title: 'CM 01/02 unter Windows 11, auf Android, iPhone und Mac – ohne CD | CM Reborn',
    h1: 'CM 01/02 unter Windows 11, auf Android, iPhone und Mac spielen – ohne CD',
    desc: 'Championship Manager 01/02 verlangt die CD, startet unter Windows 11 nicht oder läuft nicht auf Android, iPhone und Mac? So spielst du CM 01/02 kostenlos im Browser – ohne CD, ohne Installation, auf jedem Gerät.',
    lead: 'CM 01/02 ist ein Windows-Programm von 2001: Es verlangt eine CD im Laufwerk, es gibt es nicht für Mac, iPhone oder Android, und unter Windows 11 zickt es mit Auflösung und Kompatibilität. Der einfachste Weg daran vorbei ist der Browser.',
    sections: [
      ['„Bitte CD einlegen“ und Windows 11', '<p>Das Original prüft beim Start, ob seine CD im Laufwerk liegt. Der kostenlose Download der Community (champman0102.net) enthält eine No-CD-Version und den Patch 3.9.68 – nimm den statt einer alten Disc. Startet das Spiel unter Windows 10/11 nicht: im Kompatibilitätsmodus für Windows XP und als Administrator ausführen und die Spielstände außerhalb von „Programme“ speichern.</p>'],
      ['Mac, iPhone und iPad', '<p>CM 01/02 ist nie für Mac oder iOS erschienen, und Apple lässt die Windows-Emulatoren nicht zu, die das Original bräuchte. <a href="/">CM Reborn</a> läuft in Safari: Seite öffnen, Teilen-Knopf, <b>Zum Home-Bildschirm</b> – dann öffnet es sich wie eine App, und die Spielstände bleiben auf dem Gerät.</p>'],
      ['Android', '<p>Eine APK für CM 01/02 gibt es nicht, und Emulatoren wie Winlator sind umständlich und saugen den Akku leer. Öffne stattdessen CM Reborn in Chrome, tippe auf <b>Installieren</b> und spiele mit der Original-Datenbank von 2001/02 – die Bildschirme sind für Touch gemacht.</p>'],
      ['So geht es los', '<ol><li>Öffne <a href="/">cm0102reborn.com</a> im Browser.</li><li>Wähle <b>Neues Spiel</b>, die Original-Datenbank von CM 01/02 (3.9.60, 3.9.65 oder 3.9.68) oder die Datenbank 2026/27 – und einen Verein.</li><li>Installiere die Seite als App, wenn du offline spielen willst.</li></ol><p>Kostenlos, ohne Werbung, und weder CD noch Patch oder Emulator nötig.</p>'],
    ],
    faq: [
      ['Läuft CM 01/02 unter Windows 11?', 'Meist ja – mit dem Community-Download, Kompatibilitätsmodus und der No-CD-Version. CM Reborn umgeht die Probleme, weil es im Browser läuft.'],
      ['Warum verlangt CM 01/02 die CD?', 'Das Programm von 2001 prüft beim Start seine CD. Der Community-Download hat eine No-CD-Version – oder spiele CM Reborn im Browser, das gar keine CD braucht.'],
      ['Kann ich CM 01/02 auf Android oder dem iPhone spielen?', 'Das Original nicht. CM Reborn, ein kostenloses Remake mit der Original-Datenbank 2001/02, läuft in Chrome und Safari auf dem Handy und lässt sich auf dem Home-Bildschirm ablegen.'],
    ],
    cta: '▶ Kostenlos im Browser spielen', ctaNote: 'Kein Download · keine Werbung', en: 'Englische Ratgeber', shotAlt: 'CM Reborn auf dem Handy – der klassische CM 01/02-Look',
    footer: 'CM Reborn ist ein unabhängiges, kostenloses Fanprojekt nach dem Vorbild von Championship Manager 01/02 und steht in keiner Verbindung zu Sports Interactive, SEGA oder Eidos.',
  },
  {
    lang: 'es', hreflang: 'es', dir: 'es', slug: 'es/cm-01-02-android-iphone-windows-11/',
    title: 'Jugar CM 01/02 en Android, iPhone, Mac y Windows 11 – sin CD | CM Reborn',
    h1: 'Jugar a CM 01/02 en Android, iPhone, Mac y Windows 11 – sin CD',
    desc: '¿Championship Manager 01/02 pide el CD, no arranca en Windows 11 o no existe para Android, iPhone y Mac? Así se juega a CM 01/02 gratis en el navegador: sin CD, sin instalar nada, en cualquier dispositivo.',
    lead: 'CM 01/02 es un programa de Windows de 2001: exige un CD en la unidad, no existe para Mac, iPhone ni Android, y en Windows 11 da problemas de resolución y compatibilidad. El camino más corto es el navegador.',
    sections: [
      ['"Inserte el CD" y Windows 11', '<p>El original busca su CD al arrancar. La descarga gratuita de la comunidad (champman0102.net) incluye una versión sin CD y el parche 3.9.68: úsala en lugar de un disco antiguo. Si el juego no arranca en Windows 10/11, ejecútalo en modo de compatibilidad con Windows XP y como administrador, y guarda las partidas fuera de "Archivos de programa".</p>'],
      ['Mac, iPhone y iPad', '<p>CM 01/02 nunca salió para Mac ni iOS, y Apple no permite los emuladores de Windows que necesita el original. <a href="/">CM Reborn</a> funciona en Safari: abre la página, pulsa el botón de compartir y <b>Añadir a pantalla de inicio</b>; se abre como una app y las partidas se guardan en el dispositivo.</p>'],
      ['Android', '<p>No hay APK de CM 01/02, y emuladores como Winlator son engorrosos y gastan batería. Abre CM Reborn en Chrome, pulsa <b>Instalar</b> y juega con la base de datos original de 2001/02: las pantallas están hechas para la pantalla táctil.</p>'],
      ['Cómo empezar', '<ol><li>Abre <a href="/">cm0102reborn.com</a> en el navegador.</li><li>Elige <b>Partida nueva</b>, la base de datos original de CM 01/02 (3.9.60, 3.9.65 o 3.9.68) o la de 2026/27, y un club.</li><li>Instala la página como app si quieres jugar sin conexión.</li></ol><p>Gratis, sin anuncios, y sin CD, parche ni emulador.</p>'],
    ],
    faq: [
      ['¿Se puede jugar a CM 01/02 en Android?', 'El original no, es un juego de Windows. CM Reborn, un remake gratuito con la base de datos original de 2001/02, funciona en Chrome en cualquier móvil o tablet Android, sin APK.'],
      ['¿Por qué CM 01/02 pide el CD?', 'El programa de 2001 comprueba su CD al arrancar. La descarga de la comunidad incluye una versión sin CD, o juega a CM Reborn en el navegador, que no usa CD.'],
      ['¿Funciona en iPhone y Mac?', 'Sí. CM Reborn funciona en Safari en iPhone, iPad y Mac, se puede añadir a la pantalla de inicio y funciona sin conexión.'],
    ],
    cta: '▶ Juega gratis en el navegador', ctaNote: 'Sin descargas · sin anuncios', en: 'Guías en inglés', shotAlt: 'CM Reborn en el móvil – el aspecto clásico de CM 01/02',
    footer: 'CM Reborn es un proyecto de fans independiente y gratuito inspirado en Championship Manager 01/02, sin relación con Sports Interactive, SEGA ni Eidos.',
  },
  {
    lang: 'fr', hreflang: 'fr', dir: 'fr', slug: 'fr/cm-01-02-android-iphone-windows-11/',
    title: 'Jouer à CM 01/02 sur Android, iPhone, Mac et Windows 11 – sans CD | CM Reborn',
    h1: 'Jouer à CM 01/02 sur Android, iPhone, Mac et Windows 11 – sans CD',
    desc: 'Championship Manager 01/02 réclame le CD, ne démarre pas sous Windows 11 ou n\'existe pas sur Android, iPhone et Mac ? Voici comment jouer à CM 01/02 gratuitement dans le navigateur : sans CD, sans installation, sur n\'importe quel appareil.',
    lead: 'CM 01/02 est un programme Windows de 2001 : il exige un CD dans le lecteur, il n\'existe pas sur Mac, iPhone ou Android, et sous Windows 11 il pose des problèmes de résolution et de compatibilité. Le plus simple est de passer par le navigateur.',
    sections: [
      ['« Insérez le CD » et Windows 11', '<p>L\'original cherche son CD au démarrage. Le téléchargement gratuit de la communauté (champman0102.net) contient une version sans CD et le patch 3.9.68 : utilisez-le plutôt qu\'un vieux disque. Si le jeu ne démarre pas sous Windows 10/11, lancez-le en mode de compatibilité Windows XP et en administrateur, et enregistrez vos parties hors de « Program Files ».</p>'],
      ['Mac, iPhone et iPad', '<p>CM 01/02 n\'est jamais sorti sur Mac ni iOS, et Apple n\'autorise pas les émulateurs Windows dont l\'original a besoin. <a href="/">CM Reborn</a> tourne dans Safari : ouvrez la page, appuyez sur le bouton de partage puis <b>Sur l\'écran d\'accueil</b> ; il s\'ouvre comme une application et vos sauvegardes restent sur l\'appareil.</p>'],
      ['Android', '<p>Il n\'existe pas d\'APK de CM 01/02, et les émulateurs comme Winlator sont pénibles et vident la batterie. Ouvrez plutôt CM Reborn dans Chrome, appuyez sur <b>Installer</b> et jouez avec la base de données originale de 2001/02 : les écrans sont conçus pour le tactile.</p>'],
      ['Pour commencer', '<ol><li>Ouvrez <a href="/">cm0102reborn.com</a> dans le navigateur.</li><li>Choisissez <b>Nouvelle partie</b>, la base de données originale de CM 01/02 (3.9.60, 3.9.65 ou 3.9.68) ou celle de 2026/27, et un club.</li><li>Installez la page comme application pour jouer hors ligne.</li></ol><p>Gratuit, sans publicité, et sans CD, patch ni émulateur.</p>'],
    ],
    faq: [
      ['Peut-on jouer à CM 01/02 sur Android ?', 'Pas l\'original, c\'est un jeu Windows. CM Reborn, un remake gratuit avec la base de données originale de 2001/02, tourne dans Chrome sur n\'importe quel téléphone ou tablette Android, sans APK.'],
      ['Pourquoi CM 01/02 réclame-t-il le CD ?', 'Le programme de 2001 vérifie son CD au démarrage. Le téléchargement de la communauté contient une version sans CD, ou jouez à CM Reborn dans le navigateur, qui n\'utilise aucun CD.'],
      ['Ça marche sur iPhone et Mac ?', 'Oui. CM Reborn tourne dans Safari sur iPhone, iPad et Mac, s\'ajoute à l\'écran d\'accueil et fonctionne hors ligne.'],
    ],
    cta: '▶ Jouer gratuitement dans le navigateur', ctaNote: 'Sans téléchargement · sans publicité', en: 'Guides en anglais', shotAlt: 'CM Reborn sur mobile – le look classique de CM 01/02',
    footer: 'CM Reborn est un projet de fans indépendant et gratuit inspiré de Championship Manager 01/02, sans lien avec Sports Interactive, SEGA ou Eidos.',
  },
  {
    lang: 'it', hreflang: 'it', dir: 'it', slug: 'it/cm-01-02-android-iphone-windows-11/',
    title: 'CM 01/02 su Android, iPhone, Mac e Windows 11 – senza CD | CM Reborn',
    h1: 'Giocare a CM 01/02 su Android, iPhone, Mac e Windows 11 – senza CD',
    desc: 'Championship Manager 01/02 chiede il CD, non parte su Windows 11 o non esiste per Android, iPhone e Mac? Ecco come giocare a CM 01/02 gratis nel browser: senza CD, senza installazione, su qualsiasi dispositivo.',
    lead: 'CM 01/02 è un programma Windows del 2001: vuole un CD nel lettore, non esiste per Mac, iPhone o Android, e su Windows 11 dà problemi di risoluzione e compatibilità. La via più semplice è il browser.',
    sections: [
      ['"Inserire il CD" e Windows 11', '<p>L\'originale cerca il suo CD all\'avvio. Il download gratuito della community (champman0102.net) include una versione no-CD e la patch 3.9.68: usa quello invece di un vecchio disco. Se il gioco non parte su Windows 10/11, avvialo in modalità compatibilità per Windows XP e come amministratore, e salva le partite fuori da "Programmi".</p>'],
      ['Mac, iPhone e iPad', '<p>CM 01/02 non è mai uscito per Mac né iOS, e Apple non permette gli emulatori Windows di cui l\'originale ha bisogno. <a href="/">CM Reborn</a> gira in Safari: apri la pagina, premi il tasto condividi e <b>Aggiungi alla schermata Home</b>; si apre come un\'app e i salvataggi restano sul dispositivo.</p>'],
      ['Android', '<p>Non esiste un APK di CM 01/02, e gli emulatori come Winlator sono scomodi e consumano batteria. Apri invece CM Reborn in Chrome, tocca <b>Installa</b> e gioca con il database originale del 2001/02: le schermate sono fatte per il touch.</p>'],
      ['Come iniziare', '<ol><li>Apri <a href="/">cm0102reborn.com</a> nel browser.</li><li>Scegli <b>Nuova partita</b>, il database originale di CM 01/02 (3.9.60, 3.9.65 o 3.9.68) o quello 2026/27, e una squadra.</li><li>Installa la pagina come app se vuoi giocare offline.</li></ol><p>Gratis, senza pubblicità, e senza CD, patch o emulatore.</p>'],
    ],
    faq: [
      ['Si può giocare a CM 01/02 su Android?', 'Non l\'originale, è un gioco per Windows. CM Reborn, un remake gratuito con il database originale del 2001/02, gira in Chrome su qualsiasi telefono o tablet Android, senza APK.'],
      ['Perché CM 01/02 chiede il CD?', 'Il programma del 2001 controlla il suo CD all\'avvio. Il download della community include una versione no-CD, oppure gioca a CM Reborn nel browser, che non usa nessun CD.'],
      ['Funziona su iPhone e Mac?', 'Sì. CM Reborn gira in Safari su iPhone, iPad e Mac, si aggiunge alla schermata Home e funziona offline.'],
    ],
    cta: '▶ Gioca gratis nel browser', ctaNote: 'Nessun download · nessuna pubblicità', en: 'Guide in inglese', shotAlt: 'CM Reborn sul telefono – il look classico di CM 01/02',
    footer: 'CM Reborn è un progetto di fan indipendente e gratuito ispirato a Championship Manager 01/02, senza legami con Sports Interactive, SEGA o Eidos.',
  },
  {
    lang: 'pt-BR', hreflang: 'pt', dir: 'pt', slug: 'pt/cm-01-02-android-iphone-sem-cd/',
    title: 'Como jogar CM 01/02 no Android, iPhone, Mac e Windows 11 – sem CD | CM Reborn',
    h1: 'Como jogar CM 01/02 no Android, iPhone, Mac e Windows 11 – sem CD',
    desc: 'Championship Manager 01/02 pede o CD, não abre no Windows 11 ou não existe para Android, iPhone e Mac? Veja como jogar CM 01/02 de graça no navegador: sem CD, sem instalar nada, em qualquer aparelho.',
    lead: 'CM 01/02 é um programa de Windows de 2001: exige um CD no drive, não existe para Mac, iPhone nem Android, e no Windows 11 dá problema de resolução e compatibilidade. O caminho mais curto é o navegador.',
    sections: [
      ['"Insira o CD" e Windows 11', '<p>O original procura o CD ao abrir. O download gratuito da comunidade (champman0102.net) vem com uma versão sem CD e o patch 3.9.68: use ele no lugar de um disco antigo. Se o jogo não abrir no Windows 10/11, execute em modo de compatibilidade com o Windows XP e como administrador, e salve os jogos fora de "Arquivos de Programas".</p>'],
      ['Mac, iPhone e iPad', '<p>CM 01/02 nunca saiu para Mac nem iOS, e a Apple não permite os emuladores de Windows que o original precisa. O <a href="/">CM Reborn</a> roda no Safari: abra a página, toque em compartilhar e <b>Adicionar à Tela de Início</b>; ele abre como um app e os jogos salvos ficam no aparelho.</p>'],
      ['Android', '<p>Não existe APK do CM 01/02, e emuladores como o Winlator são complicados e acabam com a bateria. Abra o CM Reborn no Chrome, toque em <b>Instalar</b> e jogue com o banco de dados original de 2001/02: as telas foram feitas para o toque.</p>'],
      ['Como começar', '<ol><li>Abra <a href="/">cm0102reborn.com</a> no navegador.</li><li>Escolha <b>Novo jogo</b>, o banco de dados original do CM 01/02 (3.9.60, 3.9.65 ou 3.9.68) ou o de 2026/27, e um clube.</li><li>Instale a página como app se quiser jogar offline.</li></ol><p>De graça, sem anúncios, e sem CD, patch nem emulador.</p>'],
    ],
    faq: [
      ['Dá para jogar CM 01/02 no Android?', 'O original não, é um jogo de Windows. O CM Reborn, um remake gratuito com o banco de dados original de 2001/02, roda no Chrome em qualquer celular ou tablet Android, sem APK.'],
      ['Por que o CM 01/02 pede o CD?', 'O programa de 2001 confere o CD ao abrir. O download da comunidade tem uma versão sem CD, ou jogue o CM Reborn no navegador, que não usa CD nenhum.'],
      ['Funciona no iPhone e no Mac?', 'Sim. O CM Reborn roda no Safari no iPhone, iPad e Mac, pode ser adicionado à tela de início e funciona offline.'],
    ],
    cta: '▶ Jogue grátis no navegador', ctaNote: 'Sem download · sem anúncios', en: 'Guias em inglês', shotAlt: 'CM Reborn no celular – o visual clássico do CM 01/02',
    footer: 'CM Reborn é um projeto de fãs independente e gratuito inspirado em Championship Manager 01/02, sem ligação com Sports Interactive, SEGA ou Eidos.',
  },
  {
    lang: 'tr', hreflang: 'tr', dir: 'tr', slug: 'tr/cm-01-02-cd-istiyor-android-iphone/',
    title: 'CM 01/02 CD istiyor? Android, iPhone ve Windows 11\'de CD\'siz oyna | CM Reborn',
    h1: 'CM 01/02 CD istiyor? Windows 11, Android, iPhone ve Mac\'te CD\'siz nasıl oynanır',
    desc: 'Championship Manager 01/02 CD istiyor, Windows 11\'de açılmıyor ya da Android, iPhone ve Mac\'te yok mu? CM 01/02\'yi tarayıcıda ücretsiz oynamanın yolu: CD\'siz, kurulumsuz, her cihazda.',
    lead: 'CM 01/02, 2001\'den kalma bir Windows programı: sürücüde CD ister, Mac, iPhone ve Android için yoktur, Windows 11\'de ise çözünürlük ve uyumluluk sorunları çıkarır. En kısa yol tarayıcı.',
    sections: [
      ['"CD\'yi takın" ve Windows 11', '<p>Orijinal oyun açılışta CD\'sini arar. Topluluğun ücretsiz indirmesi (champman0102.net) CD\'siz sürüm ve 3.9.68 yamasıyla gelir; eski bir disk yerine onu kullanın. Oyun Windows 10/11\'de açılmıyorsa Windows XP uyumluluk modunda ve yönetici olarak çalıştırın, kayıtları "Program Files" dışına alın.</p>'],
      ['Mac, iPhone ve iPad', '<p>CM 01/02 hiçbir zaman Mac veya iOS\'a çıkmadı; Apple, orijinalin ihtiyaç duyduğu Windows emülatörlerine de izin vermiyor. <a href="/">CM Reborn</a> Safari\'de çalışır: sayfayı açın, paylaş düğmesine basıp <b>Ana Ekrana Ekle</b> deyin; uygulama gibi açılır ve kayıtlarınız cihazda kalır.</p>'],
      ['Android', '<p>CM 01/02\'nin APK\'sı yok; Winlator gibi emülatörler zahmetli ve pil yiyor. Bunun yerine CM Reborn\'u Chrome\'da açın, <b>Yükle</b> deyin ve orijinal 2001/02 veritabanıyla oynayın; ekranlar dokunmatik için yapıldı.</p>'],
      ['Nasıl başlanır', '<ol><li>Tarayıcıda <a href="/">cm0102reborn.com</a> adresini açın.</li><li><b>Yeni oyun</b>\'u, orijinal CM 01/02 veritabanını (3.9.60, 3.9.65 veya 3.9.68) ya da 2026/27 veritabanını ve bir kulüp seçin.</li><li>Çevrimdışı oynamak için sayfayı uygulama olarak yükleyin.</li></ol><p>Ücretsiz, reklamsız; CD, yama ya da emülatör gerekmez.</p>'],
    ],
    faq: [
      ['CM 01/02 neden CD istiyor?', '2001 tarihli program açılışta CD\'sini kontrol eder. Topluluk indirmesinde CD\'siz sürüm var; ya da hiç CD kullanmayan CM Reborn\'u tarayıcıda oynayın.'],
      ['CM 01/02 Android\'de oynanır mı?', 'Orijinali değil, Windows oyunu. Orijinal 2001/02 veritabanına sahip ücretsiz bir yeniden yapım olan CM Reborn, her Android telefon ve tablette Chrome\'da APK\'sız çalışır.'],
      ['iPhone ve Mac\'te çalışır mı?', 'Evet. CM Reborn iPhone, iPad ve Mac\'te Safari\'de çalışır, ana ekrana eklenir ve çevrimdışı da oynanır.'],
    ],
    cta: '▶ Tarayıcıda ücretsiz oyna', ctaNote: 'İndirme yok · reklam yok', en: 'İngilizce rehberler', shotAlt: 'Telefonda CM Reborn – klasik CM 01/02 görünümü',
    footer: 'CM Reborn, Championship Manager 01/02\'den esinlenen bağımsız ve ücretsiz bir hayran projesidir; Sports Interactive, SEGA veya Eidos ile bağlantısı yoktur.',
  },
];

/** siderne + hreflang-listen (den engelske er /cm-01-02-windows-11/) */
export function langDevices(nav: Record<string, [string, string]>): { pages: Page[]; alt: [string, string][] } {
  const alt: [string, string][] = [['en', EN], ['x-default', EN], ...D.map((d) => [d.hreflang, `/${d.slug}`] as [string, string])];
  const pages: Page[] = D.map((d) => {
    const cta = `<p class="cta"><a class="btn" href="/">${d.cta}</a> <span>${d.ctaNote}</span></p>`;
    const n = nav[d.lang];
    return {
      slug: d.slug, title: d.title, h1: d.h1, description: d.desc, lang: d.lang, alternates: alt, faq: d.faq, faqSchema: true, cta, footer: d.footer,
      image: `/landing/${d.dir}/mobile.webp`,
      nav: [...(n ? [[`/${n[0]}`, n[1]] as [string, string]] : []), ['/cm-01-02/', 'CM 01/02 database'], ['/cm-01-02/lists/wonderkids/', 'Wonderkids'], ['/play-cm-01-02-online/', 'English']],
      body: `<p class="lead">${esc(d.lead)}</p>${cta}${shotFig(d.dir, 'mobile', d.shotAlt, 585, 1266, 'phone')}${d.sections.map(([h, html]) => `<h2>${esc(h)}</h2>${html}`).join('')}${MORE(d.en)}`,
    };
  });
  return { pages, alt };
}
