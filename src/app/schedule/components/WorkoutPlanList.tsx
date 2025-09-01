'use client';

import React, { useMemo, useState } from 'react';
import { WorkoutPlan } from '@/lib/workoutPlanApi';

interface WorkoutPlanListProps {
  plans: WorkoutPlan[];
  onEdit: (plan: WorkoutPlan) => void;
  onDelete: (id: string) => void;
}

function splitBaseAndDate(name: string): { base: string; date?: string } {
  const m = name.match(/^(.*)\s(\d{4}-\d{2}-\d{2})$/);
  if (m) return { base: m[1], date: m[2] };
  return { base: name };
}

export default function WorkoutPlanList({ plans, onEdit, onDelete }: WorkoutPlanListProps) {
  const groups = useMemo(() => {
    const map = new Map<string, WorkoutPlan[]>();
    for (const p of plans) {
      const { base } = splitBaseAndDate(p.name || '');
      const key = base.trim();
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    // sort each group by plannedDate asc
    const entries = Array.from(map.entries()).map(([k, list]) => [k, list.sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())] as const);
    return entries;
  }, [plans]);

  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOpenKeys((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-4">
      {groups.map(([base, list]) => {
        const first = list[0];
        const range = `${new Date(list[0].plannedDate).toLocaleDateString('zh-TW')} ~ ${new Date(list[list.length - 1].plannedDate).toLocaleDateString('zh-TW')}`;
        const isGrouped = list.length > 1;
        const opened = !!openKeys[base];
        return (
          <div key={base} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{isGrouped ? `${base}` : first.name}</h3>
                <p className="text-sm text-gray-500">
                  {isGrouped ? `${range} · 共 ${list.length} 筆` : `${new Date(first.plannedDate).toLocaleDateString('zh-TW')} - ${first.exercises.length} 個動作`}
                </p>
                {!isGrouped && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${first.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {first.status === 'completed' ? '已完成' : '待辦'}
                  </span>
                )}
              </div>
              <div className="flex space-x-2 items-center">
                {isGrouped ? (
                  <button onClick={() => toggle(base)} className="text-gray-600 hover:text-gray-800">{opened ? '收合' : '展開'}</button>
                ) : (
                  <>
                    <button onClick={() => onEdit(first)} className="text-blue-600 hover:text-blue-800">編輯</button>
                    <button onClick={() => onDelete(first._id)} className="text-red-600 hover:text-red-800">刪除</button>
                  </>
                )}
              </div>
            </div>

            {isGrouped && opened && (
              <div className="mt-3 divide-y">
                {list.map((p) => (
                  <div key={p._id} className="py-2 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{new Date(p.plannedDate).toLocaleDateString('zh-TW')} · {p.exercises.length} 個動作</div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.status === 'completed' ? '已完成' : '待辦'}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => onEdit(p)} className="text-blue-600 hover:text-blue-800 text-sm">編輯</button>
                      <button onClick={() => onDelete(p._id)} className="text-red-600 hover:text-red-800 text-sm">刪除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
