'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { nutritionApi, foodApi, CreateNutritionRecord, NutritionRecord, Food } from '@/lib/api';
import { compressImage } from '@/lib/imageCompress';

const nutritionSchema = z.object({
  mealType: z.enum(['早餐', '午餐', '晚餐', '點心']),
  date: z.string(),
  foods: z.array(z.object({
    foodId: z.string().min(1, '請選擇食物'),
    quantity: z.number().min(0.1, '份量必須大於 0'),
  })).min(1, '請至少選擇一種食物'),
  notes: z.string().optional(),
});

type NutritionFormData = z.infer<typeof nutritionSchema>;

interface NutritionFormProps {
  onSuccess?: (record: NutritionRecord) => void;
  onCancel?: () => void;
  initialData?: Partial<NutritionFormData>;
}

const mealTypeOptions = [
  { value: '早餐', label: '早餐', icon: '🌅' },
  { value: '午餐', label: '午餐', icon: '☀️' },
  { value: '晚餐', label: '晚餐', icon: '🌙' },
  { value: '點心', label: '點心', icon: '🍎' },
];

export default function NutritionForm({ onSuccess, onCancel, initialData }: NutritionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mealType: '午餐',
      foods: [{ foodId: '', quantity: 1 }],
      notes: '',
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'foods',
  });

  const fetchFoods = useCallback(async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory, isActive: true } : { isActive: true };
      const foodList = await foodApi.getAll(params);
      setFoods(foodList);
    } catch (error) {
      console.error('獲取食物列表失敗:', error);
    }
  }, [selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoryList = await foodApi.getCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('獲取食物分類失敗:', error);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, [fetchFoods, fetchCategories]);

  // 處理圖片預覽
  const handlePhotoPreview = (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const localUrl = e.target?.result as string;
        setUploadedPhoto(localUrl);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('圖片預覽失敗:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: NutritionFormData) => {
    setIsSubmitting(true);
    try {
      const recordData: CreateNutritionRecord = {
        date: data.date,
        mealType: data.mealType,
        foods: data.foods,
        notes: data.notes,
      };

      let newRecord;
      
      // 如果有上傳的圖片，壓縮成 JPEG 後使用 createWithPhoto API
      if (fileInputRef.current?.files?.[0]) {
        try {
          let photoFile = fileInputRef.current.files[0];
          try {
            photoFile = await compressImage(photoFile, {
              maxWidth: 1600,
              maxHeight: 1600,
              quality: 0.8,
              mimeType: 'image/webp',
              maxBytes: 1.5 * 1024 * 1024,
            });
          } catch {
            console.warn('圖片壓縮失敗，改用原圖上傳');
          }
          newRecord = await nutritionApi.createWithPhoto(recordData, photoFile);
        } catch (photoError) {
          console.error('使用圖片創建記錄失敗，嘗試無圖片創建:', photoError);
          newRecord = await nutritionApi.create(recordData);
        }
      } else {
        newRecord = await nutritionApi.create(recordData);
      }

      onSuccess?.(newRecord);
      alert('飲食紀錄新增成功！');
    } catch (error) {
      console.error('新增飲食紀錄失敗:', error);
      
      // 如果 API 不可用，保存到本地存儲
      try {
        // 處理圖片（如果有）
        let photoUrl = '';
        if (fileInputRef.current?.files?.[0] && uploadedPhoto) {
          photoUrl = uploadedPhoto;  // 使用預覽的圖片 URL
        }
        
        const localRecord: NutritionRecord = {
          _id: Date.now().toString(),
          userId: 'local-user',
          date: data.date,
          mealType: data.mealType,
          foods: data.foods.map(food => {
            const selectedFood = getSelectedFood(food.foodId);
            return {
              foodId: food.foodId,
              foodName: selectedFood?.name || '未知食物',
              quantity: food.quantity,
              calories: selectedFood ? selectedFood.calories * food.quantity : 0,
              protein: selectedFood ? selectedFood.protein * food.quantity : 0,
              carbohydrates: selectedFood ? selectedFood.carbohydrates * food.quantity : 0,
              fat: selectedFood ? selectedFood.fat * food.quantity : 0,
              fiber: selectedFood ? (selectedFood.fiber || 0) * food.quantity : 0,
            };
          }),
          notes: data.notes,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          totalSugar: 0,
          totalSodium: 0,
          photoUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 計算總營養
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbohydrates = 0;
        let totalFat = 0;
        let totalFiber = 0;

        localRecord.foods.forEach(food => {
          totalCalories += food.calories;
          totalProtein += food.protein;
          totalCarbohydrates += food.carbohydrates;
          totalFat += food.fat;
          totalFiber += food.fiber || 0;
        });

        localRecord.totalCalories = Math.round(totalCalories);
        localRecord.totalProtein = Math.round(totalProtein * 10) / 10;
        localRecord.totalCarbohydrates = Math.round(totalCarbohydrates * 10) / 10;
        localRecord.totalFat = Math.round(totalFat * 10) / 10;
        localRecord.totalFiber = Math.round(totalFiber * 10) / 10;

        const existingRecords = localStorage.getItem('nutrition-records');
        const records = existingRecords ? JSON.parse(existingRecords) : [];
        records.push(localRecord);
        localStorage.setItem('nutrition-records', JSON.stringify(records));
        
        onSuccess?.(localRecord);
        alert('📱 API 暫不可用，飲食紀錄已保存到本地！');
      } catch (localError) {
        console.error('本地存儲失敗:', localError);
        alert('新增失敗，請稍後再試');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFoodItem = () => {
    append({ foodId: '', quantity: 1 });
  };

  const removeFoodItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getSelectedFood = (foodId: string): Food | undefined => {
    return foods.find(food => food._id === foodId);
  };

  const calculateTotalNutrition = () => {
    const watchedFoods = watch('foods');
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    watchedFoods.forEach(item => {
      const food = getSelectedFood(item.foodId);
      if (food && item.quantity) {
        totalCalories += food.calories * item.quantity;
        totalProtein += food.protein * item.quantity;
        totalCarbs += food.carbohydrates * item.quantity;
        totalFat += food.fat * item.quantity;
      }
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const nutrition = calculateTotalNutrition();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">新增飲食紀錄</h2>
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
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        {/* 食物分類篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">食物分類（篩選）</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          >
            <option value="">全部分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* 食物選擇 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">選擇食物</label>
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
            {fields.map((field, index) => {
              const selectedFood = getSelectedFood(watch(`foods.${index}.foodId`));
              return (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        食物 {index + 1}
                      </label>
                      <select
                        {...register(`foods.${index}.foodId`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">請選擇食物</option>
                        {foods.map((food) => (
                          <option key={food._id} value={food._id}>
                            {food.name} ({food.servingSize})
                          </option>
                        ))}
                      </select>
                      {errors.foods?.[index]?.foodId && (
                        <p className="mt-1 text-sm text-red-600">{errors.foods[index]?.foodId?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">份數</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.1"
                          {...register(`foods.${index}.quantity`, { valueAsNumber: true })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFoodItem(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {errors.foods?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.foods[index]?.quantity?.message}</p>
                      )}
                    </div>
                  </div>

                  {/* 食物營養資訊預覽 */}
                  {selectedFood && watch(`foods.${index}.quantity`) && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-2">營養資訊預覽：</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-green-600">
                            {(selectedFood.calories * watch(`foods.${index}.quantity`)).toFixed(0)}
                          </span>
                          <div className="text-gray-500">卡路里</div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-600">
                            {(selectedFood.protein * watch(`foods.${index}.quantity`)).toFixed(1)}g
                          </span>
                          <div className="text-gray-500">蛋白質</div>
                        </div>
                        <div>
                          <span className="font-medium text-orange-600">
                            {(selectedFood.carbohydrates * watch(`foods.${index}.quantity`)).toFixed(1)}g
                          </span>
                          <div className="text-gray-500">碳水</div>
                        </div>
                        <div>
                          <span className="font-medium text-purple-600">
                            {(selectedFood.fat * watch(`foods.${index}.quantity`)).toFixed(1)}g
                          </span>
                          <div className="text-gray-500">脂肪</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors.foods && (
            <p className="mt-1 text-sm text-red-600">{errors.foods.message}</p>
          )}
        </div>

        {/* 總計營養資訊 */}
        {nutrition.totalCalories > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">營養總計</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{nutrition.totalCalories.toFixed(0)}</div>
                <div className="text-sm text-gray-600">卡路里</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{nutrition.totalProtein.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">蛋白質</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{nutrition.totalCarbs.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">碳水化合物</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{nutrition.totalFat.toFixed(1)}g</div>
                <div className="text-sm text-gray-600">脂肪</div>
              </div>
            </div>
          </div>
        )}

        {/* 圖片上傳 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">餐點照片</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png"
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
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  上傳中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  選擇照片
                </>
              )}
            </button>
            <p className="mt-2 text-sm text-gray-500">支援 JPG、PNG 格式</p>
          </div>

          {uploadedPhoto && (
            <div className="mt-4">
              <Image
                src={uploadedPhoto}
                alt="餐點照片預覽"
                width={128}
                height={128}
                className="object-cover rounded-lg mx-auto"
              />
            </div>
          )}
        </div>

        {/* 備註 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">備註</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="記錄心得、口感或其他想法..."
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
            {isSubmitting ? '新增中...' : '新增紀錄'}
          </button>
        </div>
      </form>
    </div>
  );
} 