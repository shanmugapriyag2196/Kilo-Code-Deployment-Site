import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar onNewProject={onNewProject} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
