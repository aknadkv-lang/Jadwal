export function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function invalid(message) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(resource) {
  return Response.json({ error: `${resource} tidak ditemukan.` }, { status: 404 });
}

export function serverError() {
  return Response.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
}
