// Landenes sprog fra databasen (nation.dat-postens byte +0x77, 3.9.60 – samme i 3.9.68): 8 = engelsk. Kampmotoren læser kun "== 8":
// gengældelsen sub_716630 (0x716787: spillerens land, staff+0x1a → +0x77: rand(1000) i stedet for rand(300) for kodeparret 0x61) og
// protesten sub_716e10 (0x7170bd: modstanderklubbens land, club+0x53 → +0x77: kommentaren 0x20f5).
export const LANG_ENGLISH = 8;
const ENGLISH = new Set([
  'American Samoa', 'Anguilla', 'Antigua & Barbuda', 'Australia', 'Bahamas', 'Barbados', 'Belize', 'Bermuda', 'Botswana', 'British Virgin Islands',
  'Canada', 'Cayman Islands', 'Cook Islands', 'Dominica', 'Dominican Republic', 'England', 'Eritrea', 'Fiji', 'The Gambia', 'Ghana', 'Grenada',
  'Guam', 'Guyana', 'Republic of Ireland', 'Jamaica', 'Lesotho', 'Liberia', 'Malawi', 'Maldives', 'Mauritius', 'Montserrat', 'Northern Ireland',
  'Namibia', 'Nepal', 'New Zealand', 'Nigeria', 'Pakistan', 'Papua New Guinea', 'The Philippines', 'Samoa', 'Scotland', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Solomon Islands', 'South Africa', 'St Kitts & Nevis', 'Saint Lucia', 'St Vincent & The Grenadines', 'Swaziland',
  'Tahiti', 'Tonga', 'Trinidad & Tobago', 'Turks and Caicos Islands', 'United States', 'US Virgin Islands', 'Uganda', 'Vanuatu', 'Wales',
  'Zambia', 'Zimbabwe',
]);
/** nation.dat +0x77 for landets navn: 8 (engelsk) eller 0 (alt andet – motoren skelner ikke mellem de øvrige sprog) */
export const nationLanguage = (name: string | undefined): number => (name && ENGLISH.has(name) ? LANG_ENGLISH : 0);
