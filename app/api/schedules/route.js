import { getDatabase } from "@/lib/database";
import { invalid, makeId, serverError } from "@/lib/store";
import { validateSchedule } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedules = getDatabase().prepare("SELECT * FROM schedules ORDER BY day, time").all();
    return Response.json({ data: schedules });
  } catch { return serverError(); }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const checked = validateSchedule(body);
    if (checked.error) return invalid(checked.error);
    const schedule = { id: makeId("schedule"), ...checked.value, createdAt: new Date().toISOString() };
    getDatabase().prepare("INSERT INTO schedules (id, course, place, day, time, color, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)").run(schedule.id, schedule.course, schedule.place, schedule.day, schedule.time, schedule.color, schedule.createdAt);
    return Response.json({ data: schedule }, { status: 201 });
  } catch (error) { return error instanceof SyntaxError ? invalid("JSON tidak valid.") : serverError(); }
}
