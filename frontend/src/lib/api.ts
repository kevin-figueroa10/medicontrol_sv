const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5080').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(public status:number,message:string){super(message);this.name='ApiError';}
}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 const token=sessionStorage.getItem('mc_token');
 const headers=new Headers(options.headers);
 if(options.body&&!(options.body instanceof FormData))headers.set('Content-Type','application/json');
 if(token)headers.set('Authorization',`Bearer ${token}`);
 let response:Response;
 const controller=options.signal?undefined:new AbortController();
 const timeout=controller?setTimeout(()=>controller.abort(),90000):undefined;
 try {response=await fetch(`${BASE}/api${path}`,{...options,headers,signal:options.signal??controller!.signal});}
 catch {throw new ApiError(0,'No se pudo conectar con el servidor. Compruebe la conexión y vuelva a intentar.');}
 finally {if(timeout!==undefined)clearTimeout(timeout);}
 if(!response.ok){
  const content=await response.text();let detail='';
  try {const body=JSON.parse(content);detail=body.error||body.detail||(body.errors?Object.values(body.errors).flat().join(' '):'');}catch{}
  if(response.status===401&&token){for(const key of ['mc_token','mc_role','mc_name'])sessionStorage.removeItem(key);window.location.assign('/login');}
  throw new ApiError(response.status,detail||({401:'Correo o contraseña incorrectos, cuenta bloqueada o sesión vencida.',403:'No tiene permiso para esta operación.',404:'No se encontró el registro.',429:'Demasiados intentos. Espere un minuto.'} as Record<number,string>)[response.status]||`No se pudo completar la operación (${response.status}).`);
 }
 return response.status===204?undefined as T:response.json() as Promise<T>;
}
export const loginApi=(correo:string,password:string)=>api<{token:string;rol:string;nombre:string}>('/auth/login',{method:'POST',body:JSON.stringify({correo,password})});

export async function downloadDocument(id:number,name:string){const token=sessionStorage.getItem('mc_token');const r=await fetch(`${BASE}/api/documentos/${id}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)throw new Error('No se pudo descargar el documento.');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
