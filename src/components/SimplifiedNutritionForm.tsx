'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { 
  useCreateNutritionRecordMutation, 
  useCreateDraftRecordMutation,
  useUpdateNutritionRecordMutation,
  useUploadPhotoMutation,
  useAnalyzePhotoMutation, // 引入新的 hook
  NutritionRecord,
  CreateNutritionRecord,
  UpdateNutritionRecord,
  FoodItem,
} from '@/lib/nutritionApi';
import { getSafeImageProps } from '@/lib/imageUtils';
import { compressImage } from '@/lib/imageCompress';
import IOSAlertModal from '@/components/ios/IOSAlertModal';
import LoadingModal from '@/components/ios/LoadingModal';

// 簡化的驗證 schema - 食物變成可選
const simplifiedNutritionSchema = z.object({
  mealType: z.enum(['早餐', '午餐', '晚餐', '點心']),
  date: z.string(),
  foods: z.array(z.object({
    foodName: z.string().min(1, '請輸入食物名稱'),
    description: z.string().optional(),
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbohydrates: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
  })).default([]), // 移除 optional，只保留 default
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

// type SimplifiedNutritionFormData = z.infer<typeof simplifiedNutritionSchema>;

interface SimplifiedNutritionFormProps {
  onSuccess?: (record: NutritionRecord) => void;
  onCancel?: () => void;
  initialData?: {
    date?: string;
    mealType?: '早餐' | '午餐' | '晚餐' | '點心';
    foods?: Array<{
      foodName: string;
      description?: string;
      calories?: number;
      protein?: number;
      carbohydrates?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 分析相關狀態
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // RTK Query mutations
  const [createNutritionRecord] = useCreateNutritionRecordMutation();
  const [createDraftRecord] = useCreateDraftRecordMutation();
  const [updateNutritionRecord] = useUpdateNutritionRecordMutation();
  const [uploadPhoto] = useUploadPhotoMutation();
  const [analyzePhoto] = useAnalyzePhotoMutation(); // 使用新的 mutation

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

  // 先初始化 field array，供後續 useEffect 使用
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'foods',
  });

  // 當 initialData 變化時重置表單並同步 foods 陣列
  useEffect(() => {
    if (initialData) {
      const resetData = {
        date: initialData.date || new Date().toISOString().split('T')[0],
        mealType: initialData.mealType || '午餐',
        foods: initialData.foods || [],
        notes: initialData.notes || '',
        photoUrl: initialData.photoUrl || '',
      };
      reset(resetData);
      replace(initialData.foods || []);
      if (initialData.photoUrl) {
        setUploadedPhoto(initialData.photoUrl);
      }
    }
  }, [initialData, reset, replace]);

  
  const [currentRecordId, setCurrentRecordId] = useState<string | undefined>(recordId);

  // 當 initialData 或 recordId prop 變化時，同步更新內部 state
  useEffect(() => {
    setCurrentRecordId(recordId);
  }, [recordId]);

  const handlePhotoPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- 新的核心流程 ---
  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    handlePhotoPreview(file);

    let tempRecordId = currentRecordId;

    try {
      // 步驟 1: 如果是新紀錄，先建立一個草稿紀錄以獲取 ID
      if (!tempRecordId) {
        const draftRecord = await createDraftRecord({
          date: form.getValues('date'),
          mealType: form.getValues('mealType'),
          foods: [], // 初始為空
          isDraft: true, // 明確標記為草稿
        }).unwrap();
        tempRecordId = draftRecord._id;
        setCurrentRecordId(tempRecordId);
      }

      // 步驟 2: 壓縮並上傳圖片
      const compressedFile = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
        mimeType: 'image/webp',
      });
      
      const uploadResult = await uploadPhoto({ id: tempRecordId, file: compressedFile }).unwrap();
      const { photoUrl } = uploadResult;
      
      setUploadedPhoto(photoUrl); // 更新預覽為遠端 URL
      form.setValue('photoUrl', photoUrl);

      // 步驟 3: 使用獲取到的 URL 進行 AI 分析
      const analysisResult = await analyzePhoto({ photoUrl }).unwrap();

      // 步驟 4: 使用分析結果更新紀錄
      if (analysisResult.foods && analysisResult.foods.length > 0) {
        const foodsToUpdate = analysisResult.foods.map(food => ({
          foodName: food.foodName || '',
          description: food.description || '',
          calories: food.calories || 0,
          protein: food.protein || 0,
          carbohydrates: food.carbohydrates || 0,
          fat: food.fat || 0,
          fiber: food.fiber || 0,
          sugar: food.sugar || 0,
          sodium: food.sodium || 0,
        }));
        
        replace(foodsToUpdate); // 更新 UI
        await updateNutritionRecord({ id: tempRecordId, data: { foods: foodsToUpdate } }).unwrap();
      } else {
        setAnalysisError('AI 未能從圖片中辨識出任何食物。');
      }

    } catch (error) {
      console.error('圖片處理與分析流程失敗:', error);
      setAnalysisError('處理失敗，請稍後再試或手動輸入。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof simplifiedNutritionSchema>) => {
    setIsSubmitting(true);
    try {
      // 正規化 foods 以符合 API 的必填數值欄位
      const normalizedFoods: FoodItem[] = (data.foods || []).map((f) => ({
        foodName: f.foodName,
        description: f.description ?? '',
        calories: f.calories ?? 0,
        protein: f.protein ?? 0,
        carbohydrates: f.carbohydrates ?? 0,
        fat: f.fat ?? 0,
        fiber: f.fiber ?? 0,
        sugar: f.sugar ?? 0,
        sodium: f.sodium ?? 0,
      }));

      let finalRecord;
      if (currentRecordId) {
        // 更新現有記錄 (可能是草稿或正式記錄)
        const updatePayload: UpdateNutritionRecord = {
          date: data.date,
          mealType: data.mealType,
          notes: data.notes,
          photoUrl: data.photoUrl,
          foods: normalizedFoods,
          isDraft: false, // 確保轉為正式記錄
        };
        finalRecord = await updateNutritionRecord({ id: currentRecordId, data: updatePayload }).unwrap();
        setShowSuccessModal(true);
      } else {
        // 僅在沒有上傳圖片的情況下，才透過此處建立新紀錄
        const createPayload: CreateNutritionRecord = {
          date: data.date,
          mealType: data.mealType,
          notes: data.notes,
          photoUrl: data.photoUrl,
          foods: normalizedFoods,
          isDraft: false, // 確保為正式記錄
        };
        finalRecord = await createNutritionRecord(createPayload).unwrap();
      }
      onSuccess?.(finalRecord);
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFoodItem = () => {
    append({ 
      foodName: '', 
      description: '', 
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
  };

  const removeFoodItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
      <LoadingModal open={isAnalyzing} message="AI 分析中，請稍候..." />
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
        {/* 餐次選擇 - 精簡顯示 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">餐次</label>
          <div className="flex gap-2">
            {mealTypeOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  {...register('mealType')}
                  className="sr-only"
                />
                <div className={`
                  border rounded-lg px-3 py-2 text-center transition-all duration-200 flex items-center gap-2
                  ${watch('mealType') === option.value 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.mealType && (
            <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
          )}
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

                </div>

                {/* 營養素欄位 - 分成兩列更清楚 */}
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-600 font-medium">營養成分（可選）</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">蛋白質 (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.protein`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">碳水化合物 (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.carbohydrates`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">脂肪 (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.fat`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">纖維 (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.fiber`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">糖分 (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.sugar`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">鈉 (mg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register(`foods.${index}.sodium`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
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
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v1z" />
              </svg>
              {uploadedPhoto ? '更換照片' : '選擇照片'}
            </button>
          </div>

          {analysisError && (
            <p className="mt-2 text-sm text-red-600 text-center">{analysisError}</p>
          )}

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

      {/* 成功提示 Modal */}
      <IOSAlertModal
        open={showSuccessModal}
        title="更新成功"
        message="飲食紀錄已成功更新！"
        confirmText="確定"
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />
    </div>
  );
}