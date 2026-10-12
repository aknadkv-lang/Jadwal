import { getDatabase, taskFromRow } from "@/lib/database";
import { serverError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dayMap = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const today = dayMap[new Date().getDay()];
    const database = getDatabase();
    const schedulesToday = database.prepare("SELECT COUNT(*) AS count FROM schedules WHERE day = ?").get(today).count;
    const activeTasks = database.prepare("SELECT COUNT(*) AS count FROM tasks WHERE done = 0").get().count;
    const nearestDeadline = taskFromRow(database.prepare("SELECT * FROM tasks WHERE done = 0 ORDER BY deadline LIMIT 1").get());
    return Response.json({ data: { schedulesToday, activeTasks, nearestDeadline } });
  } catch { return serverError(); }
}
