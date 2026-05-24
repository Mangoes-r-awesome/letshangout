import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

// Parse + validate a request JSON body against a Zod schema.
// On failure returns a 400 response with the first field error;
// on success returns the parsed data.
//
// Usage:
//   const parsed = await parseBody(req, MySchema);
//   if (parsed instanceof NextResponse) return parsed;
//   // parsed is typed by your schema here.
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }
  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      const issue = err.issues[0];
      const field = issue.path.join(".") || "body";
      return NextResponse.json(
        { error: `${field}: ${issue.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
