import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from '../frontend/node_modules/typescript/lib/typescript.js';
const source=readFileSync(new URL('../frontend/src/lib/api.ts',import.meta.url),'utf8').replaceAll('import.meta.env.VITE_API_URL','undefined').replaceAll('import.meta.env.PROD','true');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const originalFetch=globalThis.fetch,originalStorage=globalThis.sessionStorage;
const originalTimeout=Object.getOwnPropertyDescriptor(AbortSignal,'timeout');
try{
 delete AbortSignal.timeout;
 globalThis.sessionStorage={getItem:()=>null};
 const {api,loginApi}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
 let request;
 globalThis.fetch=async(url,options)=>{request={url,options};return new Response(JSON.stringify({token:'test-token',rol:'Paciente',nombre:'Prueba'}),{status:200,headers:{'Content-Type':'application/json'}});};
 assert.equal((await loginApi('prueba@example.invalid','not-a-real-password')).token,'test-token');
 assert.ok(request.options.signal instanceof AbortSignal);
 assert.equal(request.options.method,'POST');
 assert.equal(request.url,'/api/auth/login');
 const config=JSON.parse(readFileSync(new URL('../frontend/vercel.json',import.meta.url),'utf8'));
 assert.equal(config.rewrites[0].source,'/api/:path*');
 assert.equal(config.rewrites[0].destination,'https://medicontrol-sv.onrender.com/api/:path*');
 const controller=new AbortController();
 await api('/panel',{signal:controller.signal});
 assert.equal(request.options.signal,controller.signal);
 globalThis.fetch=async()=>{throw new TypeError('Network unavailable');};
 await assert.rejects(api('/panel'),error=>error.status===0&&error.message.includes('No se pudo conectar'));
 console.log('OK: inicio de sesión sin AbortSignal.timeout, ruta de Vercel, cancelación externa y error de red.');
}finally{
 globalThis.fetch=originalFetch;
 if(originalStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=originalStorage;
 if(originalTimeout)Object.defineProperty(AbortSignal,'timeout',originalTimeout);
}
