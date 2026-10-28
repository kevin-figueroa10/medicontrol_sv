import {useClinic,date,Row} from '../../context/Clinic';
import {UserForm,UserPasswordForm} from '../../components/ManageForms';
import {Modal} from '../../components/ClinicalUI';
import { useState } from 'react';
import { Plus, Edit3, UserX, UserCheck, Shield, KeyRound } from 'lucide-react';


const roleBadge: Record<string, string> = {
  'Laboratorio': 'bg-cyan-100 text-cyan-700',
  'Administrador': 'bg-purple-100 text-purple-700',
  'Médico': 'bg-blue-100 text-blue-700',
  'Recepcionista': 'bg-indigo-100 text-indigo-700',
  'Paciente': 'bg-green-100 text-green-700',
};

export default function Users() {
 const {panel,mutate}=useClinic();const users=panel.users.map(u=>({id:u.id,name:String(u.nombre),email:String(u.correo),role:u.rol==='Medico'?'Médico':String(u.rol),status:u.activo?'Activo':'Inactivo',lastAccess:'—'}));async function toggle(id:number){const u=panel.users.find(u=>u.id===id);if(!u||!window.confirm(u.activo?'¿Desactivar usuario?':'¿Activar usuario?'))return;try{await mutate(`/usuarios/${id}/activo`,{activo:!u.activo},'PATCH');}catch{}};
  const [showModal, setShowModal] = useState(false);
 const [edit,setEdit]=useState<Row|undefined>();
 const [passwordUser,setPasswordUser]=useState<Row|undefined>();

  return (
    <div className="p-6 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Usuarios y permisos</h1>
          <p className="text-sm text-slate-500">{users.length} usuarios registrados</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => {setEdit(undefined);setShowModal(true);}}>
          <Plus size={13} />
          Crear usuario
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!users.length&&<tr><td colSpan={8} className="p-8 text-center text-sm text-slate-500">No hay registros.</td></tr>}{users.map(u => (
                <tr key={u.id} className="table-row border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className="text-slate-400" />
                      <span className={`badge ${roleBadge[u.role]}`}>{u.role}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${u.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{u.lastAccess}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button aria-label={`Cambiar contraseña de ${u.name}`} title="Cambiar contraseña" className="btn btn-ghost btn-sm p-1.5" onClick={()=>setPasswordUser(panel.users.find(x=>x.id===u.id))}><KeyRound size={13} className="text-blue-600" /></button>
                      <button aria-label="Editar usuario" className="btn btn-ghost btn-sm p-1.5" onClick={()=>{setEdit(panel.users.find(x=>x.id===u.id));setShowModal(true);}}><Edit3 size={13} className="text-slate-500" /></button>
                      {u.status === 'Activo'
                        ? <button aria-label="Desactivar usuario" className="btn btn-ghost btn-sm p-1.5" onClick={()=>toggle(u.id)}><UserX size={13} className="text-red-500" /></button>
                        : <button aria-label="Activar usuario" className="btn btn-ghost btn-sm p-1.5" onClick={()=>toggle(u.id)}><UserCheck size={13} className="text-green-600" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal&&<Modal title="Usuario" onClose={()=>setShowModal(false)}><UserForm edit={edit} onClose={()=>setShowModal(false)}/></Modal>}
      {passwordUser&&<Modal title="Cambiar contraseña" onClose={()=>setPasswordUser(undefined)}><UserPasswordForm user={passwordUser} onClose={()=>setPasswordUser(undefined)}/></Modal>}
    </div>
  );
}
