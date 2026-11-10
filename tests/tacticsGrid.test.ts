import { describe, expect, it } from 'vitest';
import { formationSlots, slotTaken, snapFreeSlot, snapSlot } from '../src/game/tactics';

describe('faste pladser på banen (CM 01/02)', () => {
  it('lander på nærmeste plads med rigtig position', () => {
    expect(snapSlot(48, 40)).toEqual({ pos: 'M', side: 'C', x: 50, y: 37 });
    expect(snapSlot(33, 5)).toEqual({ pos: 'WB', side: 'L', x: 35, y: 12 });
    expect(snapSlot(10, 52)).toEqual({ pos: 'SW', side: 'C', x: 12, y: 50 });
    expect(snapSlot(90, 95)).toEqual({ pos: 'ST', side: 'R', x: 82, y: 88 });
  });
  it('en optaget plads kan ikke bruges', () => {
    const slots = formationSlots('4-4-2');
    expect(slotTaken(slots, 9, snapSlot(50, 12))).toBe(true); // M L er optaget
    expect(slotTaken(slots, 9, snapSlot(66, 50))).toBe(false); // AM C er fri
  });
  it('en tredje midterforsvarer slippes på den ledige midterplads, selv om han slippes oven i de to andre', () => {
    const slots = formationSlots('4-4-2'); // midterforsvarerne på 38 og 62
    const rb = 4; // højre back
    expect(snapFreeSlot(slots, rb, 20, 55)).toEqual({ pos: 'D', side: 'C', x: 22, y: 50 }); // midten er ledig
    slots[3] = { pos: 'D', side: 'C', x: 22, y: 50 }; // 38 og 50 optaget (som på ejerens skærmbillede)
    expect(snapFreeSlot(slots, rb, 20, 52)).toEqual({ pos: 'D', side: 'C', x: 22, y: 63 }); // oven i midten → den ledige midterplads
    expect(snapFreeSlot(slots, rb, 20, 44)).toEqual({ pos: 'D', side: 'C', x: 22, y: 63 }); // mellem de to → samme, ikke kanten
    slots[1] = { pos: 'D', side: 'C', x: 22, y: 63 }; // alle tre midterpladser optaget
    expect(snapFreeSlot(slots, rb, 20, 52)).toEqual({ pos: 'D', side: 'R', x: 22, y: 88 }); // nærmeste ledige plads i rækken
  });
});
