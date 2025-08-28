'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  useCreateNutritionRecordMutation,
  useUploadPhotoMutation 
} from '@/lib/nutritionApi';
import { getSafeImageProps } from '@/lib/imageUtils';

interface QuickMealEntryProps {
  mealType: '早餐' | '午餐' | '晚餐' | '點心';
  onSave: (meal: {
    mealType: string;
    date: string;
    foods: Array<{
      foodName: string;
      description: string;
      calories: number;
    }>;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const mealIcons = {
  '早餐': '🌅',
  '午餐': '☀️', 
  '晚餐': '🌙',
  '點心': '🍎'
};

export default function QuickMealEntry({ mealType, onSave, onCancel }: QuickMealEntryProps) {
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query mutations
  const [createNutritionRecord] = useCreateNutritionRecordMutation();
  const [uploadPhoto] = useUploadPhotoMutation();

  const handlePhotoPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim()) {
      alert('請輸入食物名稱');
      return;
    }

    setIsSubmitting(true);

    try {
      // 準備API所需的數據格式 - 根據新的schema格式
      const recordData = {
        date: new Date().toISOString().split('T')[0],
        mealType,
        foods: [{
          foodName: foodName.trim(),
          description: description.trim(),
          calories: typeof calories === 'number' ? calories : 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        }],
        notes: notes.trim(),
      };

      let newRecord;
      const photoFile = fileInputRef.current?.files?.[0];

      // 先創建記錄
      try {
        newRecord = await createNutritionRecord(recordData).unwrap();
        
        // 如果有圖片，後續上傳
        if (photoFile && newRecord._id) {
          try {
            const photoResult = await uploadPhoto({ id: newRecord._id, file: photoFile }).unwrap();
            newRecord.photoUrl = photoResult.photoUrl; // 更新記錄的photoUrl
            console.log('圖片上傳成功');
          } catch (uploadError) {
            console.warn('圖片上傳失敗，但記錄已保存:', uploadError);
          }
        }
        
        // 轉換為期望的格式
        onSave({
          mealType: newRecord.mealType,
          date: newRecord.date,
          foods: newRecord.foods.map(food => ({
            foodName: food.foodName,
            description: food.description || '',
            calories: food.calories,
          })),
          notes: newRecord.notes,
        });
      } catch (apiError) {
        console.warn('API不可用，保存到本地存儲:', apiError);
        
        // 本地存儲 fallback
        const localRecord = {
          _id: Date.now().toString(),
          userId: 'local-user',
          date: new Date().toISOString().split('T')[0],
          mealType,
          foods: [{
            foodId: '',
            foodName: foodName.trim(),
            quantity: 1,
            calories: typeof calories === 'number' ? calories : 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            description: description.trim(),
          }],
          notes: notes.trim(),
          totalCalories: typeof calories === 'number' ? calories : 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0,
          photoUrl: uploadedPhoto,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 轉換為期望的格式
        onSave({
          mealType: localRecord.mealType,
          date: localRecord.date,
          foods: localRecord.foods.map(food => ({
            foodName: food.foodName,
            description: food.description || '',
            calories: food.calories,
          })),
          notes: localRecord.notes,
        });
      }
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{mealIcons[mealType]}</span>
            <h2 className="text-xl font-bold text-gray-900">快速記錄{mealType}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 食物名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">吃了什麼？*</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="如：蛋炒飯、蘋果、咖啡..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-lg"
              autoFocus
            />
          </div>

          {/* 份量描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">份量大小</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="如：一碗、一個、一杯..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 預估卡路里 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">預估卡路里</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="大概的卡路里數..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 圖片上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">餐點照片</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePhotoPreview(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v1z" />
                </svg>
                選擇照片
              </button>
              <p className="mt-2 text-xs text-gray-500">可選</p>
            </div>

            {uploadedPhoto && (
              <div className="mt-3 text-center">
                <Image
                  {...getSafeImageProps(uploadedPhoto)}
                  alt="餐點照片預覽"
                  width={120}
                  height={90}
                  className="object-cover rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUploadedPhoto('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  移除照片
                </button>
              </div>
            )}
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">心得備註</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="味道如何，有什麼感想..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? '保存中...' : '保存記錄'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}