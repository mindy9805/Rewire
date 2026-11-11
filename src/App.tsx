/**
 * 路由與全域 Provider
 * 使用 HashRouter（網址形如 /#/learn/ch1），GitHub Pages 不需額外設定即可支援重新整理與深層連結。
 * 首頁與 404 直接載入；其他頁面按需載入（React.lazy），第一次打開網站只下載首頁需要的程式，
 * 圖表函式庫也只在用到圖表的頁面才下載。
 */
import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/Confirm';
import Layout from './components/layout/Layout';
import ThemeSync from './components/layout/ThemeSync';
import Overview from './pages/Overview';
import NotFound from './pages/NotFound';

// 按需載入的頁面
/** 各頁面的載入函式：路由按需載入，首頁顯示後也會在背景預先下載（讓離線時也能開啟） */
const loaders = {
  Learn: () => import('./pages/Learn'),
  ChapterPage: () => import('./pages/ChapterPage'),
  BrainLab: () => import('./pages/BrainLab'),
  Challenge: () => import('./pages/Challenge'),
  Journal: () => import('./pages/Journal'),
  Dashboard: () => import('./pages/Dashboard'),
  References: () => import('./pages/References'),
  DataPage: () => import('./pages/DataPage'),
  Daily: () => import('./pages/Daily'),
  PatternHub: () => import('./pages/PatternHub'),
  PatternHabitPage: () => import('./pages/PatternHabitPage'),
  PatternAssessment: () => import('./pages/PatternAssessment'),
  PatternWorkshop: () => import('./pages/PatternWorkshop'),
  Habits7Hub: () => import('./pages/Habits7Hub'),
  Habits7Page: () => import('./pages/Habits7Page'),
  Habits7Plan: () => import('./pages/Habits7Plan'),
  Play: () => import('./pages/Play'),
  ReadingMode: () => import('./components/daily/ReadingMode'),
  Plans: () => import('./pages/Plans'),
  Learning: () => import('./pages/Learning'),
  Me: () => import('./pages/Me'),
  Records: () => import('./pages/Records'),
};
const Learn = lazy(loaders.Learn);
const ChapterPage = lazy(loaders.ChapterPage);
const BrainLab = lazy(loaders.BrainLab);
const Challenge = lazy(loaders.Challenge);
const Journal = lazy(loaders.Journal);
const Dashboard = lazy(loaders.Dashboard);
const References = lazy(loaders.References);
const DataPage = lazy(loaders.DataPage);
const Daily = lazy(loaders.Daily);
const PatternHub = lazy(loaders.PatternHub);
const PatternHabitPage = lazy(loaders.PatternHabitPage);
const PatternAssessment = lazy(loaders.PatternAssessment);
const PatternWorkshop = lazy(loaders.PatternWorkshop);
const Habits7Hub = lazy(loaders.Habits7Hub);
const Habits7Page = lazy(loaders.Habits7Page);
const Habits7Plan = lazy(loaders.Habits7Plan);
const Play = lazy(loaders.Play);
const ReadingMode = lazy(loaders.ReadingMode);
const Plans = lazy(loaders.Plans);
const Learning = lazy(loaders.Learning);
const Me = lazy(loaders.Me);
const Records = lazy(loaders.Records);

/**
 * 背景預先下載其他頁面：首頁顯示約 3 秒後、瀏覽器空閒時才開始，不影響第一次開啟的速度；
 * 下載後由 Service Worker 快取，離線時也能打開所有頁面。開啟「省流量」時略過。
 */
function usePrefetchPages() {
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    const idle = (cb: () => void) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb) : setTimeout(cb, 1));
    const t = window.setTimeout(() => idle(() => Object.values(loaders).forEach((load) => load().catch(() => undefined))), 3000);
    return () => window.clearTimeout(t);
  }, []);
}

/** 頁面載入中的提示（通常只會閃過一下） */
export function PageLoading() {
  return <p className="py-16 text-center text-sm text-muted" role="status">載入中…</p>;
}

export default function App() {
  usePrefetchPages();
  return (
    <AppStoreProvider>
      <ToastProvider>
        <ConfirmProvider>
          <ThemeSync />
          <HashRouter>
            <Routes>
              {/* 沉浸式朗讀模式：不顯示導覽列 */}
              <Route path="/daily/read" element={<Suspense fallback={<PageLoading />}><ReadingMode /></Suspense>} />
              <Route element={<Layout />}>
                <Route index element={<Overview />} />
                <Route path="learn" element={<Learn />} />
                <Route path="learn/:chapterId" element={<ChapterPage />} />
                <Route path="lab" element={<BrainLab />} />
                <Route path="lab/:toolId" element={<BrainLab />} />
                <Route path="challenge" element={<Challenge />} />
                <Route path="plans" element={<Plans />} />
                <Route path="learning" element={<Learning />} />
                <Route path="me" element={<Me />} />
                <Route path="records" element={<Records />} />
                <Route path="daily" element={<Daily />} />
                {/* Break the Pattern｜打破慣性（舊網址 /habits 自動轉址） */}
                <Route path="pattern" element={<PatternHub />} />
                <Route path="pattern/assessment" element={<PatternAssessment />} />
                <Route path="pattern/workshop" element={<PatternWorkshop />} />
                <Route path="pattern/:habitId" element={<PatternHabitPage />} />
                <Route path="habits" element={<Navigate to="/pattern" replace />} />
                {/* Playful Growth｜輕鬆探索 */}
                <Route path="play" element={<Play />} />
                <Route path="play/:game" element={<Play />} />
                {/* 7 Habits｜高效能生活實踐 */}
                <Route path="habits7" element={<Habits7Hub />} />
                <Route path="habits7/plan" element={<Habits7Plan />} />
                <Route path="habits7/:habitId" element={<Habits7Page />} />
                <Route path="journal" element={<Journal />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="references" element={<References />} />
                <Route path="data" element={<DataPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </HashRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AppStoreProvider>
  );
}
