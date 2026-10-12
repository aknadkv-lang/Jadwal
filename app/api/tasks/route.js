import { getDatabase, taskFromRow } from "@/lib/database";
import { invalid, makeId, serverError } from "@/lib/store";
import { validateTask } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = getDatabase().prepare("SELECT * FROM tasks ORDER BY deadline").all().map(taskFromRow);
    return Response.json({ data: tasks });
  } catch { return serverError(); }
}

export async function POST(request) {
  try {
    const body = await request.json(); const checked = validateTask(body);
    if (checked.error) return invalid(checked.error);
    const task = { id: makeId("task"), ...checked.value, done: false, createdAt: new Date().toISOString() };
    getDatabase().prepare("INSERT INTO tasks (id, title, course, deadline, priority, done, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)").run(task.id, task.title, task.course, task.deadline, task.priority, 0, task.createdAt);
    return Response.json({ data: task }, { status: 201 });
  } catch (error) { return error instanceof SyntaxError ? invalid("JSON tidak valid.") : serverError(); }
}
