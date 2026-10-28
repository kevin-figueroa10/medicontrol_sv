import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from '../frontend/node_modules/react/index.js';
import {renderToStaticMarkup} from '../frontend/node_modules/react-dom/server.node.js';
import ts from '../frontend/node_modules/typescript/lib/typescript.js';

const dataUrl=text=>`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const dependencies={
 '../context/Clinic':dataUrl('export const useClinic=()=>({panel:globalThis.__patientSummaryPanel}); export const date=v=>v; export const money=v=>"$"+Number(v).toFixed(2);'),
 './ClinicalUI':dataUrl('export const Modal=({children})=>children;'),
 '../lib/appointmentStatus':dataUrl(compile('../frontend/src/lib/appointmentStatus.ts')),
 '../lib/paymentBalances':dataUrl(compile('../frontend/src/lib/paymentBalances.ts')),
 'react/jsx-runtime':new URL('../frontend/node_modules/react/jsx-runtime.js',import.meta.url).href,
};
let compiled=compile('../frontend/src/components/PatientAppointmentSummary.tsx');
for(const [path,url] of Object.entries(dependencies))compiled=compiled.replaceAll(`'${path}'`,JSON.stringify(url)).replaceAll(`"${path}"`,JSON.stringify(url));
const {default:Summary}=await import(dataUrl(compiled));
const appointment={id:10,pacienteId:1,estado:'Finalizada',precio:50,pagado:0,inicio:'2026-10-28T15:00:00Z',medico:'Médico de prueba',especialidad:'Cardiología',servicio:'Consulta'};
const ownConsultation={id:20,citaId:10,pacienteId:1,motivo:'Control',diagnostico:'Diagnóstico del paciente',tratamiento:'Tratamiento registrado',recomendaciones:'Control en un mes'};
const foreignConsultation={id:21,citaId:99,pacienteId:2,diagnostico:'Diagnóstico ajeno que no debe mostrarse'};
globalThis.__patientSummaryPanel={appointments:[appointment],consultations:[foreignConsultation,ownConsultation],prescriptions:[{id:30,consultaId:20,anulada:false,medicamentos:[{medicamento:'Medicamento de prueba',dosis:'Dosis registrada',frecuencia:'Frecuencia registrada',duracion:'Duración registrada'}]}]};
const render=()=>renderToStaticMarkup(React.createElement(Summary,{appointmentId:10,onClose:()=>{}}));
try{
 let html=render();
 for(const value of ['Diagnóstico del paciente','Tratamiento registrado','Control en un mes','Medicamento de prueba','Sin pagar','$50.00'])assert.ok(html.includes(value),value);
 assert.ok(!html.includes(foreignConsultation.diagnostico));
 appointment.pagado=20;assert.ok(render().includes('Pago parcial'));assert.ok(render().includes('$30.00'));
 appointment.pagado=50;assert.ok(render().includes('Pago: Pagado'));assert.ok(!render().includes('aún tiene saldo pendiente'));
 globalThis.__patientSummaryPanel.consultations=[foreignConsultation];assert.ok(render().includes('No se encontró el resumen'));
 assert.equal(renderToStaticMarkup(React.createElement(Summary,{appointmentId:99,onClose:()=>{}})),'');
 console.log('OK: resumen y receta de la cita correcta, pagos, consulta ausente y rechazo de citas fuera del panel.');
}finally{delete globalThis.__patientSummaryPanel;}
