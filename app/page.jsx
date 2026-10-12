"use client";

import { useEffect, useState } from "react";

const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const colors = { purple: "bg-violet", orange: "bg-orange-400", blue: "bg-sky-400", green: "bg-emerald-500" };
const priorityStyle = { Tinggi: "bg-rose-50 text-rose-500", Sedang: "bg-amber-50 text-amber-600", Rendah: "bg-emerald-50 text-emerald-600" };

export default function Home() {
  const [selectedDay, setSelectedDay] = useState("Sen");
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("Berjalan");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [scheduleResponse, taskResponse] = await Promise.all([fetch("/api/schedules"), fetch("/api/tasks")]);
        if (!scheduleResponse.ok || !taskResponse.ok) throw new Error("Gagal memuat data");
        const [schedulePayload, taskPayload] = await Promise.all([scheduleResponse.json(), taskResponse.json()]);
        setSchedules(schedulePayload.data);
        setTasks(taskPayload.data);
      } catch { notify("Data dari database belum dapat dimuat."); }
    }
    loadData();
  }, []);

  const visibleSchedules = schedules.filter((item) => item.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
  const visibleTasks = tasks.filter((task) => filter === "Semua" || (filter === "Selesai" ? task.done : !task.done));
  const activeTasks = tasks.filter((task) => !task.done).length;
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const addSchedule = async (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const payload = { course: data.get("course"), place: data.get("place"), day: data.get("day"), time: data.get("time"), color: data.get("color") };
    try {
      const response = await fetch("/api/schedules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSchedules((value) => [...value, result.data]); setSelectedDay(data.get("day")); setModal(null); notify("Jadwal kuliah berhasil ditambahkan.");
    } catch (error) { notify(error.message || "Jadwal gagal disimpan."); }
  };
  const addTask = async (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const payload = { title: data.get("title"), course: data.get("course"), deadline: data.get("deadline"), priority: data.get("priority") };
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setTasks((value) => [...value, result.data]); setModal(null); notify("Tugas berhasil ditambahkan.");
    } catch (error) { notify(error.message || "Tugas gagal disimpan."); }
  };
  const deleteSchedule = async (id) => {
    try { const response = await fetch(`/api/schedules/${id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setSchedules((value) => value.filter((item) => item.id !== id)); notify("Jadwal dihapus."); } catch { notify("Jadwal gagal dihapus."); }
  };
  const deleteTask = async (id) => {
    try { const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setTasks((value) => value.filter((item) => item.id !== id)); notify("Tugas dihapus."); } catch { notify("Tugas gagal dihapus."); }
  };
  const toggleTask = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: !task.done }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setTasks((value) => value.map((item) => item.id === task.id ? result.data : item));
    } catch (error) { notify(error.message || "Status tugas gagal diubah."); }
  };

  return <main className="mx-auto min-h-screen max-w-6xl px-4 pb-12 sm:px-8">
    <header className="flex h-20 items-center justify-between">
      <button onClick={() => setSelectedDay("Sen")} className="flex items-center gap-2.5 text-left font-display text-lg font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">R</span>ruang<span className="text-violet">kuliah</span></button>
      <div className="flex items-center gap-4"><p className="hidden text-sm font-semibold text-slate-500 sm:block">Senin, 12 Oktober</p><button onClick={() => notify("Notifikasi akan tersedia setelah dihubungkan ke backend.")} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg text-violet shadow-sm" aria-label="Notifikasi">♧</button></div>
    </header>

    <section className="relative overflow-hidden rounded-[28px] bg-ink px-7 py-9 text-white sm:px-12 sm:py-11">
      <div className="relative z-10"><p className="mb-2 text-[10px] font-extrabold tracking-[.16em] text-indigo-200">SEMESTER INI</p><h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Halo, pejuang<br/><em className="font-serif font-normal text-indigo-200">kampus!</em> <span className="text-xl text-orange-300">✦</span></h1><p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Atur ritme kuliahmu, selesaikan tugas tepat waktu, dan nikmati prosesnya.</p></div>
      <div className="absolute -right-12 -top-10 grid h-72 w-72 place-items-center rounded-full border border-indigo-300/20 text-6xl before:absolute before:inset-7 before:rounded-full before:border before:border-indigo-300/15 after:absolute after:inset-14 after:rounded-full after:border after:border-indigo-300/15">📚</div>
    </section>

    <section className="my-5 grid gap-3 sm:grid-cols-3">
      <Stat icon="▣" tone="bg-indigo-50 text-violet" value={schedules.filter((item) => item.day === "Sen").length} label="Jadwal hari ini" />
      <Stat icon="✓" tone="bg-orange-50 text-orange-400" value={activeTasks} label="Tugas berjalan" />
      <Stat icon="◷" tone="bg-sky-50 text-sky-500" value={activeTasks ? "2 hari" : "—"} label="Deadline terdekat" />
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[22px] bg-white p-5 sm:p-7"><SectionTitle eyebrow="AGENDA" title="Jadwal Kuliah" action="+ Tambah jadwal" onAction={() => setModal("schedule")} />
        <div className="mt-7 flex justify-between gap-1">{days.map((day) => <button key={day} onClick={() => setSelectedDay(day)} className={`min-w-10 rounded-lg px-2 py-2 text-center text-[11px] font-bold ${day === selectedDay ? "bg-lavender text-violet" : "text-slate-400"}`}><span className="block text-base">{day}</span>{day === selectedDay && "Pilih"}</button>)}</div>
        <div className="mt-4">{visibleSchedules.length ? visibleSchedules.map((item) => <div key={item.id} className="group grid grid-cols-[45px_4px_1fr_auto] items-center gap-3 border-t border-slate-100 py-4"><span className="text-xs font-bold">{item.time}</span><span className={`h-10 rounded-full ${colors[item.color]}`}/><div><p className="text-sm font-bold">{item.course}</p><p className="mt-1 text-xs text-slate-500">{item.place}</p></div><button onClick={() => deleteSchedule(item.id)} className="text-lg text-slate-300 transition hover:text-rose-400" aria-label="Hapus jadwal">×</button></div>) : <Empty label="Belum ada jadwal pada hari ini." />}</div>
      </div>

      <div className="rounded-[22px] bg-white p-5 sm:p-7"><SectionTitle eyebrow="PRIORITAS" title="Tugas Saya" action="+ Tambah tugas" onAction={() => setModal("task")} />
        <div className="mt-6 flex gap-1">{["Berjalan", "Semua", "Selesai"].map((name) => <button key={name} onClick={() => setFilter(name)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === name ? "bg-lavender text-violet" : "text-slate-400"}`}>{name}</button>)}</div>
        <div className="mt-2">{visibleTasks.length ? visibleTasks.map((task) => <div key={task.id} className="group relative grid grid-cols-[20px_1fr_auto] gap-3 border-t border-slate-100 py-4"><input checked={task.done} onChange={() => toggleTask(task)} className="mt-0.5 h-[18px] w-[18px] accent-violet" type="checkbox"/><div><p className={`text-sm font-bold ${task.done ? "text-slate-400 line-through" : ""}`}>{task.title}</p><p className="mt-1 text-[11px] text-slate-500">{task.course} · {formatDeadline(task.deadline)}</p></div><span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${priorityStyle[task.priority]}`}>{task.priority}</span><button onClick={() => deleteTask(task.id)} className="absolute bottom-1 right-0 text-lg text-slate-300 transition hover:text-rose-400" aria-label="Hapus tugas">×</button></div>) : <Empty label="Tidak ada tugas di kategori ini." />}</div>
      </div>
    </section>

    <button onClick={() => setModal("task")} className="fixed bottom-5 right-5 grid h-14 w-14 place-items-center rounded-full bg-violet text-3xl text-white shadow-lg shadow-indigo-300 lg:hidden" aria-label="Tambah tugas">+</button>
    {toast && <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    {modal === "schedule" && <Modal title="Tambah Jadwal Kuliah" onClose={() => setModal(null)}><ScheduleForm onSubmit={addSchedule} /></Modal>}
    {modal === "task" && <Modal title="Tambah Tugas" onClose={() => setModal(null)}><TaskForm onSubmit={addTask} /></Modal>}
  </main>;
}

function Stat({ icon, tone, value, label }) { return <article className="flex items-center gap-3 rounded-2xl bg-white p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${tone}`}>{icon}</span><div><strong className="block font-display text-lg">{value}</strong><span className="text-xs text-slate-500">{label}</span></div></article>; }
function SectionTitle({ eyebrow, title, action, onAction }) { return <div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-slate-400">{eyebrow}</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">{title}</h2></div><button onClick={onAction} className="rounded-lg px-2 py-1 text-xs font-bold text-violet hover:bg-lavender">{action}</button></div>; }
function Empty({ label }) { return <p className="py-10 text-center text-sm text-slate-400">☼<br/><span className="mt-2 inline-block">{label}</span></p>; }
function formatDeadline(value) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)).replace(".", ":"); }
function Modal({ title, onClose, children }) { return <div className="fixed inset-0 z-10 grid place-items-center bg-ink/40 p-4"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-slate-400">DATA BARU</p><h2 className="mt-1 font-display text-xl font-bold">{title}</h2></div><button onClick={onClose} className="text-2xl text-slate-400" aria-label="Tutup">×</button></div>{children}</section></div>; }
function Field({ label, children }) { return <label className="block text-xs font-bold text-slate-600"><span>{label}</span>{children}</label>; }
const inputStyle = "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet focus:ring-2 focus:ring-indigo-100";
function ScheduleForm({ onSubmit }) { return <form onSubmit={onSubmit} className="space-y-4"><Field label="Mata kuliah"><input required name="course" className={inputStyle} placeholder="Contoh: Struktur Data" /></Field><Field label="Dosen / ruangan"><input name="place" className={inputStyle} placeholder="Contoh: Pak Budi · R. 302" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Hari"><select name="day" className={inputStyle}>{days.map((day) => <option key={day}>{day}</option>)}</select></Field><Field label="Waktu"><input required name="time" type="time" className={inputStyle}/></Field></div><Field label="Warna penanda"><select name="color" className={inputStyle}><option value="purple">Ungu</option><option value="orange">Oranye</option><option value="blue">Biru</option><option value="green">Hijau</option></select></Field><button className="w-full rounded-xl bg-violet py-3 text-sm font-bold text-white hover:bg-indigo-700">Simpan jadwal</button></form>; }
function TaskForm({ onSubmit }) { return <form onSubmit={onSubmit} className="space-y-4"><Field label="Judul tugas"><input required name="title" className={inputStyle} placeholder="Contoh: Makalah algoritma" /></Field><Field label="Mata kuliah"><input required name="course" className={inputStyle} placeholder="Contoh: Algoritma & Pemrograman" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Deadline"><input required name="deadline" type="datetime-local" className={inputStyle}/></Field><Field label="Prioritas"><select name="priority" className={inputStyle}><option>Tinggi</option><option defaultValue="Sedang">Sedang</option><option>Rendah</option></select></Field></div><button className="w-full rounded-xl bg-violet py-3 text-sm font-bold text-white hover:bg-indigo-700">Simpan tugas</button></form>; }
