'use client'

import { useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useGetFoodsQuery,
  useGetFoodCategoriesQuery,
  useCreateNutritionRecordWithPhotoMutation,
  useCreateNutritionRecordMutation,
} from '@/store/api/healthApi'
import { useAppDispatch } from '@/store/hooks'
import { addNotification } from '@/store/slices/uiSlice'
import type { NutritionRecord, CreateNutritionRecord } from '@/types'

const nutritionSchema = z.object({
  mealType: z.enum(['早餐', '午餐', '晚餐', '點心']),
  date: z.string(),
  foods: z.array(z.object({
    foodId: z.string().min(1, '請選擇食物'),
    quantity: z.number().min(0.1, '份量必須大於 0'),
  })).min(1, '請至少選擇一種食物'),
  notes: z.string().optional(),
})

type NutritionFormData = z.infer<typeof nutritionSchema>

interface NutritionFormProps {
  onSuccess?: (record: NutritionRecord) => void
  onCancel?: () => void
  initialData?: Partial<NutritionFormData>
}

const mealTypeOptions = [
  { value: '早餐', label: '早餐', icon: '🌅' },
  { value: '午餐', label: '午餐', icon: '☀️' },
  { value: '晚餐', label: '晚餐', icon: '🌙' },
  { value: '點心', label: '點心', icon: '🍎' },
] as const

export default function NutritionForm({ onSuccess, onCancel, initialData }: NutritionFormProps) {
  const dispatch = useAppDispatch()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // RTK Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useGetFoodCategoriesQuery()
  const { data: foods = [], isLoading: foodsLoading } = useGetFoodsQuery({
    category: selectedCategory || undefined,
    isActive: true,
  })
  
  const [createRecord, { isLoading: isCreating }] = useCreateNutritionRecordMutation()
  const [createRecordWithPhoto, { isLoading: isCreatingWithPhoto }] = useCreateNutritionRecordWithPhotoMutation()

  const isSubmitting = isCreating || isCreatingWithPhoto

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mealType: '午餐',
      foods: [{ foodId: '', quantity: 1 }],
      notes: '',
      ...initialData,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'foods',
  })

  // 處理圖片預覽
  const handlePhotoPreview = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const localUrl = e.target?.result as string
      setUploadedPhoto(localUrl)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: NutritionFormData) => {
    try {
      const recordData: CreateNutritionRecord = {
        date: data.date,
        mealType: data.mealType,
        foods: data.foods,
        notes: data.notes,
      }

      let newRecord: NutritionRecord

      // 如果有上傳的圖片，使用 createWithPhoto API
      if (fileInputRef.current?.files?.[0]) {
        newRecord = await createRecordWithPhoto({
          data: recordData,
          photo: fileInputRef.current.files[0],
        }).unwrap()
      } else {
        newRecord = await createRecord(recordData).unwrap()
      }

      dispatch(addNotification({
        type: 'success',
        message: '✅ 飲食紀錄新增成功！',
      }))

      onSuccess?.(newRecord)
      reset()
      setUploadedPhoto('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('新增飲食紀錄失敗:', error)
      
      dispatch(addNotification({
        type: 'error',
        message: '❌ 新增失敗，請稍後再試',
      }))

      // 如果 API 不可用，可以考慮保存到本地存儲
      // 這裡可以添加本地存儲的邏輯
    }
  }

  const addFoodItem = () => {
    append({ foodId: '', quantity: 1 })
  }

  const removeFoodItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const getSelectedFood = (foodId: string) => {
    return foods.find(food => food._id === foodId)
  }

  const calculateTotalNutrition = () => {
    return fields.reduce((totals, field) => {
      const food = getSelectedFood(field.foodId)
      if (food) {
        const quantity = field.quantity || 0
        return {
          calories: totals.calories + (food.calories * quantity),
          protein: totals.protein + (food.protein * quantity),
          carbs: totals.carbs + (food.carbohydrates * quantity),
          fat: totals.fat + (food.fat * quantity),
        }
      }
      return totals
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const nutrition = calculateTotalNutrition()

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">新增飲食紀錄</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 日期和餐次選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              餐次
            </label>
            <select
              {...register('mealType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {mealTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            {errors.mealType && (
              <p className="mt-1 text-sm text-red-600">{errors.mealType.message}</p>
            )}
          </div>
        </div>

        {/* 食物分類篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            食物分類（可選篩選）
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={categoriesLoading}
          >
            <option value="">所有分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 食物清單 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              食物清單
            </label>
            <button
              type="button"
              onClick={addFoodItem}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + 新增食物
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <select
                    {...register(`foods.${index}.foodId`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={foodsLoading}
                  >
                    <option value="">選擇食物...</option>
                    {foods.map((food) => (
                      <option key={food._id} value={food._id}>
                        {food.name} ({food.calories} 卡/份)
                      </option>
                    ))}
                  </select>
                  {errors.foods?.[index]?.foodId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.foods[index]?.foodId?.message}
                    </p>
                  )}
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="份量"
                    {...register(`foods.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.foods?.[index]?.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.foods[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFoodItem(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.foods && (
            <p className="mt-1 text-sm text-red-600">{errors.foods.message}</p>
          )}
        </div>

        {/* 營養總計 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">營養總計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">熱量：</span>
              <span className="font-medium">{Math.round(nutrition.calories)} 卡</span>
            </div>
            <div>
              <span className="text-gray-600">蛋白質：</span>
              <span className="font-medium">{nutrition.protein.toFixed(1)} g</span>
            </div>
            <div>
              <span className="text-gray-600">碳水：</span>
              <span className="font-medium">{nutrition.carbs.toFixed(1)} g</span>
            </div>
            <div>
              <span className="text-gray-600">脂肪：</span>
              <span className="font-medium">{nutrition.fat.toFixed(1)} g</span>
            </div>
          </div>
        </div>

        {/* 照片上傳 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            照片（可選）
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handlePhotoPreview(file)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {uploadedPhoto && (
            <div className="mt-2">
              <img
                src={uploadedPhoto}
                alt="預覽圖片"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 備註 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備註（可選）
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="記錄一些備註..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 按鈕 */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '儲存中...' : '儲存記錄'}
          </button>
        </div>
      </form>
    </div>
  )
} 