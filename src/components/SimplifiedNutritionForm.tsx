'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { 
  useCreateNutritionRecordMutation, 
  useUpdateNutritionRecordMutation,
  useUploadPhotoMutation 
} from '@/lib/nutritionApi';
import { getSafeImageProps } from '@/lib/imageUtils';

// 簡化的驗證 schema - 食物變成可選
const simplifiedNutritionSchema = z.object({
  mealType: z.enum(['早餐', '午餐', '晚餐', '點心']),
  date: z.string(),
  foods: z.array(z.object({
    foodName: z.string().min(1, '請輸入食物名稱'),
    description: z.string().optional(),
    calories: z.number().min(0).optional(),
  })).default([]), // 移除 optional，只保留 default
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

// type SimplifiedNutritionFormData = z.infer<typeof simplifiedNutritionSchema>;

interface SimplifiedNutritionFormProps {
  onSuccess?: (record: {
    _id: string;
    date: string;
    mealType: string;
    foods: Array<{
      foodName: string;
      description?: string;
      calories: number;
    }>;
    notes?: string;
    photoUrl?: string;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    date?: string;
    mealType?: '早餐' | '午餐' | '晚餐' | '點心';
    foods?: Array<{
      foodName: string;
      description?: string;
      calories?: number;
    }>;
    notes?: string;
    photoUrl?: string;
  };
  recordId?: string;
}

const mealTypeOptions = [
  { value: '早餐', label: '早餐', icon: '🌅' },
  { value: '午餐', label: '午餐', icon: '☀️' },
  { value: '晚餐', label: '晚餐', icon: '🌙' },
  { value: '點心', label: '點心', icon: '🍎' },
];

export default function SimplifiedNutritionForm({ 
  onSuccess, 
  onCancel, 
  initialData,
  recordId 
}: SimplifiedNutritionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query mutations
  const [createNutritionRecord] = useCreateNutritionRecordMutation();
  const [updateNutritionRecord] = useUpdateNutritionRecordMutation();
  const [uploadPhoto] = useUploadPhotoMutation();

  const form = useForm({
    resolver: zodResolver(simplifiedNutritionSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      mealType: initialData?.mealType || '午餐',
      foods: initialData?.foods || [],
      notes: initialData?.notes || '',
      photoUrl: initialData?.photoUrl || '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
  } = form;

  // 當 initialData 變化時重置表單
  useEffect(() => {
    if (initialData) {
      reset({
        date: initialData.date || new Date().toISOString().split('T')[0],
        mealType: initialData.mealType || '午餐',
        foods: initialData.foods || [],
        notes: initialData.notes || '',
        photoUrl: initialData.photoUrl || '',
      });
      // 如果有圖片 URL，也要設置預覽
      if (initialData.photoUrl) {
        setUploadedPhoto(initialData.photoUrl);
      }
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'foods',
  });

  const handlePhotoPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: z.infer<typeof simplifiedNutritionSchema>) => {
    setIsSubmitting(true);
    try {
      // 準備API所需的數據格式 - 根據新的schema格式
      const recordData = {
        date: data.date,
        mealType: data.mealType,
        foods: data.foods.map(food => ({
          foodName: food.foodName,
          description: food.description || '',
          calories: food.calories || 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        })),
        notes: data.notes,
      };

      let newRecord;
      const photoFile = fileInputRef.current?.files?.[0];

      // 創建或更新記錄
      try {
        if (recordId) {
          // 更新現有記錄
          newRecord = await updateNutritionRecord({ id: recordId, data: recordData }).unwrap();
        } else {
          // 創建新記錄
          newRecord = await createNutritionRecord(recordData).unwrap();
        }
        
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
        
        onSuccess?.(newRecord);
      } catch (apiError) {
        console.warn('API不可用，保存到本地存儲:', apiError);
        
        // 本地存儲 fallback
        const existingRecords = localStorage.getItem('nutrition-records');
        const records = existingRecords ? JSON.parse(existingRecords) : [];
        
        if (recordId) {
          // 更新現有記錄
          const recordIndex = records.findIndex((r: { _id: string }) => r._id === recordId);
          if (recordIndex !== -1) {
            const updatedRecord = {
              ...records[recordIndex],
              date: data.date,
              mealType: data.mealType,
              foods: data.foods.map(food => ({
                foodId: '',
                foodName: food.foodName,
                quantity: 1,
                calories: food.calories || 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                fiber: 0,
                description: food.description || '',
              })),
              notes: data.notes,
              totalCalories: data.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
              totalProtein: 0,
              totalCarbohydrates: 0,
              totalFat: 0,
              totalFiber: 0,
              totalSugar: 0,
              totalSodium: 0,
              photoUrl: uploadedPhoto || records[recordIndex].photoUrl,
              updatedAt: new Date().toISOString(),
            };
            records[recordIndex] = updatedRecord;
            localStorage.setItem('nutrition-records', JSON.stringify(records));
            onSuccess?.(updatedRecord);
          }
        } else {
          // 創建新記錄
          const localRecord = {
            _id: Date.now().toString(),
            userId: 'local-user',
            date: data.date,
            mealType: data.mealType,
            foods: data.foods.map(food => ({
              foodId: '',
              foodName: food.foodName,
              quantity: 1,
              calories: food.calories || 0,
              protein: 0,
              carbohydrates: 0,
              fat: 0,
              fiber: 0,
              description: food.description || '',
            })),
            notes: data.notes,
            totalCalories: data.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
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
          records.push(localRecord);
          localStorage.setItem('nutrition-records', JSON.stringify(records));
          onSuccess?.(localRecord);
        }
      }
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFoodItem = () => {
    append({ foodName: '', description: '', calories: 0 });
  };

  const removeFoodItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">簡易飲食記錄</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 餐次選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">餐次</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mealTypeOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  {...register('mealType')}
                  className="sr-only"
                />
                <div className={`
                  border-2 rounded-xl p-4 text-center transition-all duration-200
                  ${watch('mealType') === option.value 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.mealType && (
            <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
          )}
        </div>

        {/* 日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">記錄日期</label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* 簡化的食物輸入 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">吃了什麼？</label>
            <button
              type="button"
              onClick={addFoodItem}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新增食物
            </button>
          </div>

          <div className="space-y-4">
            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">🍽️</div>
                <p>還沒有添加食物</p>
                <p className="text-sm">可以先上傳照片和心得，稍後再補充食物詳情</p>
              </div>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* 食物名稱 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`食物 ${index + 1}（如：白米飯）`}
                      {...register(`foods.${index}.foodName`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    {errors.foods?.[index]?.foodName && (
                      <p className="mt-1 text-sm text-red-600">{errors.foods[index]?.foodName?.message}</p>
                    )}
                  </div>

                  {/* 描述 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="份量描述（如：一碗）"
                      {...register(`foods.${index}.description`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* 預估卡路里 */}
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="卡路里"
                      {...register(`foods.${index}.calories`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* 刪除按鈕 */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFoodItem(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 圖片上傳 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">餐點照片（選填）</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v1z" />
              </svg>
              選擇照片
            </button>
          </div>

          {uploadedPhoto && (
            <div className="mt-4 text-center">
              <Image
                {...getSafeImageProps(uploadedPhoto)}
                alt="餐點照片預覽"
                width={200}
                height={150}
                className="object-cover rounded-lg mx-auto"
              />
            </div>
          )}
        </div>

        {/* 備註 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">心得備註（選填）</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="今天的餐點心得，味道如何..."
          />
        </div>

        {/* 提交按鈕 */}
        <div className="flex gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          )}
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
  );
}