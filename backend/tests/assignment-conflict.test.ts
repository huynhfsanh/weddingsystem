import { describe, expect, it } from "vitest";
import { hasAssignmentConflict } from "../src/domain/assignment-conflict.js";

const date = (hour: number, minute = 0) => new Date(2026, 8, 25, hour, minute);

describe("hasAssignmentConflict", () => {
  const existing = [{ startTime: date(10), endTime: date(12) }];

  it("phat hien trung toan bo va trung mot phan", () => {
    expect(hasAssignmentConflict({ startTime: date(10, 30), endTime: date(11) }, existing, 0)).toBe(true);
    expect(hasAssignmentConflict({ startTime: date(9), endTime: date(10, 30) }, existing, 0)).toBe(true);
  });

  it("phat hien xung dot do buffer", () => {
    expect(hasAssignmentConflict({ startTime: date(12, 15), endTime: date(14) }, existing, 30)).toBe(true);
    expect(hasAssignmentConflict({ startTime: date(12, 30), endTime: date(14) }, existing, 30)).toBe(false);
  });
});
