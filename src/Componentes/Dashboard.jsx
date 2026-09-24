import { useState } from 'react'
import Navegacion from './Navegacion.jsx'
import AdministracionPanel from './AdministracionPanel.jsx'
import Inventario from './Inventario.jsx'
import Soportetecnico from './Soportetecnico.jsx'

function Dashboard({ authenticated = false, onLogin, onRegister, onLogout, isAdmin = false }) {
    const [activeSection, setActiveSection] = useState('home')

    return (
        <section className="dashboard-shell min-h-screen text-slate-100">
            <header className="border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-xl sm:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500 font-black text-white shadow-lg shadow-red-500/20">A</div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-white">Antilow</p>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Soporte & equipos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />Sistema operativo</span>
                        {authenticated ? (
                            <button className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-400 hover:text-white" type="button" onClick={onLogout}>Cerrar sesión</button>
                        ) : (
                            <div className="flex gap-2">
                                <button className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-white" type="button" onClick={onLogin}>Iniciar sesión</button>
                                <button className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400" type="button" onClick={onRegister}>Crear cuenta</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
                <Navegacion activeSection={activeSection} onSectionChange={setActiveSection} isAdmin={isAdmin} />

                <main className="dashboard-content flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                    {activeSection === 'inventory' ? <Inventario isAdmin={isAdmin} /> : isAdmin && (activeSection === 'home' || activeSection === 'users' || activeSection === 'support') ? <AdministracionPanel /> : activeSection === 'support' ? <Soportetecnico /> : <>
                    {activeSection !== 'home' && (
                        <div className="mb-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-5 py-4 text-sm text-cyan-100" role="status">
                            <span className="font-bold">Vista seleccionada:</span> {activeSection === 'support' ? 'Soporte técnico' : activeSection === 'inventory' ? 'Inventario' : 'Reportes'}.
                            <span className="ml-2 text-cyan-300/70">Módulo preparado para tus operaciones.</span>
                        </div>
                    )}
                    <div className="mb-10 max-w-3xl">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-400">{activeSection === 'home' ? 'Panel de control / 01' : 'Módulo operativo'}</p>
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{activeSection === 'home' ? <>Todo tu soporte,<br /><span className="text-red-400">en un solo lugar.</span></> : activeSection === 'support' ? <>Resuelve cada<br /><span className="text-red-400">incidencia a tiempo.</span></> : activeSection === 'inventory' ? <>Equipos bajo<br /><span className="text-cyan-400">control total.</span></> : <>Decisiones con<br /><span className="text-amber-400">datos claros.</span></>}</h1>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Supervisa tickets, clientes y el rendimiento de tu inventario tecnológico desde una vista diseñada para actuar rápido.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <article className="metric-card border-red-400/20 bg-red-400/10"><p>Tickets abiertos</p><strong>12</strong><span className="text-red-300">+8.4% esta semana</span><div className="metric-line bg-red-400" /></article>
                        <article className="metric-card border-cyan-400/20 bg-cyan-400/10"><p>Clientes activos</p><strong>58</strong><span className="text-cyan-300">+12 nuevos este mes</span><div className="metric-line bg-cyan-400" /></article>
                        <article className="metric-card border-amber-400/20 bg-amber-400/10"><p>Ventas de hoy</p><strong>$1.250.000</strong><span className="text-amber-300">+18.2% vs. ayer</span><div className="metric-line bg-amber-400" /></article>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Actividad reciente</p><h2 className="mt-2 text-xl font-bold text-white">Operaciones del día</h2></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">En vivo</span></div>
                            <div className="mt-6 space-y-4">
                                {['Ticket #1048 asignado a soporte', 'Laptop Pro 14 agregada al inventario', 'Nuevo cliente registrado'].map((item, index) => <div className="flex items-center gap-4 border-t border-white/5 pt-4" key={item}><span className={`h-2.5 w-2.5 rounded-full ${['bg-red-400', 'bg-cyan-400', 'bg-amber-400'][index]}`} /><p className="flex-1 text-sm text-slate-300">{item}</p><time className="text-xs text-slate-600">{index + 2}h</time></div>)}
                            </div>
                        </article>
                        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Estado del servicio</p><div className="mt-6 flex items-center justify-center"><div className="grid h-32 w-32 place-items-center rounded-full border-[10px] border-emerald-400/20 border-t-emerald-400"><div className="text-center"><strong className="block text-3xl text-white">98%</strong><span className="text-[10px] uppercase tracking-widest text-slate-500">Uptime</span></div></div></div><p className="mt-5 text-center text-xs text-slate-400">Todos los sistemas funcionan con normalidad.</p></article>
                    </div>
                    </>}
                </main>
            </div>
        </section>
    )
}

export default Dashboard;
