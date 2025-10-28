"use client";

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslations } from 'next-intl';
import Card from '@/components/Card';
import VolumeOverTime from '@/components/charts/VolumeOverTime';
import TopExercisesByVolume from '@/components/charts/TopExercisesByVolume';
import OneRMTrend from '@/components/charts/OneRMTrend';
import BodyPartDistribution from '@/components/charts/BodyPartDistribution';
import { useGetWorkoutListQuery, useGetWorkoutRangeQuery, WorkoutType, WorkoutRecord } from '@/lib/workoutApi';
import { getAIAdvice, suggestAIPlan, type SuggestedPlan } from '@/lib/aiAdviceApi';
import { useCreateWorkoutPlanMutation, WorkoutPlan } from '@/lib/workoutPlanApi';
import LoadingModal from '@/components/ios/LoadingModal';

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function StrengthAnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const { data: rangeData, isLoading: rangeLoading, isError: rangeError } = useGetWorkoutRangeQuery({ range, type: WorkoutType.Resistance });
  const { data, isLoading, isError } = useGetWorkoutListQuery(undefined);

  const records: WorkoutRecord[] = useMemo(() => {
    const fallback: WorkoutRecord[] = (data?.records ?? []) as WorkoutRecord[];
    const src: WorkoutRecord[] = (Array.isArray(rangeData) && rangeData.length > 0) ? rangeData : fallback;
    const now = new Date();
    const days = range === '7d' ? 7 : 30;
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    const startStr = formatDate(start);
    return (src || []).filter((r) => {
      const d = (r?.date || '').split('T')[0];
      return d >= startStr;
    });
  }, [rangeData, data?.records, range]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">重訓圖表</h1>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm ${range === '7d' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setRange('7d')}
          >近一週</button>
          <button
            className={`px-3 py-1.5 text-sm ${range === '30d' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setRange('30d')}
          >近一月</button>
        </div>
      </div>

      {(isLoading || rangeLoading) && (
        <div className="text-gray-500">讀取資料中…</div>
      )}
      {(isError || rangeError) && (
        <div className="text-red-600">資料載入失敗，請稍後再試。</div>
      )}

      {!isLoading && !isError && (
        <>
          <Card className="p-5">
            <div className="mb-3">
              <h2 className="text-lg font-medium text-gray-800">每日訓練量趨勢</h2>
              <p className="text-sm text-gray-500">以 kg·reps 表示每日總訓練量</p>
            </div>
            <VolumeOverTime records={records} />
          </Card>

          <Card className="p-5">
            <div className="mb-3">
              <h2 className="text-lg font-medium text-gray-800">部位分佈（組數）</h2>
              <p className="text-sm text-gray-500">選定區間各部位訓練組數與總量</p>
            </div>
            <BodyPartDistribution records={records} />
          </Card>

          <Card className="p-5">
            <div className="mb-3">
              <h2 className="text-lg font-medium text-gray-800">Top 動作訓練量</h2>
              <p className="text-sm text-gray-500">累積訓練量最高的動作</p>
            </div>
            <TopExercisesByVolume records={records} topN={5} />
          </Card>

          <Card className="p-5">
            <div className="mb-3">
              <h2 className="text-lg font-medium text-gray-800">動作 1RM 估算趨勢</h2>
              <p className="text-sm text-gray-500">依 Epley 公式估算單日最高 1RM</p>
            </div>
            <OneRMTrend records={records} />
          </Card>

          <AIAdvice range={range} />
        </>
      )}
    </div>
  );
}

function AIAdvice({ range }: { range: '7d' | '30d' }) {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [previewPlans, setPreviewPlans] = useState<SuggestedPlan[] | null>(null);
  const [createPlan] = useCreateWorkoutPlanMutation();
  const t = useTranslations();

  const tx = (name: string) => {
    try {
      const key = `exercise.${name}` as Parameters<typeof t>[0];
      const v = t(key);
      // 若找不到，next-intl 可能回傳 key 本身，這時改回原名
      if (!v || v === `exercise.${name}`) return name;
      return v;
    } catch {
      return name;
    }
  };

  const onAdvice = async () => {
    try {
      setLoading(true);
      setAdvice('');
      const text = await getAIAdvice(range);
      setAdvice(text);
    } catch {
      setAdvice('目前無法取得 AI 建議，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const onSuggestPlan = async () => {
    try {
      setPlanLoading(true);
      const plans = await suggestAIPlan(range, advice);
      setPreviewPlans(plans);
    } catch {
      setPreviewPlans([]);
    } finally {
      setPlanLoading(false);
    }
  };

  const onConfirmCreate = async () => {
    if (!previewPlans || previewPlans.length === 0) return;
    for (const p of previewPlans) {
      try {
        const payload: Partial<WorkoutPlan> = {
          name: p.name,
          plannedDate: p.plannedDate,
          exercises: p.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            // 不強制帶入 bodyPart（型別可能不相容），交由後端/既有邏輯處理
            sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
          })),
        };
        await createPlan(payload).unwrap();
      } catch {
        // continue
      }
    }
    setPreviewPlans(null);
    alert('課表已建立');
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800">AI 建議（Gemini）</h2>
          <p className="text-sm text-gray-500">根據近{range === '7d' ? '一週' : '一月'}數據提供訓練建議</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAdvice}
            disabled={loading || planLoading}
            className={`px-3 py-1.5 rounded-md text-sm ${loading || planLoading ? 'bg-gray-200 text-gray-500' : 'bg-gray-900 text-white hover:bg-black'}`}
          >{loading ? '分析中…' : '取得建議'}</button>
          <button
            onClick={onSuggestPlan}
            disabled={planLoading || loading || !advice}
            title={!advice ? '請先取得 AI 建議' : undefined}
            className={`px-3 py-1.5 rounded-md text-sm ${planLoading || loading || !advice ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >{planLoading ? '規劃中…' : '建議課表'}</button>
        </div>
      </div>
      {advice ? (
        <div className="leading-6 text-gray-900">
          <ReactMarkdown>{advice}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-sm text-gray-500">按下「取得建議」開始分析（需設定 GEMINI_API_KEY）</div>
      )}

      {/* 全畫面 Loading 覆蓋 */}
      <LoadingModal open={loading || planLoading} message={loading ? 'AI 分析中…' : (planLoading ? '產生建議課表中…' : '處理中…')} />

      {previewPlans && (
        <div className="mt-4 border rounded-lg p-4 bg-white text-black">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">建議課表預覽（未建立）</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200" onClick={() => setPreviewPlans(null)}>取消</button>
              <button className="px-3 py-1.5 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700" onClick={onConfirmCreate}>建立課表</button>
            </div>
          </div>
          {previewPlans.length === 0 ? (
            <div className="text-sm">目前無法產生建議課表，請稍後再試。</div>
          ) : (
            <div className="space-y-4">
              {previewPlans.map((p, idx) => (
                <div key={idx} className="border rounded-md p-3">
                  <div className="text-sm">{p.plannedDate}</div>
                  <div className="font-semibold">{p.name}</div>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {p.exercises.map((e, i) => (
                      <li key={i}>
                        <span className="font-medium">{tx(e.exerciseName)}</span>
                        <span className="">（{e.sets?.length || 0} 組）</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
