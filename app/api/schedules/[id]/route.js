import { getDatabase } from "@/lib/database";
import { invalid, notFound, serverError } from "@/lib/store";
import { validateSchedule } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_, { params }) {
  try {
    const { id } = await params;
    const schedule = getDatabase().prepare("SELECT * FROM schedules WHERE id = ?").get(id);
    return schedule ? Response.json({ data: schedule }) : notFound("Jadwal");
  } catch { return serverError(); }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json(); const checked = validateSchedule(body, true);
    if (checked.error) return invalid(checked.error);
    if (!Object.keys(checked.value).length) return invalid("Tidak ada data yang diperbarui.");
    const entries = Object.entries(checked.value); const values = entries.map(([, value]) => value); const updatedAt = new Date().toISOString();
    const sql = `UPDATE schedules SET ${entries.map(([key]) => `${key} = ?`).join(", ")}, updatedAt = ? WHERE id = ?`;
    const result = getDatabase().prepare(sql).run(...values, updatedAt, id);
    if (!result.changes) return notFound("Jadwal");
    const schedule = getDatabase().prepare("SELECT * FROM schedules WHERE id = ?").get(id);
    return Response.json({ data: schedule });
  } catch (error) { return error instanceof SyntaxError ? invalid("JSON tidak valid.") : serverError(); }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const database = getDatabase(); const deleted = database.prepare("SELECT * FROM schedules WHERE id = ?").get(id);
    if (!deleted) return notFound("Jadwal");
    database.prepare("DELETE FROM schedules WHERE id = ?").run(id);
    return Response.json({ data: deleted });
  } catch { return serverError(); }
}
