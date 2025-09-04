import Card from '@/components/Card';
import React from 'react';
import { WorkoutRecord } from '@/types/dashboard';

interface WorkoutSummaryProps {
  records: WorkoutRecord[];
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ records }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-700">今日運動紀錄</h2>
      </div>
      <div className="p-6">
        {records.length > 0 ? (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record._id} className="p-3 bg-gray-100 rounded-md flex justify-between items-center">
                <span className="font-semibold text-gray-800">{record.notes || record.type}</span>
                <span className="text-sm text-gray-600">{record.duration ? `${record.duration} 分鐘` : 'N/A'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">今天還沒有運動紀錄喔！</p>
        )}
      </div>
    </Card>
  );
};

export default WorkoutSummary;