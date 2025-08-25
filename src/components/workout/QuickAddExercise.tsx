'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const { data: bodyParts = [] } = useGetBodyPartsQuery();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('chest');
  const [name, setName] = useState('');
  const [bodyPartPickerOpen, setBodyPartPickerOpen] = useState(false);
  const [addUserExercise, { isLoading }] = useAddUserExerciseMutation();

  useEffect(() => {
    if (!open) return;
    setName('');
    setSelectedBodyPart((bodyParts || [])[0] || 'chest');
  }, [open, bodyParts]);

  const canSubmit = useMemo(() => name.trim().length >= 1 && !!selectedBodyPart, [name, selectedBodyPart]);

  return (
    <IOSBottomSheet
      open={open}
      onClose={onClose}
      title={t('workout.quickAddExercise')}
      confirmText={isLoading ? t('workout.saving') : t('common.add')}
      onConfirm={async () => {
        if (!canSubmit) return;
        try {
          const res = await addUserExercise({ name: name.trim(), bodyPart: selectedBodyPart }).unwrap();
          onAdded(res);
          onClose();
        } catch {
          alert(t('workout.addFailed'));
        }
      }}
      className="max-w-xl"
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.bodyPart')}</label>
          <button
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-left flex items-center justify-between"
            onClick={() => setBodyPartPickerOpen(true)}
          >
            <span>{t(`bodyPart.${selectedBodyPart}`)}</span>
            <span className="text-gray-400">＞</span>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.exerciseName')}</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
            placeholder={t('workout.exerciseNamePlaceholder')}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">{t('workout.exerciseNameNote')}</p>
        </div>
      </div>

      <IOSWheelPicker
        open={bodyPartPickerOpen}
        title={t('workout.selectBodyPart')}
        options={(bodyParts || []).map(bp => ({ label: t(`bodyPart.${bp}`), value: bp }))}
        value={selectedBodyPart}
        onChange={setSelectedBodyPart}
        onClose={() => setBodyPartPickerOpen(false)}
      />
    </IOSBottomSheet>
  );
}


