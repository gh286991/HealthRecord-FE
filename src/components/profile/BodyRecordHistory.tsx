
'use client';

import { useGetBodyRecordsQuery, useDeleteBodyRecordMutation } from '@/lib/authApi';
import { BodyRecord } from '@/types/body-record';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { useState, useMemo } from 'react';
import IOSAlert from '@/components/IOSAlert';

const ITEMS_PER_PAGE = 5;

export default function BodyRecordHistory() {
  const { data: records, isLoading, isError } = useGetBodyRecordsQuery();
  const [deleteBodyRecord] = useDeleteBodyRecordMutation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'default' | 'success' | 'error'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const totalPages = useMemo(() => {
    if (!records) return 0;
    return Math.ceil(records.length / ITEMS_PER_PAGE);
  }, [records]);

  const paginatedRecords = useMemo(() => {
    if (!records) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return records.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBodyRecord(id).unwrap();
      setToastVariant('success');
      setToastMsg('刪除成功');
      setToastOpen(true);
    } catch {
      setToastVariant('error');
      setToastMsg('刪除失敗');
      setToastOpen(true);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setRecordToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      handleDelete(recordToDelete);
      setRecordToDelete(null);
    }
    setIsAlertOpen(false);
  };

  if (isLoading) return <div>載入中...</div>;
  if (isError) return <div>讀取錯誤</div>;

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-black">歷史記錄</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">日期</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">體重 (kg)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">體脂率 (%)</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">刪除</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRecords.map((record: BodyRecord) => (
              <tr key={record._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.bodyFat ?? 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-red-500" onClick={() => openDeleteConfirm(record._id)}>
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!records || records.length === 0) && <p className="text-center text-black py-4">沒有記錄</p>}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>上一頁</Button>
            <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>下一頁</Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-black">
                顯示第 <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, records?.length || 0)}</span> 筆，共 <span className="font-medium">{records?.length || 0}</span> 筆
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  上一頁
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-black ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  下一頁
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      <IOSAlert 
        isOpen={isAlertOpen} 
        title="確認刪除"
        message="您確定要刪除這筆記錄嗎？此操作無法復原。"
        onConfirm={confirmDelete}
        onCancel={() => setIsAlertOpen(false)}
        confirmButtonText="刪除"
        cancelButtonText="取消"
      />
    </div>
  );
}
