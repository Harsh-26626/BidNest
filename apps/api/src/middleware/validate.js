import { HttpError } from "../lib/httpError.js";

// schema = z.object({ body?, query?, params? }). Parsed values land on req.valid.
export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!r.success) {
    const details = r.error.issues.map((i) => ({ path: i.path.slice(1).join("."), message: i.message }));
    return next(new HttpError(422, "VALIDATION_ERROR", "Invalid input", details));
  }
  req.valid = r.data;
  next();
};
