
'use client';

import { useState } from 'react';
import { useAddBodyRecordMutation } from '@/lib/authApi';
import Button from '@/components/Button';
import Toast from '@/components/Toast';

export default function AddBodyRecordForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [addBodyRecord, { isLoading }] = useAddBodyRecordMutation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'error'>('default');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) {
      setToastVariant('error');
      setToastMsg('請輸入體重');
      setToastOpen(true);
      return;
    }

    try {
      await addBodyRecord({
        date,
        weight: Number(weight),
        bodyFat: bodyFat ? Number(bodyFat) : undefined,
      }).unwrap();

      setToastVariant('success');
      setToastMsg('新增成功');
      setToastOpen(true);
      setWeight('');
      setBodyFat('');
    } catch (err) {
      setToastVariant('error');
      setToastMsg('新增失敗，請稍後再試');
      setToastOpen(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-black">新增身體記錄</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-black">日期</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
          />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-black">體重 (kg)</label>
          <input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="bodyFat" className="block text-sm font-medium text-black">體脂率 (%)</label>
          <input
            id="bodyFat"
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
          />
        </div>
      </div>
      <div className="text-right">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '新增中...' : '新增記錄'}
        </Button>
      </div>
      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
    </form>
  );
}
