// CM 01/02 "Save Game – Enter File Name": filnavnet (forvalgt "<klub> <dato>"), de gemte spil nedenunder (klik = vælg navnet), Cancel · Info · Ok.
// Originalens linje "Directory :" er her lagringen: denne browser – og skyen, når man er logget ind. Ejerens undtagelse (13/11): er man ikke
// logget ind, tilbydes en profil, så spillet gemmes i skyen (flere enheder, sikkerhed mod tab af data).
import { useEffect, useState } from 'react';
import { gs } from '../game/state';
import { listSaves, namedSaveId, saveGame, type SaveMeta } from '../game/save';
import { t } from '../i18n';
import { askConfirm, askNotice } from './confirm';
import { titleColors, useClassicDialog } from './classic';
import { LoginModal, useAccount } from './Login';

export function SaveGameClassic({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  useClassicDialog();
  const g = gs();
  const acc = useAccount();
  const col = titleColors(g.userClub || undefined);
  const [name, setName] = useState(`${g.clubs[g.userClub]?.short ?? g.manager.name} ${g.date}`);
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [login, setLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void listSaves().then((l) => setSaves(l.filter((s) => s.id.startsWith(g.id)))); }, [g.id]);
  const ok = async () => {
    const n = name.trim();
    if (!n || busy) return;
    if (saves.some((s) => s.id === namedSaveId(g.id, n)) && !(await askConfirm(t('cl.sv.overwrite', { name: n }), { head: t('cl.mt.confirm') }))) return;
    setBusy(true);
    try { await saveGame({ cloud: true, name: n }); onSaved(); } catch { setBusy(false); }
  };
  const info = () => void askNotice(t(acc ? 'cl.sv.infoCloud' : 'cl.sv.infoLocal', { email: acc?.email ?? '' }), { head: t('cl.sv.title') });
  return (
    <div className="cx-dlg cx-savegame" role="dialog">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{t('cl.sv.title')}</h2></div>
      <div className="cx-subtitle">{t('cl.sv.enter')}</div>
      <div className="cx-dlg-body">
        <div className="cx-sv-dir"><span>{t('cl.sv.where')}</span>
          {acc ? <b>{t('cl.sv.cloud', { email: acc.email })}</b>
            : <><b>{t('cl.sv.local')}</b><button className="cx-greybtn" onClick={() => setLogin(true)}>{t('cl.sv.makeProfile')}</button></>}
        </div>
        {!acc && <p className="cx-sv-why">{t('cl.sv.why')}</p>}
        <label className="cx-sv-file"><span>{t('cl.sv.file')}</span>
          <input value={name} maxLength={40} autoFocus spellCheck={false} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void ok(); }} />
        </label>
        <div className="cx-sv-list">
          {saves.slice(0, 8).map((s) => <button key={s.id} onClick={() => setName(s.name ?? `${s.club} ${s.date}`)}>{s.name ?? `${s.club} ${s.date}`}</button>)}
        </div>
      </div>
      <div className="cx-ts-buttons cx-dlg-foot cx-sv-foot">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button onClick={info}>{t('cl.sv.info')}</button>
        <button className="primary" disabled={!name.trim() || busy} onClick={() => void ok()}>{t('common.ok')}</button>
      </div>
      {login && <LoginModal onClose={() => setLogin(false)} />}
    </div>
  );
}
