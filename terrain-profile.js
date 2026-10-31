const smooth=(a,b,x)=>{let t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function terrainProfile(distance){const s=Math.max(0,distance),basin=smooth(300,460,s)*(1-smooth(650,810,s)),arches=smooth(700,860,s)*(1-smooth(1040,1180,s)),spires=smooth(1050,1210,s)*(1-smooth(1390,1530,s)),dunes=smooth(1410,1580,s);return {
 width:34+basin*33+arches*8+spires*25+dunes*48,
 height:58-basin*28+arches*16-spires*8-dunes*35,
 shelf:1.2+arches*.8-basin*.7,
 center:Math.sin(s*.0035)*4+Math.sin(s*.008)*2,
 warm:.88+basin*.12-spires*.11,
 region:s<360?'RED ROCK NARROWS':s<740?'DUNE SEA BASIN':s<1110?'STONE ARCH PASS':s<1460?'THE NEEDLES':'KHETANNA BADLANDS'
};}
export function finaleStage(t){if(t<1.8)return 'chain-reaction';if(t<5)return 'boss-explosion';if(t<10.2)return 'ascent';if(t<12.2)return 'space';if(t<13.6)return 'starlines';if(t<18.8)return 'hyperspace';return 'complete'}
