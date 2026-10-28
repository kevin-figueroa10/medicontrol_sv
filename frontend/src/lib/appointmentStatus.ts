function clinicDay(value:string|Date){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/El_Salvador',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
export function appointmentStatus(appointment:{estado:string;inicio:string},now=new Date()){
 return ['Confirmada','En espera'].includes(appointment.estado)&&clinicDay(appointment.inicio)<clinicDay(now)?'No atendida':appointment.estado;
}
