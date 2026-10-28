type Appointment = { id:number; [key:string]:any };

export function paymentSummary(price:unknown,paid:unknown){
 const totalCents=Math.round(Number(price)*100),paidCents=Math.round(Number(paid)*100);
 if(!Number.isFinite(totalCents)||!Number.isFinite(paidCents)||totalCents<0||paidCents<0)return null;
 const balance=Math.max(0,totalCents-paidCents);
 return {total:totalCents/100,pagado:paidCents/100,saldo:balance/100,
  estado:totalCents===0?'Sin costo':balance===0?'Pagado':paidCents===0?'Sin pagar':'Pago parcial'};
}

// Work in cents so fully paid appointments do not leave floating-point balances.
export function attendedBalances<T extends Appointment>(appointments:T[]) {
 return appointments.flatMap(appointment=>{
  const price=Number(appointment.precio),paid=Number(appointment.pagado);
  if(appointment.estado!=='Finalizada'||!Number.isFinite(price)||!Number.isFinite(paid))return [];
  const cents=Math.round(price*100)-Math.round(paid*100);
  return cents>0?[{...appointment,saldo:cents/100}]:[];
 });
}
