'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SwipeRow from '@/components/SwipeRow';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { NutritionRecord } from '@/lib/api';
import { 
  useGetNutritionRecordsQuery, 
  useGetMarkedDatesQuery,
  useDeleteNutritionRecordMutation
} from '@/lib/nutritionApi';
import { getSafeImageProps } from '@/lib/imageUtils';
import IOSCalendar from '@/components/ios/IOSCalendar';
import IOSWeekStrip from '@/components/ios/IOSWeekStrip';
import Card from '@/components/Card';
import IOSAlertModal from '@/components/ios/IOSAlertModal';
import ImageModal from '@/components/ImageModal';

interface ImprovedNutritionListProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddNew: (date: string) => void;
  onEdit: (record: NutritionRecord) => void;
}

const mealTypeIcons = {
  '早餐': '🌅',
  '午餐': '☀️',
  '晚餐': '🌙',
  '點心': '🍎',
};

export default function ImprovedNutritionList({ selectedDate, onDateChange, onAddNew, onEdit }: ImprovedNutritionListProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '' });
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);


  // 月曆開啟時鎖定背景滾動
  useEffect(() => {
    if (!isCalendarOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isCalendarOpen]);

  const [currentMonth, setCurrentMonth] = useState({
    year: new Date(selectedDate).getFullYear(),
    month: new Date(selectedDate).getMonth() + 1,
  });

  // RTK Query hooks
  const { 
    data: records = [], 
    isLoading: loading, 
    refetch: refetchRecords 
  } = useGetNutritionRecordsQuery({ date: selectedDate });

  const { 
    data: markedDates = [] 
  } = useGetMarkedDatesQuery(currentMonth);

  const [deleteNutritionRecord] = useDeleteNutritionRecordMutation();

  // 監聽選中日期變化，更新當前月份
  useEffect(() => {
    const newYear = new Date(selectedDate).getFullYear();
    const newMonth = new Date(selectedDate).getMonth() + 1;
    if (newYear !== currentMonth.year || newMonth !== currentMonth.month) {
      setCurrentMonth({ year: newYear, month: newMonth });
    }
  }, [selectedDate, currentMonth]);

  const handleDeleteConfirmation = (recordId: string) => {
    setRecordToDelete(recordId);
    setAlertInfo({ title: '確認刪除', message: '確定要刪除這筆記錄嗎？' });
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      await deleteNutritionRecord(recordToDelete).unwrap();
      refetchRecords();
      setAlertInfo({ title: '成功', message: '記錄已刪除' });
    } catch (error) {
      console.error('刪除失敗:', error);
      setAlertInfo({ title: '失敗', message: '刪除失敗，請稍後再試' });
    } finally {
      setRecordToDelete(null);
      setIsAlertOpen(true);
    }
  };

  const getDailyTotals = () => {
    return records.reduce(
      (totals, record) => ({
        totalCalories: totals.totalCalories + (record.totalCalories || 0),
        totalProtein: totals.totalProtein + (record.totalProtein || 0),
        totalCarbohydrates: totals.totalCarbohydrates + (record.totalCarbohydrates || 0),
        totalFat: totals.totalFat + (record.totalFat || 0),
        totalFiber: totals.totalFiber + (record.totalFiber || 0),
        totalSugar: totals.totalSugar + (record.totalSugar || 0),
        totalSodium: totals.totalSodium + (record.totalSodium || 0),
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0 },
    );
  };

  const formatRecordTime = (record: NutritionRecord) => {
    const iso = record.createdAt || record.date;
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    // 固定為 HH:mm，避免多語系造成的換行或 hydration 差異
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.getFullYear() === date.getFullYear() &&
           today.getMonth() === date.getMonth() &&
           today.getDate() === date.getDate();
  };

  // 格式化數字，避免過長的小數位
  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    
    // 處理浮點數精度問題
    const rounded = Math.round(num * 100) / 100;
    
    // 如果是整數，直接返回
    if (rounded % 1 === 0) return rounded.toString();
    
    // 如果小數位過多（超過2位），四捨五入到1位
    const str = rounded.toString();
    if (str.includes('.') && str.split('.')[1].length > 2) {
      return rounded.toFixed(1);
    }
    
    return rounded.toString();
  };

  const summaryLabel = isToday(selectedDate) ? '今日' : '總計';

  // 小型模糊占位圖（16:9 灰色漸層）
  const BLUR_DATA_URL = 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5e7eb" offset="0"/><stop stop-color="#f3f4f6" offset="1"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  // 頁面渲染前先計算 totals，避免多次呼叫與未定義錯誤
  const totals = getDailyTotals();

  // 以時間排序：最新在最上面
  const sortedRecords = [...records].sort((a, b) => {
    const ta = new Date(a.createdAt || a.updatedAt || a.date).getTime();
    const tb = new Date(b.createdAt || b.updatedAt || b.date).getTime();
    return tb - ta;
  });

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 標題 */}
      <div className="h-2" />
      
      {/* 日期選擇器和統計 */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-full max-w-2xl grid grid-cols-3 items-center">
            <div className="flex items-center gap-2 justify-start">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="開啟日曆"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="回到今天"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/><path d="M12 12v4h4"/></svg>
              </button>
            </div>
            <div className="flex items-center justify-center text-xl font-bold text-gray-900">
              {isToday(selectedDate) && <span className="mr-2">今天</span>}
              <span>{new Date(selectedDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onAddNew(selectedDate)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                aria-label="新增"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full max-w-2xl">
            <IOSWeekStrip selectedDate={selectedDate} onChange={onDateChange} />
          </div>
          <div className="w-full max-w-2xl">
            <Card className="p-3 sm:p-1">
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex items-stretch gap-1.5 sm:gap-0 sm:grid sm:grid-cols-7 sm:divide-x sm:divide-gray-100">
                  <div className="min-w-[70px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">攝取 / {summaryLabel}</div>
                    <div className="text-xl font-semibold text-emerald-600 leading-none">{formatNumber(totals.totalCalories)}</div>
                    <div className="text-[10px] text-gray-400">卡路里</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalProtein)}</div>
                    <div className="text-[10px] text-gray-500">蛋白質</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalCarbohydrates)}</div>
                    <div className="text-[10px] text-gray-500">碳水</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalFat)}</div>
                    <div className="text-[10px] text-gray-500">脂肪</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalFiber)}</div>
                    <div className="text-[10px] text-gray-500">纖維</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalSugar)}</div>
                    <div className="text-[10px] text-gray-500">糖分</div>
                  </div>
                  <div className="min-w-[60px] sm:min-w-0 text-center px-1 py-1 rounded-lg sm:rounded-none bg-white sm:bg-transparent border border-gray-100 sm:border-0">
                    <div className="text-[10px] text-gray-500">{summaryLabel}</div>
                    <div className="text-base font-semibold text-gray-900 leading-none">{formatNumber(totals.totalSodium)}</div>
                    <div className="text-[10px] text-gray-500">鈉</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有記錄</h3>
            <p className="text-gray-600 mb-6">點擊上方按鈕開始記錄你的飲食吧！</p>
          </div>
        ) : (
          sortedRecords.map((record) => {
            const completeRecord = {
              ...record,
              foods: record.foods.map(food => ({
                ...food,
                protein: food.protein || 0,
                carbohydrates: food.carbohydrates || 0,
                fat: food.fat || 0,
                fiber: food.fiber || 0,
                sugar: food.sugar || 0,
                sodium: food.sodium || 0,
              }))
            };

            return (
            <SwipeRow
              key={record._id}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
              onDelete={() => handleDeleteConfirmation(record._id)}
              onEdit={() => onEdit(completeRecord)}
            >
            <div className="bg-white rounded-xl p-4 max-w-full overflow-hidden">
              {/* 頂部資訊列 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <span className="text-2xl">{mealTypeIcons[record.mealType as keyof typeof mealTypeIcons]}</span>
                  <div className="flex items-baseline gap-2 min-w-0 truncate">
                    <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">{record.mealType}</span>
                    <span className="text-sm text-gray-600 whitespace-nowrap">• {formatRecordTime(record)}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium">
                    {formatNumber(record.totalCalories || 0)} 卡
                  </span>
                </div>
              </div>

              {/* 營養素重點（可選） */}
              <div className="mb-3 flex flex-wrap gap-2">
                {!!record.totalProtein && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-[11px]">
                    蛋白 {formatNumber(record.totalProtein)}g
                  </span>
                )}
                {!!record.totalCarbohydrates && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px]">
                    碳水 {formatNumber(record.totalCarbohydrates)}g
                  </span>
                )}
                {!!record.totalFat && (
                  <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-[11px]">
                    脂肪 {formatNumber(record.totalFat)}g
                  </span>
                )}
              </div>

              {/* 食物列表 */}
              {record.foods && record.foods.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {record.foods.map((food, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-2.5 py-1 text-[12px]">
                      <span className="truncate max-w-[10rem]">{food.foodName}</span>
                      <span className="ml-1 text-gray-500">{formatNumber(food.calories || 0)}卡</span>
                    </span>
                  ))}
                </div>
              )}

              {/* 圖片 - 可滑動多圖 (相容舊版) */}
              {(() => {
                const urls = (record.photoUrls && record.photoUrls.length > 0)
                  ? record.photoUrls
                  : (record.photoUrl ? [record.photoUrl] : []);

                if (urls.length === 0) return null;

                // If more than one image, render the slider
                if (urls.length > 1) {
                  return (
                    <div className="-mx-4 mb-4 relative" data-swipe-ignore>
                      <Swiper
                        modules={[Pagination]}
                        spaceBetween={10}
                        slidesPerView={1.2}
                        centeredSlides={true}
                        pagination={{ clickable: true }}
                        className="!pb-8"
                      >
                        {urls.map((url, index) => (
                          <SwiperSlide 
                            key={index} 
                            onClick={() => {
                              setSelectedImageUrl(url);
                              setIsImageModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="relative w-full overflow-hidden rounded-lg shadow-md">
                              <div className="relative w-full pt-[56.25%]">
                                <Image
                                  {...getSafeImageProps(url)}
                                  alt={`餐點照片 ${index + 1}`}
                                  fill
                                  // 第一張圖優先載入，降低偶發未載入的機率
                                  priority={index === 0}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  placeholder="blur"
                                  blurDataURL={BLUR_DATA_URL}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  );
                }

                // If only one image, render a single image
                return (
                  <div className="mb-4">
                    <div 
                      className="relative w-full cursor-pointer overflow-hidden rounded-lg shadow-md"
                      onClick={() => {
                        setSelectedImageUrl(urls[0]);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <div className="relative w-full pt-[56.25%]">
                        <Image
                          {...getSafeImageProps(urls[0])}
                          alt={`餐點照片 1`}
                          fill
                          priority
                          loading="eager"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Price */}
              {record.price && record.price > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">花費金額</span>
                    <span className="text-lg font-semibold text-blue-600">${formatNumber(record.price)}</span>
                  </div>
                </div>
              )}

              {/* 備註 */}
              {record.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </div>
            </SwipeRow>
          );
          })
        )}
      </div>

      {/* 月曆彈窗（僅切換日期） */}
      {isCalendarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <IOSCalendar
              selectedDate={selectedDate}
              markedDates={markedDates}
              onChange={(d) => {
                onDateChange(d);
                setIsCalendarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <IOSAlertModal
        open={isAlertOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        confirmText="確定"
        onConfirm={() => {
          if (recordToDelete) {
            handleDelete();
          } else {
            setIsAlertOpen(false);
          }
        }}
        onCancel={() => {
          setRecordToDelete(null);
          setIsAlertOpen(false);
        }}
        
      />

      <ImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImageUrl}
      />
    </div>
  );
}
