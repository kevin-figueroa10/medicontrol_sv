import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from '../frontend/node_modules/typescript/lib/typescript.js';
const source=readFileSync(new URL('../frontend/src/lib/appointmentStatus.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {appointmentStatus}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const now=new Date('2026-10-28T06:01:00Z');
for(const estado of ['Confirmada','En espera']){
 assert.equal(appointmentStatus({estado,inicio:'2026-10-28T05:59:00Z'},now),'No atendida');
 assert.equal(appointmentStatus({estado,inicio:'2026-10-28T06:00:00Z'},now),estado);
 assert.equal(appointmentStatus({estado,inicio:'2026-10-29T06:00:00Z'},now),estado);
}
for(const estado of ['Finalizada','Cancelada','No asistió','En consulta'])assert.equal(appointmentStatus({estado,inicio:'2026-10-27T12:00:00Z'},now),estado);
console.log('OK: citas vencidas, estados clínicos conservados y cambio de día en El Salvador.');
