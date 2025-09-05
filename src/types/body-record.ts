
export interface BodyRecord {
  _id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  inbody?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
