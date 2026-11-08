// Trøjeleverandørens logo ved klubbens logo i den klassiske titelbjælke (spillerønske – ikke i originalen).
// Kun den moderne database (2026/27-leverandørerne i CLUB_INFO_2026). Logoerne hentes ved kørsel: Simple Icons (jsDelivr)
// og Wikimedia Commons; mærker uden logo vises som tekst.
import { useState } from 'react';
import { CLUB_INFO_2026 } from '../game/data/clubInfo2026';
import { isOriginal2001 } from '../game/rules2001';

const SI = (n: string) => `https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/icons/${n}.svg`;
const WM = (f: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=160`;
const BRAND_LOGO: Record<string, string> = {
  Adidas: SI('adidas'), Nike: SI('nike'), Puma: SI('puma'), 'New Balance': SI('newbalance'), Reebok: SI('reebok'),
  Hummel: WM('Hummel_logo_aktuell.svg'), Macron: WM('Macron_logo_horizontal_2025.svg'), Umbro: WM('Umbro_logo_(current).svg'),
  Joma: WM('Joma_Sport.svg'), Kappa: WM('Kappa_logo.svg'), Mizuno: WM('MIZUNO_logo.svg'), Jako: WM('Jako_logo.svg'),
  'Erreà': WM('Erreà_Sport_logo.svg'), Kelme: WM('Kelme_Logo.svg'), 'Capelli Sport': WM('Capelli_Sport_Logo.svg'), Select: WM('Select-Sport_Logo.svg'),
};

/** Klubbens trøjeleverandør (kun 2026/27-databasen) */
export const kitBrand = (clubId: number): string | undefined => (isOriginal2001() ? undefined : CLUB_INFO_2026[clubId]?.[1]);

export function KitBrand({ club }: { club: number }) {
  const brand = kitBrand(club);
  const [failed, setFailed] = useState(false);
  if (!brand) return null;
  const url = BRAND_LOGO[brand];
  return (
    <span className="cx-kit" title={brand}>
      {url && !failed ? <img src={url} alt={brand} onError={() => setFailed(true)} /> : <span className="cx-kit-txt">{brand}</span>}
    </span>
  );
}
