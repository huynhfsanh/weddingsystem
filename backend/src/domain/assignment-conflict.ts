export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export const hasAssignmentConflict = (
  candidate: TimeRange,
  existing: TimeRange[],
  bufferMinutes: number,
) => {
  if (candidate.endTime <= candidate.startTime) throw new Error("Thoi gian ket thuc phai sau thoi gian bat dau");
  const buffer = Math.max(0, bufferMinutes) * 60_000;
  const candidateStart = candidate.startTime.getTime() - buffer;
  const candidateEnd = candidate.endTime.getTime() + buffer;

  return existing.some((range) => {
    const existingStart = range.startTime.getTime();
    const existingEnd = range.endTime.getTime();
    return candidateStart < existingEnd && candidateEnd > existingStart;
  });
};
