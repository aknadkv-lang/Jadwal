import { getDatabase, taskFromRow } from "@/lib/database";
import { invalid, notFound, serverError } from "@/lib/store";
import { validateTask } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(_, { params }) {
  try {
    const { id } = await params;
    const task = taskFromRow(getDatabase().prepare("SELECT * FROM tasks WHERE id = ?").get(id));
    return task ? Response.json({ data: task }) : notFound("Tugas");
  } catch { return serverError(); }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json(); const checked = validateTask(body, true);
    if (checked.error) return invalid(checked.error);
    if (!Object.keys(checked.value).length) return invalid("Tidak ada data yang diperbarui.");
    const entries = Object.entries(checked.value).map(([key, value]) => [key, key === "done" ? Number(value) : value]); const values = entries.map(([, value]) => value); const updatedAt = new Date().toISOString();
    const sql = `UPDATE tasks SET ${entries.map(([key]) => `${key} = ?`).join(", ")}, updatedAt = ? WHERE id = ?`;
    const database = getDatabase(); const result = database.prepare(sql).run(...values, updatedAt, id);
    if (!result.changes) return notFound("Tugas");
    return Response.json({ data: taskFromRow(database.prepare("SELECT * FROM tasks WHERE id = ?").get(id)) });
  } catch (error) { return error instanceof SyntaxError ? invalid("JSON tidak valid.") : serverError(); }
}

export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const database = getDatabase(); const deleted = database.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!deleted) return notFound("Tugas");
    database.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return Response.json({ data: taskFromRow(deleted) });
  } catch { return serverError(); }
}
