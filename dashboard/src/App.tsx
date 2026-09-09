import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DeploymentsPage from './pages/DeploymentsPage';
import DeploymentDetailPage from './pages/DeploymentDetailPage';
import DeployedPreviewPage from './pages/DeployedPreviewPage';
import EnvironmentsPage from './pages/EnvironmentsPage';
import PlatformsPage from './pages/PlatformsPage';
import ActivityPage from './pages/ActivityPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import NewProjectModal from './pages/NewProjectModal';
import { useApp } from './stores/AppContext';
import { useState } from 'react';

function AppContent() {
  const [showNewProject, setShowNewProject] = useState(false);
  const { selectProject } = useApp();
  const location = useLocation();

  const isPreviewPage = location.pathname.startsWith('/preview/');

  return (
    <>
      {!isPreviewPage && <Layout onNewProject={() => setShowNewProject(true)} />}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/projects" element={<ProjectsPage onNavigateToProject={selectProject} />} />
        <Route path="/project-detail/:id" element={<ProjectDetailPage />} />
        <Route path="/deployments" element={<DeploymentsPage />} />
        <Route path="/deployment-detail/:id" element={<DeploymentDetailPage />} />
        <Route path="/preview/:id" element={<DeployedPreviewPage />} />
        <Route path="/environments" element={<EnvironmentsPage />} />
        <Route path="/platforms" element={<PlatformsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
