/**
 * 全站狀態管理（React Context）
 * - 單一資料來源 AppData，任何變更都會自動寫回 LocalStorage。
 * - 提供通用的集合操作（新增／更新／刪除），讓各功能元件不需重複撰寫儲存邏輯。
 * - 若寫入失敗（例如瀏覽器封鎖儲存），會透過 storageError 提示使用者。
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData, CollectionKey } from '../types';
import { createEmptyData, loadData, saveData, STORAGE_KEY } from './storage';

type Item<K extends CollectionKey> = AppData[K][number];

interface StoreValue {
  data: AppData;
  /** 以函式更新整份資料（請回傳新物件，勿直接修改） */
  update: (fn: (prev: AppData) => AppData) => void;
  /** 新增或更新集合中的一筆（以 id 比對） */
  upsert: <K extends CollectionKey>(key: K, item: Item<K>) => void;
  /** 依 id 刪除集合中的一筆 */
  remove: (key: CollectionKey, id: string) => void;
  /** 以匯入資料整份取代 */
  replaceAll: (data: AppData) => void;
  /** 清除全部個人紀錄（保留外觀設定） */
  resetAll: () => void;
  storageError: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [storageError, setStorageError] = useState(false);
  const first = useRef(true);

  // 資料變動時寫回 LocalStorage（首次載入不重寫）
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStorageError(!saveData(data));
  }, [data]);

  // 多個分頁同時開啟時，同步其他分頁的變更
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(loadData());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (prev: AppData) => AppData) => setData((prev) => fn(prev)), []);

  const upsert = useCallback(<K extends CollectionKey>(key: K, item: Item<K>) => {
    setData((prev) => {
      const list = prev[key] as Item<K>[];
      const idx = list.findIndex((x) => x.id === item.id);
      const next = idx >= 0 ? list.map((x, i) => (i === idx ? item : x)) : [item, ...list];
      return { ...prev, [key]: next };
    });
  }, []);

  const remove = useCallback((key: CollectionKey, id: string) => {
    setData((prev) => ({ ...prev, [key]: (prev[key] as { id: string }[]).filter((x) => x.id !== id) }));
  }, []);

  const replaceAll = useCallback((next: AppData) => setData(next), []);

  const resetAll = useCallback(() => {
    setData((prev) => ({ ...createEmptyData(), settings: { ...prev.settings } }));
  }, []);

  const value = useMemo(
    () => ({ data, update, upsert, remove, replaceAll, resetAll, storageError }),
    [data, update, upsert, remove, replaceAll, resetAll, storageError],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore 必須在 AppStoreProvider 內使用');
  return ctx;
}
