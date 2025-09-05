
export interface BodyRecord {
  _id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  inbody?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
