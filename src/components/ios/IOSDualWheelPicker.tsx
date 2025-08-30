'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import WheelPicker, { WheelOption } from '../WheelPicker';
import IOSBottomSheet from './IOSBottomSheet';
import QuickAddExercise from '@/components/workout/QuickAddExercise';



interface IOSDualWheelPickerProps {
  open: boolean;
  title?: string;
  hideTitle?: boolean;
  bodyParts: string[];
  exercises: DualExerciseItem[]; // 全部常用動作
  onClose: () => void;
  onConfirm: (exercise: DualExerciseItem) => void;
}

export default function IOSDualWheelPicker({ open, title, hideTitle, bodyParts, exercises, onClose, onConfirm }: IOSDualWheelPickerProps) {
  const t = useTranslations();
  const defaultTitle = (!hideTitle) ? (title || t('common.select')) : '';
  
  // 輔助函數：只有在有翻譯鍵值時才使用翻譯，否則使用原始名稱
  const getTranslatedName = (key: string, fallback: string) => {
    // 檢查翻譯鍵值是否以已知的運動項目開頭
    const exerciseKey = key.replace('exercise.', '');
    const knownExercises = [
      'Bench Press', 'Incline Dumbbell Press', 'Dumbbell Flyes', 'Push-ups',
      'Squat', 'Romanian Deadlift', 'Hip Thrust', 'Lunges', 'Leg Press', 'Calf Raises',
      'Deadlift', 'Barbell Row', 'Pull-up', 'Lat Pulldown', 'T-Bar Row',
      'Overhead Press', 'Lateral Raise', 'Rear Delt Flyes', 'Front Raise', 'Shrugs',
      'Biceps Curl', 'Hammer Curl', 'Preacher Curl', 'Triceps Pushdown', 'Overhead Triceps Extension',
      'Close-Grip Bench Press', 'Dips', 'Plank', 'Crunches', 'Russian Twists',
      'Leg Raises', 'Mountain Climbers', 'Burpees', 'Thrusters', 'Clean and Press'
    ];
    
    if (knownExercises.includes(exerciseKey)) {
      return t(key);
    } else {
      return fallback;
    }
  };
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<DualExerciseItem[]>(exercises);

  useEffect(() => {
    if (open) setAllExercises(exercises);
  }, [exercises, open]);

  const exerciseOptions: WheelOption<string>[] = useMemo(() => {
    const source = allExercises;
    const filtered = selectedBodyPart ? source.filter(e => (e.bodyPart || '') === selectedBodyPart) : source;
    const opts = filtered.map(e => ({
      label: getTranslatedName(`exercise.${e.name}`, e.name),
      value: e._id
    }));
    
    // 添加自訂選項到最後
    opts.push({
      label: t('common.custom'),
      value: 'custom'
    });
    
    if (opts.length > 0 && !opts.find(o => o.value === selectedExerciseId)) {
      setSelectedExerciseId(opts[0].value);
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allExercises, selectedBodyPart, getTranslatedName]);

  const bodyPartOptions: WheelOption<string>[] = useMemo(() => [{ label: t('common.all'), value: '' }, ...bodyParts.map(bp => ({ label: t(`bodyPart.${bp}`), value: bp }))], [bodyParts, t]);

  const headerLabel = useMemo(() => {
    const bp = bodyPartOptions.find(b => b.value === selectedBodyPart)?.label ?? t('common.all');
    const exFull = exerciseOptions.find(e => e.value === selectedExerciseId)?.label ?? '';
    const exShort = exFull.replace(/\s*\(.+?\)\s*$/, '');
    return `${bp} · ${exShort}`;
  }, [bodyPartOptions, selectedBodyPart, exerciseOptions, selectedExerciseId, t]);

  return (
    <>
      <IOSBottomSheet
        open={open}
        onClose={onClose}
        headerContent={
          <>
            {defaultTitle} {defaultTitle && '·'} <span className="text-[#007AFF]">{headerLabel}</span>
          </>
        }
        onConfirm={() => {
          if (selectedExerciseId === 'custom') {
            setQuickOpen(true);
          } else {
            const ex = allExercises.find(e => e._id === selectedExerciseId);
            if (ex) onConfirm(ex);
            onClose();
          }
        }}
      >
        <div className="bg-gray-50 p-4">
          <div className="flex gap-6">
            <WheelPicker<string>
              value={selectedBodyPart}
              options={bodyPartOptions}
              onChange={(bp) => setSelectedBodyPart(bp)}
              className="flex-1"
              autoScrollOnMount={false}
            />
            <WheelPicker<string>
              value={selectedExerciseId}
              options={exerciseOptions}
              onChange={(id) => setSelectedExerciseId(id)}
              className="flex-[2]"
              autoScrollOnMount={false}
            />
          </div>
        </div>
      </IOSBottomSheet>

      <QuickAddExercise
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        initialBodyPart={selectedBodyPart}
        onAdded={(ex) => {
          // 把新項目加入右側清單，預設選中，保持面板開啟
          setAllExercises((prev) => [...prev, ex]);
          setSelectedExerciseId(ex._id);
          setQuickOpen(false);
        }}
      />
    </>
  );
}


