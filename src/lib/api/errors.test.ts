import { describe, expect, it } from "vitest";

import { ApiError, parseApiError } from "./errors";

describe("ApiError", () => {
  it("exposes status and helper predicates correctly", () => {
    const error401 = new ApiError(401, "Unauthorized");
    expect(error401.isUnauthorized).toBe(true);
    expect(error401.isForbidden).toBe(false);

    const error403 = new ApiError(403, "Forbidden");
    expect(error403.isForbidden).toBe(true);

    const error404 = new ApiError(404, "Not Found");
    expect(error404.isNotFound).toBe(true);

    const error409 = new ApiError(409, "Conflict");
    expect(error409.isConflict).toBe(true);

    const error413 = new ApiError(413, "Payload Too Large");
    expect(error413.isPayloadTooLarge).toBe(true);

    const error422 = new ApiError(422, "Validation Error");
    expect(error422.isValidationError).toBe(true);

    const error500 = new ApiError(500, "Internal Server Error");
    expect(error500.isServerError).toBe(true);
  });

  it("extracts field errors accurately", () => {
    const error = new ApiError(422, "Validation failed", {
      details: {
        name: ["Name is required"],
        assistant_instructions: ["Must be at most 10000 characters"],
      },
    });

    expect(error.fieldError("name")).toBe("Name is required");
    expect(error.fieldError("assistant_instructions")).toBe("Must be at most 10000 characters");
    expect(error.fieldError("description")).toBeUndefined();
  });
});

describe("parseApiError", () => {
  it("handles string detail from FastAPI", () => {
    const err = parseApiError(404, { detail: "Assistant not found" });
    expect(err.status).toBe(404);
    expect(err.message).toBe("Assistant not found");
    expect(err.rawDetail).toBe("Assistant not found");
  });

  it("handles validation error array from FastAPI", () => {
    const payload = {
      detail: [
        { loc: ["body", "name"], msg: "Field required", type: "value_error.missing" },
        {
          loc: ["body", "primary_color"],
          msg: "String should match pattern",
          type: "value_error.str.pattern",
        },
      ],
    };

    const err = parseApiError(422, payload);
    expect(err.status).toBe(422);
    expect(err.message).toContain("name: Field required");
    expect(err.message).toContain("primary_color: String should match pattern");
    expect(err.details?.name).toEqual(["Field required"]);
    expect(err.details?.primary_color).toEqual(["String should match pattern"]);
    expect(err.fieldError("name")).toBe("Field required");
  });

  it("handles formData prefix in validation loc", () => {
    const payload = {
      detail: [
        { loc: ["formData", "file"], msg: "File is required", type: "value_error.missing" },
      ],
    };

    const err = parseApiError(422, payload);
    expect(err.details?.file).toEqual(["File is required"]);
    expect(err.fieldError("file")).toBe("File is required");
  });

  it("falls back to default messages for HTTP status codes when detail is missing", () => {
    expect(parseApiError(400, null).message).toBe("Bad request.");
    expect(parseApiError(401, null).message).toContain("Authentication credentials");
    expect(parseApiError(403, null).message).toContain("permission");
    expect(parseApiError(404, null).message).toContain("not found");
    expect(parseApiError(409, null).message).toContain("conflicts");
    expect(parseApiError(413, null).message).toContain("size limit");
    expect(parseApiError(422, null).message).toContain("Validation failed");
    expect(parseApiError(502, null).message).toContain("Upstream service");
    expect(parseApiError(503, null).message).toContain("temporarily unavailable");
    expect(parseApiError(500, null).message).toContain("unexpected server error");
  });

  it("handles plain text errors", () => {
    const err = parseApiError(500, "Raw gateway failure");
    expect(err.status).toBe(500);
    expect(err.message).toBe("Raw gateway failure");
  });
});
