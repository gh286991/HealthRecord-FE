'use client';

import { useMemo, useState } from 'react';
import WheelPicker, { WheelOption } from '../WheelPicker';
import IOSBottomSheet from './IOSBottomSheet';

export interface DualExerciseItem {
  _id: string;
  name: string;
  bodyPart?: string;
}

interface IOSDualWheelPickerProps {
  open: boolean;
  title?: string;
  bodyParts: string[];
  exercises: DualExerciseItem[]; // 全部常用動作
  onClose: () => void;
  onConfirm: (exercise: DualExerciseItem) => void;
}

export default function IOSDualWheelPicker({ open, title = '選擇動作', bodyParts, exercises, onClose, onConfirm }: IOSDualWheelPickerProps) {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const exerciseOptions: WheelOption<string>[] = useMemo(() => {
    const filtered = selectedBodyPart ? exercises.filter(e => (e.bodyPart || '') === selectedBodyPart) : exercises;
    const opts = filtered.map(e => ({ label: e.name, value: e._id }));
    if (opts.length > 0 && !opts.find(o => o.value === selectedExerciseId)) {
      setSelectedExerciseId(opts[0].value);
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, selectedBodyPart]);

  const bodyPartOptions: WheelOption<string>[] = useMemo(() => [{ label: '全部', value: '' }, ...bodyParts.map(bp => ({ label: bp, value: bp }))], [bodyParts]);

  const headerLabel = useMemo(() => {
    const bp = bodyPartOptions.find(b => b.value === selectedBodyPart)?.label ?? '全部';
    const exFull = exerciseOptions.find(e => e.value === selectedExerciseId)?.label ?? '';
    const exShort = exFull.replace(/\s*\(.+?\)\s*$/, '');
    return `${bp} · ${exShort}`;
  }, [bodyPartOptions, selectedBodyPart, exerciseOptions, selectedExerciseId]);

  return (
    <IOSBottomSheet
      open={open}
      onClose={onClose}
      headerContent={<>{title} · <span className="text-[#007AFF]">{headerLabel}</span></>}
      onConfirm={() => {
        const ex = exercises.find(e => e._id === selectedExerciseId);
        if (ex) onConfirm(ex);
        onClose();
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
  );
}


