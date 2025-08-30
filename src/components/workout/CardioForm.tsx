'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CardioType, getCardioTypeInfo } from './WorkoutTypeSelector';
import { CardioData } from '@/lib/workoutApi';
import Button from '@/components/Button';
import Card from '@/components/Card';
import IOSDatePicker from '@/components/ios/IOSDatePicker';
import IOSWheelPicker from '@/components/ios/IOSWheelPicker';
import IOSNumericKeypad from '@/components/ios/IOSNumericKeypad';



interface CardioFormProps {
  initialData?: {
    date?: string;
    duration?: number; // 持續時間（分鐘）
    cardioData?: CardioData;
    notes?: string;
  };
  onSubmit: (data: {
    date: string;
    duration: number;
    cardioData: CardioData;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export default function CardioForm({ initialData, onSubmit, onCancel }: CardioFormProps) {
  const t = useTranslations();
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(initialData?.duration || 30); // 預設30分鐘
  const [cardioData, setCardioData] = useState<CardioData>(
    initialData?.cardioData || {
      cardioType: CardioType.Running,
      intensity: 5,
    }
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // 控制各種選擇器的開關狀態
  const [cardioTypePickerOpen, setCardioTypePickerOpen] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const [intensityPickerOpen, setIntensityPickerOpen] = useState(false);
  
  // 數字鍵盤狀態
  const [numPadOpen, setNumPadOpen] = useState(false);
  const [numPadTitle, setNumPadTitle] = useState('');
  const [numPadValue, setNumPadValue] = useState<number | string>('');
  const [numPadField, setNumPadField] = useState<string>('');

  // 手機偵測
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia('(max-width: 640px)');
      const set = () => setIsMobile(mq.matches);
      set();
      mq.addEventListener('change', set);
      return () => mq.removeEventListener('change', set);
    } catch {}
  }, []);

  // 常見運動類型選項
  const cardioTypeOptions = Object.values(CardioType).map(type => {
    const info = getCardioTypeInfo(type, t);
    return {
      label: `${info.icon} ${info.name}`,
      value: type,
    };
  });

  // 持續時間選項（分鐘）
  const durationOptions = [
    { label: '15分鐘', value: 15 },
    { label: '30分鐘', value: 30 },
    { label: '45分鐘', value: 45 },
    { label: '60分鐘', value: 60 },
    { label: '90分鐘', value: 90 },
    { label: '120分鐘', value: 120 },
  ];

  // 強度選項（1-10）
  const intensityOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1} - ${getIntensityLabel(i + 1)}`,
    value: i + 1,
  }));

  function getIntensityLabel(intensity: number): string {
    if (intensity <= 3) return t('intensity.light');
    if (intensity <= 6) return t('intensity.moderate');
    if (intensity <= 8) return t('intensity.vigorous');
    return t('intensity.maximum');
  }

  const openNumPad = (field: string, title: string, value: number | undefined) => {
    setNumPadField(field);
    setNumPadTitle(title);
    setNumPadValue(value || '');
    setNumPadOpen(true);
  };

  const handleNumPadConfirm = (value: number) => {
    const newCardioData = { ...cardioData };
    
    switch (numPadField) {
      case 'distance':
        newCardioData.distance = value;
        break;
      case 'averageHeartRate':
        newCardioData.averageHeartRate = Math.floor(value);
        break;
      case 'maxHeartRate':
        newCardioData.maxHeartRate = Math.floor(value);
        break;
      case 'caloriesBurned':
        newCardioData.caloriesBurned = Math.floor(value);
        break;
      case 'duration':
        setDuration(Math.max(1, Math.floor(value)));
        setNumPadOpen(false);
        return;
    }
    
    setCardioData(newCardioData);
    setNumPadOpen(false);
  };

  const handleSubmit = () => {
    // 基本驗證
    if (!date || duration < 1 || !cardioData.cardioType) {
      alert(t('cardio.fillRequired'));
      return;
    }

    onSubmit({
      date,
      duration,
      cardioData,
      notes: notes.trim() || undefined,
    });
  };

  const selectedCardioInfo = getCardioTypeInfo(cardioData.cardioType, t);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      <div className="space-y-4">
        
        {/* 記錄日期 */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('workout.recordDate')}
          </label>
          <IOSDatePicker
            selectedDate={date}
            onChange={setDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </Card>

        {/* 有氧運動類型 */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('cardio.cardioType')}
          </label>
          <button
            type="button"
            onClick={() => setCardioTypePickerOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 flex items-center justify-between"
          >
            <span>{selectedCardioInfo.icon} {selectedCardioInfo.name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </Card>

        {/* 持續時間 */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('cardio.duration')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={duration}
              readOnly={isMobile}
              onClick={() => isMobile && openNumPad('duration', t('cardio.enterDuration'), duration)}
              onFocus={(e) => isMobile && e.target.blur()}
              onChange={(e) => !isMobile && setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
            <span className="px-3 py-2 text-gray-600 bg-gray-50 rounded-lg">{t('common.minutes')}</span>
            <button
              type="button"
              onClick={() => setDurationPickerOpen(true)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.quickSelect')}
            </button>
          </div>
        </Card>

        {/* 運動強度 */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('cardio.intensity')} (1-10)
          </label>
          <button
            type="button"
            onClick={() => setIntensityPickerOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 flex items-center justify-between"
          >
            <span>{cardioData.intensity} - {getIntensityLabel(cardioData.intensity)}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </Card>

        {/* 可選欄位 */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('cardio.optionalFields')}</h3>
          
          <div className="space-y-3">
            {/* 距離 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('cardio.distance')} ({t('common.kilometers')})</label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={cardioData.distance || ''}
                readOnly={isMobile}
                onClick={() => isMobile && openNumPad('distance', t('cardio.enterDistance'), cardioData.distance)}
                onFocus={(e) => isMobile && e.target.blur()}
                onChange={(e) => !isMobile && setCardioData({
                  ...cardioData,
                  distance: parseFloat(e.target.value) || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder={t('cardio.distancePlaceholder')}
              />
            </div>

            {/* 平均心率 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('cardio.averageHeartRate')} (bpm)</label>
              <input
                type="number"
                min={40}
                max={220}
                value={cardioData.averageHeartRate || ''}
                readOnly={isMobile}
                onClick={() => isMobile && openNumPad('averageHeartRate', t('cardio.enterHeartRate'), cardioData.averageHeartRate)}
                onFocus={(e) => isMobile && e.target.blur()}
                onChange={(e) => !isMobile && setCardioData({
                  ...cardioData,
                  averageHeartRate: parseInt(e.target.value) || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder={t('cardio.heartRatePlaceholder')}
              />
            </div>

            {/* 運動地點 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('cardio.location')}</label>
              <input
                type="text"
                value={cardioData.location || ''}
                onChange={(e) => setCardioData({
                  ...cardioData,
                  location: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder={t('cardio.locationPlaceholder')}
              />
            </div>
          </div>
        </Card>

        {/* 備註 */}
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('workout.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder={t('cardio.notesPlaceholder')}
          />
        </Card>

        {/* 操作按鈕 */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            {t('cardio.saveRecord')}
          </Button>
        </div>
      </div>

      {/* 有氧類型選擇器 */}
      <IOSWheelPicker
        open={cardioTypePickerOpen}
        onClose={() => setCardioTypePickerOpen(false)}
        title={t('cardio.selectCardioType')}
        options={cardioTypeOptions}
        value={cardioData.cardioType}
        onChange={(value) => {
          setCardioData({ ...cardioData, cardioType: value as CardioType });
          setCardioTypePickerOpen(false);
        }}
      />

      {/* 持續時間選擇器 */}
      <IOSWheelPicker
        open={durationPickerOpen}
        onClose={() => setDurationPickerOpen(false)}
        title={t('cardio.selectDuration')}
        options={durationOptions}
        value={duration}
        onChange={(value) => {
          setDuration(value as number);
          setDurationPickerOpen(false);
        }}
      />

      {/* 強度選擇器 */}
      <IOSWheelPicker
        open={intensityPickerOpen}
        onClose={() => setIntensityPickerOpen(false)}
        title={t('cardio.selectIntensity')}
        options={intensityOptions}
        value={cardioData.intensity}
        onChange={(value) => {
          setCardioData({ ...cardioData, intensity: value as number });
          setIntensityPickerOpen(false);
        }}
      />

      {/* 數字鍵盤 */}
      <IOSNumericKeypad
        open={numPadOpen}
        onClose={() => setNumPadOpen(false)}
        title={numPadTitle}
        initialValue={numPadValue}
        allowDecimal={numPadField === 'distance'}
        onConfirm={handleNumPadConfirm}
      />
    </div>
  );
}