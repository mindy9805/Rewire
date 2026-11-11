/**
 * 路由與全域 Provider
 * 使用 HashRouter（網址形如 /#/learn/ch1），GitHub Pages 不需額外設定即可支援重新整理與深層連結。
 */
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/Confirm';
import Layout from './components/layout/Layout';
import ThemeSync from './components/layout/ThemeSync';
import Overview from './pages/Overview';
import Learn from './pages/Learn';
import ChapterPage from './pages/ChapterPage';
import BrainLab from './pages/BrainLab';
import Challenge from './pages/Challenge';
import Journal from './pages/Journal';
import Dashboard from './pages/Dashboard';
import References from './pages/References';
import DataPage from './pages/DataPage';
import Daily from './pages/Daily';
import PatternHub from './pages/PatternHub';
import PatternHabitPage from './pages/PatternHabitPage';
import PatternAssessment from './pages/PatternAssessment';
import PatternWorkshop from './pages/PatternWorkshop';
import Habits7Hub from './pages/Habits7Hub';
import Habits7Page from './pages/Habits7Page';
import Habits7Plan from './pages/Habits7Plan';
import Play from './pages/Play';
import ReadingMode from './components/daily/ReadingMode';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <ConfirmProvider>
          <ThemeSync />
          <HashRouter>
            <Routes>
              {/* 沉浸式朗讀模式：不顯示導覽列 */}
              <Route path="/daily/read" element={<ReadingMode />} />
              <Route element={<Layout />}>
                <Route index element={<Overview />} />
                <Route path="learn" element={<Learn />} />
                <Route path="learn/:chapterId" element={<ChapterPage />} />
                <Route path="lab" element={<BrainLab />} />
                <Route path="lab/:toolId" element={<BrainLab />} />
                <Route path="challenge" element={<Challenge />} />
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
