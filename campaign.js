export const LEVEL_ORDER=['tatooine','trench','incursion'];
export const STARTING_LIVES=3;
export function tierMultiplier(difficulty){return {rookie:1,pilot:1.5,ace:2.25}[difficulty]??1.5}
// Fractional densities accumulate across encounters without biased rounding.
export function encounterCount(base,difficulty,serial=0){const n=base*tierMultiplier(difficulty);return Math.floor((serial+1)*n)-Math.floor(serial*n)}
export function nextMission(id){return LEVEL_ORDER[LEVEL_ORDER.indexOf(id)+1]??null}
export function damageLife(hull,lives,damage){const hp=Math.max(0,hull-damage);return {hull:hp,lives:hp===0?Math.max(0,lives-1):lives,destroyed:hp===0}}
export function shortcut(code){return {KeyU:'music',KeyI:'sound',KeyO:'mute',KeyP:'pause',Escape:'pause'}[code]??null}
