// Plain fetch utility — no React/UI imports here on purpose, so it stays
// usable from Server Components, Client Components, and React Query hooks
// alike. UI-level error handling (e.g. surfacing an ApiError via the Toast
// component from 0d) belongs at the call site, not in this file. The
// intended pattern once real endpoints exist (Phase 1/2+):
//
//   const { showToast } = useToast();
//   const mutation = useMutation({
//     mutationFn: () =>
//       apiFetch("/some-endpoint", { method: "POST", body: JSON.stringify(data) }),
//     onError: (err) =>
//       showToast({
//         variant: "error",
//         message: err instanceof ApiError ? String(err.body) : "Something went wrong",
//       }),
//   });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
