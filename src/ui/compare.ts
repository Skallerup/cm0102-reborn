// Spillere valgt til sammenligning i assistenten (kun UI-tilstand)
import { notify } from '../game/state';

export const compareIds: number[] = [];

export function toggleCompare(id: number) {
  const i = compareIds.indexOf(id);
  if (i >= 0) compareIds.splice(i, 1);
  else {
    compareIds.push(id);
    if (compareIds.length > 3) compareIds.shift();
  }
  notify();
}

/** CM 01/02 "Compare Players": sæt spilleren som 1. eller 2. i sammenligningen */
export function setCompareSlot(slot: 0 | 1, id: number) {
  const other = compareIds[1 - slot];
  compareIds.length = 0;
  if (slot === 0) { compareIds.push(id); if (other !== undefined && other !== id) compareIds.push(other); }
  else { if (other !== undefined && other !== id) compareIds.push(other); compareIds.push(id); }
  notify();
}
