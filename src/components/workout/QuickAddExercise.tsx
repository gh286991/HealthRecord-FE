'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import IOSBottomSheet from '@/components/ios/IOSBottomSheet';
import { useAddUserExerciseMutation, useGetBodyPartsQuery } from '@/lib/workoutApi';
import IOSAlertModal from '@/components/ios/IOSAlertModal';

export default function QuickAddExercise({
  open,
  onClose,
  onAdded,
  initialBodyPart,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (ex: { _id: string; name: string; bodyPart: string }) => void;
  initialBodyPart?: string;
}) {
  const t = useTranslations();
  const { data: bodyParts = [] } = useGetBodyPartsQuery();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('chest');
  const [name, setName] = useState('');
  const [addUserExercise, { isLoading }] = useAddUserExerciseMutation();
  const [alertInfo, setAlertInfo] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' });

  useEffect(() => {
    if (!open) return;
    setName('');
    setSelectedBodyPart(initialBodyPart || (bodyParts || [])[0] || 'chest');
  }, [open, bodyParts, initialBodyPart]);

  const canSubmit = useMemo(() => name.trim().length >= 1 && !!selectedBodyPart, [name, selectedBodyPart]);

  return (
    <>
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
          } catch (err: unknown) {
            const message = (err as { data?: { message?: string } })?.data?.message || t('workout.addFailed');
            setAlertInfo({ open: true, title: t('workout.addFailed'), message });
          }
        }}
        className="max-w-xl"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.bodyPart')}</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
              {t(`bodyPart.${selectedBodyPart}`)}
            </div>
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

      </IOSBottomSheet>
      <IOSAlertModal
        open={alertInfo.open}
        title={alertInfo.title}
        message={alertInfo.message}
        onConfirm={() => setAlertInfo({ ...alertInfo, open: false })}
        onCancel={() => setAlertInfo({ ...alertInfo, open: false })}
      />
    </>
  );
}


