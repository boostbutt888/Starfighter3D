// Battlestar Galactica (1978), Stu Phillips / Glen A. Larson.
// A locally performed game arrangement; not the original soundtrack recording.
// Notes are MIDI pitch and length in quarter-note beats. null represents a rest.
const rest=(d)=>[null,d];
const opening=[ [55,4] ];
const answer1=[[65,2],[63,.5],[62,.5],[60,1]];
const answer2=[[63,2],[62,.5],[60,.5],[58,1]];
const answer3=[[62,1],[58,1],[60,2]];
const fanfare=[[65,1],[65,.5],[65,.5],[72,1],[72,.5],[72,.5]];
const highAnswer=[[77,1],[77,.5],[77,.5],[75,.5],[74,.5],[72,1]];
const run=[[77,.25],[79,.25],[81,.25],[82,.25]];
export const THEME_BARS=[
 [[77,1],rest(3)],opening,answer1,answer2,answer3,
 [[77,1],rest(3)],opening,answer1,answer2,answer3,
 fanfare,highAnswer,[[75,1],[74,1],[72,1],[70,1]],[[72,1],[69,1],[70,2]],
 fanfare,highAnswer,[[77,1],[77,1],[75,.5],[74,.5],[72,1]],[[74,1],[75,1],[70,1],[74,1]],
 [[72,2],rest(1),...run],[[84,3],[84,1]],[[82,1],[81,1],[79,1],[77,1]],
 [[82,3],[84,.5],[86,.5]],[[84,3],...run],[[84,3],[84,1]],
 [[82,1],[81,1],[79,1],[77,1]],[[87,3],[89,.5],[91,.5]],[[89,3],...run],
 [[84,3],[84,1]],[[82,1],[81,1],[79,1],[77,1]],[[82,4]],
 [[82,1],[84,.5],[86,.5],[84,2]],[[84,3],[84,1]],[[82,1],[81,1],[79,1],[77,1]],
 [[87,3],[89,.5],[91,.5]],[[89,4]],[[89,4]]
];
export const THEME_ROOTS=[46,46,46,46,46,41,41,41,41,41,46,46,46,46,41,41,41,41,41,46,46,44,41,46,46,44,48,46,46,44,44,46,46,44,41,41];
export function themeEvents(bar){let at=0;return THEME_BARS[bar%THEME_BARS.length].map(([note,duration])=>{let event={note,duration,at};at+=duration;return event})}
