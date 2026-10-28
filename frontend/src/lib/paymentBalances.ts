type Appointment = { id:number; [key:string]:any };

// Work in cents so fully paid appointments do not leave floating-point balances.
export function attendedBalances<T extends Appointment>(appointments:T[]) {
 return appointments.flatMap(appointment=>{
  const price=Number(appointment.precio),paid=Number(appointment.pagado);
  if(appointment.estado!=='Finalizada'||!Number.isFinite(price)||!Number.isFinite(paid))return [];
  const cents=Math.round(price*100)-Math.round(paid*100);
  return cents>0?[{...appointment,saldo:cents/100}]:[];
 });
}
