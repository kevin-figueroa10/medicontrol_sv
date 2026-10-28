import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from '../frontend/node_modules/typescript/lib/typescript.js';

const source=readFileSync(new URL('../frontend/src/lib/paymentBalances.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {attendedBalances,paymentSummary}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const appointment=(id,estado,precio,pagado)=>({id,estado,precio,pagado});
const results=attendedBalances([
 appointment(1,'Finalizada',50,0),
 appointment(2,'Finalizada',50,20),
 appointment(3,'Finalizada',50,50),
 appointment(4,'Confirmada',50,0),
 appointment(5,'Cancelada',50,0),
 appointment(6,'No asistió',50,0),
 appointment(7,'En consulta',50,0),
 appointment(8,'Finalizada',0,0),
 appointment(9,'Finalizada',0.3,0.1+0.2),
 appointment(10,'Finalizada',50,60),
 appointment(11,'Finalizada','25.50','5.25'),
]);
assert.deepEqual(results.map(x=>[x.id,x.saldo]),[[1,50],[2,30],[11,20.25]]);
assert.deepEqual(attendedBalances([]),[]);
assert.deepEqual(attendedBalances([appointment(1,'Finalizada',50,50)]),[]);
assert.deepEqual(attendedBalances([appointment(1,'Finalizada',50,20)])[0].saldo,30);
console.log('OK: pendientes sin pago, abonos, liquidación, estados excluidos y precisión monetaria.');
assert.deepEqual(paymentSummary(50,0),{total:50,pagado:0,saldo:50,estado:'Sin pagar'});
assert.deepEqual(paymentSummary(50,20),{total:50,pagado:20,saldo:30,estado:'Pago parcial'});
assert.equal(paymentSummary(50,50).estado,'Pagado');
assert.equal(paymentSummary(0.3,0.1+0.2).estado,'Pagado');
assert.equal(paymentSummary(0,0).estado,'Sin costo');
assert.equal(paymentSummary('25.50','5.25').saldo,20.25);
assert.equal(paymentSummary(50,60).saldo,0);
assert.equal(paymentSummary(undefined,0),null);
console.log('OK: estado de pago del paciente: sin pagar, abono, pagado y servicio sin costo.');
