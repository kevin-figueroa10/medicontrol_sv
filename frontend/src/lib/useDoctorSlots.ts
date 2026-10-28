import {useEffect,useState} from 'react';
import {api} from './api';
import {doctorSlots,Availability} from './doctorSlots';
import type {Row} from '../context/Clinic';

export function useDoctorSlots(doctorId:number|undefined,date:string,durationMinutes:number,appointments:Row[],patientId?:number,excludeId?:number){
 const key=`${doctorId}/${date}/${excludeId}`;
 const [state,setState]=useState<{key:string;data?:Availability;error?:string}>({key:''});
 const [version,setVersion]=useState(0);
 useEffect(()=>{
  if(!doctorId||!date)return;
  const controller=new AbortController();setState({key});
  api<Availability>(`/medicos/${doctorId}/disponibilidad?fecha=${date}${excludeId?`&citaId=${excludeId}`:''}`,{signal:controller.signal})
   .then(data=>{if(!controller.signal.aborted)setState({key,data});})
   .catch(ex=>{if(!controller.signal.aborted)setState({key,error:ex instanceof Error?ex.message:'No se pudo consultar el horario.'});});
  return ()=>controller.abort();
 },[key,version]);
 const current=state.key===key?state:undefined;
 const patientBusy=appointments.filter(a=>a.id!==excludeId&&a.pacienteId===patientId&&!['Cancelada','No asistió'].includes(a.estado)).map(a=>({inicio:String(a.inicio),fin:String(a.fin)}));
 return {slots:current?.data?doctorSlots(date,durationMinutes,current.data,patientBusy):[],
  ranges:current?.data?.horarios.filter(h=>h.diaSemana===new Date(`${date}T12:00:00Z`).getUTCDay())??[],
  loading:Boolean(doctorId&&date&&!current?.data&&!current?.error),error:current?.error,
  retry:()=>setVersion(v=>v+1)};
}
