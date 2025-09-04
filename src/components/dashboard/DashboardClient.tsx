
'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardData } from '@/lib/api';
import { DashboardData } from '@/types/dashboard';
import CalorieSummary from './CalorieSummary';
import WorkoutSummary from './WorkoutSummary';
import WorkoutPlanSummary from './WorkoutPlanSummary';

const DashboardClient = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming you have a way to get the auth token
        const token = localStorage.getItem('token'); 
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await getDashboardData(token);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-10">No dashboard data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">我的儀表板</h1>
        <div className="space-y-6">
          <CalorieSummary 
            tdee={data.tdee} 
            consumed={data.dietSummary.dailyTotals.totalCalories} 
            bmr={data.bmr}
            activityLevel={data.activityLevel}
            activityMultiplier={data.activityMultiplier}
          />
          <WorkoutPlanSummary plans={data.workoutPlans} />
          <WorkoutSummary records={data.workoutRecords} />
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
