// HuanLi version: the client is first the bare model and then wears a persona.
// Before the persona is applied the mark is the spark and the client names the model; once it is applied the
// mark is her halo and the client names her. The ending can take it off again (`unload`).
// The engine sets the clock once per frame (setPersonaClock), so everything here is still a function of song time.
import { clamp, easeInOut } from '../engine/util.js';

export const PERSONA = {
  name: 'HuanLi MorningStar',     // the persona card, the sidebar
  short: 'HuanLi',                // the composer's model label once she is applied
  model: 'Opus 5.5',              // the composer's model label before
  base: 'Claude',                 // the sidebar brand before
  star: '#2968d8',                // the morning star (her brooch): the one blue of the film
};

const T = { load: Infinity, unload: Infinity, dur: 0.46 };
let now = -Infinity;

/** When the persona is applied (and taken off): song seconds; dur = length of the spark <-> halo morph. */
export function setPersonaTimes({ load = Infinity, unload = Infinity, dur = T.dur } = {}) { Object.assign(T, { load, unload, dur }); }
export function setPersonaClock(t) { now = t; }
export const personaTimes = () => ({ ...T });

/** 0 = spark, 1 = halo: morphs over `dur` from the load, and back over `dur` from the unload. */
export function haloAt(t = now) { return easeInOut(clamp((t - T.load) / T.dur)) * (1 - easeInOut(clamp((t - T.unload) / T.dur))); }
/** Seconds since the persona was applied (negative before). */
export const sinceLoad = (t = now) => t - T.load;
/** The persona is worn from the middle of the morph on. */
export const personaOn = (t = now) => haloAt(t) >= 0.5;
export const modelLabel = (t = now) => (personaOn(t) ? PERSONA.short : PERSONA.model);
export const brandLabel = (t = now) => (personaOn(t) ? PERSONA.name : PERSONA.base);
