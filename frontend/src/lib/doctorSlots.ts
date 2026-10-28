type Schedule={diaSemana:number;desde:string;hasta:string};
type Interval={inicio:string;fin:string};
export type Availability={horarios:Schedule[];ocupados:Interval[];bloqueados:Interval[]};
export const clinicStart=(date:string,time:string)=>new Date(`${date}T${time}:00-06:00`);
export function doctorSlots(date:string,durationMinutes:number,availability:Availability,patientBusy:Interval[]=[],now=new Date()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||durationMinutes<=0||durationMinutes>240)return [];
 const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();
 const toMinutes=(value:string)=>Number(value.slice(0,2))*60+Number(value.slice(3,5));
 const result=new Map<string,{time:string;available:boolean}>();
 for(const schedule of availability.horarios.filter(s=>s.diaSemana===weekday)){
  for(let minute=toMinutes(schedule.desde);minute+durationMinutes<=toMinutes(schedule.hasta);minute+=15){
   const time=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
   const start=clinicStart(date,time),end=new Date(start.valueOf()+durationMinutes*60000);
   const available=start>now&&![...availability.ocupados,...availability.bloqueados,...patientBusy].some(i=>new Date(i.inicio)<end&&new Date(i.fin)>start);
   result.set(time,{time,available});
  }
 }
 return [...result.values()].sort((a,b)=>a.time.localeCompare(b.time));
}
