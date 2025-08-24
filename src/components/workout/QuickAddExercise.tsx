'use client';

import { useEffect, useMemo, useState } from 'react';
import IOSBottomSheet from '@/components/ios/IOSBottomSheet';
import IOSWheelPicker from '@/components/ios/IOSWheelPicker';
import { useAddUserExerciseMutation, useGetBodyPartsQuery } from '@/lib/workoutApi';

export default function QuickAddExercise({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (ex: { _id: string; name: string; bodyPart: string }) => void;
}) {
  const { data: bodyParts = [] } = useGetBodyPartsQuery();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('胸');
  const [name, setName] = useState('');
  const [bodyPartPickerOpen, setBodyPartPickerOpen] = useState(false);
  const [addUserExercise, { isLoading }] = useAddUserExerciseMutation();

  useEffect(() => {
    if (!open) return;
    setName('');
    setSelectedBodyPart((bodyParts || [])[0] || '胸');
  }, [open, bodyParts]);

  const canSubmit = useMemo(() => name.trim().length >= 1 && !!selectedBodyPart, [name, selectedBodyPart]);

  return (
    <IOSBottomSheet
      open={open}
      onClose={onClose}
      title="快速新增動作"
      confirmText={isLoading ? '儲存中...' : '新增'}
      onConfirm={async () => {
        if (!canSubmit) return;
        try {
          const res = await addUserExercise({ name: name.trim(), bodyPart: selectedBodyPart }).unwrap();
          onAdded(res);
          onClose();
        } catch {
          alert('新增失敗，可能名稱重複於你的清單');
        }
      }}
      className="max-w-xl"
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">部位</label>
          <button
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-left flex items-center justify-between"
            onClick={() => setBodyPartPickerOpen(true)}
          >
            <span>{selectedBodyPart}</span>
            <span className="text-gray-400">＞</span>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">動作名稱</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
            placeholder="例：亞鈴握推"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">名稱將只屬於你的帳號。</p>
        </div>
      </div>

      <IOSWheelPicker
        open={bodyPartPickerOpen}
        title="選擇部位"
        options={(bodyParts || []).map(bp => ({ label: bp, value: bp }))}
        value={selectedBodyPart}
        onChange={setSelectedBodyPart}
        onClose={() => setBodyPartPickerOpen(false)}
      />
    </IOSBottomSheet>
  );
}


