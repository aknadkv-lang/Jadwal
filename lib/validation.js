const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const priorities = ["Tinggi", "Sedang", "Rendah"];
const colors = ["purple", "orange", "blue", "green"];

function text(value, label, required = true) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return required ? { error: `${label} wajib diisi.` } : { value: "" };
  }
  const cleaned = String(value).trim();
  return cleaned.length > 160 ? { error: `${label} terlalu panjang.` } : { value: cleaned };
}

export function validateSchedule(input, partial = false) {
  const result = {};
  if (!partial || "course" in input) { const check = text(input.course, "Mata kuliah", !partial); if (check.error) return check; result.course = check.value; }
  if (!partial || "place" in input) { const check = text(input.place, "Lokasi", false); if (check.error) return check; result.place = check.value; }
  if (!partial || "day" in input) { if (!days.includes(input.day)) return { error: "Hari tidak valid." }; result.day = input.day; }
  if (!partial || "time" in input) { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time || "")) return { error: "Waktu harus berformat JJ:MM." }; result.time = input.time; }
  if (!partial || "color" in input) { if (!colors.includes(input.color)) return { error: "Warna penanda tidak valid." }; result.color = input.color; }
  return { value: result };
}

export function validateTask(input, partial = false) {
  const result = {};
  if (!partial || "title" in input) { const check = text(input.title, "Judul tugas", !partial); if (check.error) return check; result.title = check.value; }
  if (!partial || "course" in input) { const check = text(input.course, "Mata kuliah", !partial); if (check.error) return check; result.course = check.value; }
  if (!partial || "deadline" in input) { const date = new Date(input.deadline); if (Number.isNaN(date.getTime())) return { error: "Deadline tidak valid." }; result.deadline = date.toISOString(); }
  if (!partial || "priority" in input) { if (!priorities.includes(input.priority)) return { error: "Prioritas tidak valid." }; result.priority = input.priority; }
  if ("done" in input) { if (typeof input.done !== "boolean") return { error: "Status selesai harus bernilai true atau false." }; result.done = input.done; }
  return { value: result };
}
