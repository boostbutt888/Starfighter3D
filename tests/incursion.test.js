import test from 'node:test';
import assert from 'node:assert/strict';
import {TUNNEL_SPEED,ESCAPE_SPEED,ESCAPE_DURATION,obstacleContact} from '../incursion-rules.js';
test('incursion entry is 50 percent faster and escape is also 50 percent faster than baseline',()=>{assert.equal(TUNNEL_SPEED,24*1.5);assert.equal(ESCAPE_SPEED,24*1.5);assert.ok(ESCAPE_DURATION*ESCAPE_SPEED>1000)});
test('a Falcon-sized ship clears a maintenance opening but collides with a side pipe or bridge',()=>{const half={x:7.4,y:2.3,z:8},p={x:0,y:8,z:8};assert.equal(obstacleContact(p,half,{x:22,y:8,z:8,w:6,h:32,d:2}),null);assert.equal(obstacleContact({...p,x:16},half,{x:22,y:8,z:8,w:6,h:32,d:2}).axis,'x');assert.equal(obstacleContact({...p,y:18},half,{x:0,y:19,z:8,w:46,h:3,d:4}).axis,'y');assert.equal(obstacleContact(p,half,{x:0,y:8,z:-30,w:46,h:3,d:4}),null)});
