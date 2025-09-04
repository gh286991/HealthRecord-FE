import Card from '@/components/Card';
import React from 'react';
import { WorkoutPlan } from '@/types/dashboard';

interface WorkoutPlanSummaryProps {
  plans: WorkoutPlan[];
}

const WorkoutPlanSummary: React.FC<WorkoutPlanSummaryProps> = ({ plans }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-700">今日課表</h2>
      </div>
      <div className="p-6">
        {plans.length > 0 ? (
          <ul className="space-y-3">
            {plans.map((plan) => (
              <li key={plan._id} className="p-3 bg-amber-50 border border-amber-200 rounded-md flex justify-between items-center">
                <span className="font-semibold text-amber-900">{plan.name}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${plan.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                  {plan.status === 'completed' ? '已完成' : '待辦'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">今天沒有安排課表。</p>
        )}
      </div>
    </Card>
  );
};

export default WorkoutPlanSummary;