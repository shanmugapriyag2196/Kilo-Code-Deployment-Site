import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Project, Deployment, EnvironmentDeployment, ActivityItem } from '../types';
import { storage } from '../lib/storage';
import { generateMockDeployment, createActivityItem, createEnvironmentDeployment } from '../lib/mockData';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  projects: Project[];
  deployments: Deployment[];
  environments: EnvironmentDeployment[];
  activity: ActivityItem[];
  selectedProjectId: string | null;
  selectedDeploymentId: string | null;
}

interface AppContextType extends AppState {
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  deployProject: (projectId: string, environment: 'production' | 'preview' | 'development') => Deployment;
  cancelDeployment: (deploymentId: string) => void;
  redeploy: (deploymentId: string) => Deployment;
  rollback: (projectId: string) => void;
  selectDeployment: (id: string | null) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [deployments, setDeployments] = useState<Deployment[]>(() => storage.getDeployments());
  const [environments, setEnvironments] = useState<EnvironmentDeployment[]>(() => storage.getEnvironments());
  const [activity, setActivity] = useState<ActivityItem[]>(() => storage.getActivity());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  const persistProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    storage.saveProjects(newProjects);
  };

  const persistDeployments = (newDeployments: Deployment[]) => {
    setDeployments(newDeployments);
    storage.saveDeployments(newDeployments);
  };

  const persistEnvironments = (newEnvs: EnvironmentDeployment[]) => {
    setEnvironments(newEnvs);
    storage.saveEnvironments(newEnvs);
  };

  const persistActivity = (newActivity: ActivityItem[]) => {
    setActivity(newActivity);
    storage.saveActivity(newActivity);
  };

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Project => {
    const now = new Date().toISOString();
    const project: Project = {
      ...projectData,
      id: uuidv4(),
      status: 'idle',
      createdAt: now,
      updatedAt: now,
    };
    const newProjects = [project, ...projects];
    persistProjects(newProjects);
    
    const activityItem = createActivityItem('project_created', project.id, project.name, `Project "${project.name}" was created`);
    persistActivity([activityItem, ...activity]);
    
    return project;
  }, [projects, activity]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const newProjects = projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    persistProjects(newProjects);
  }, [projects]);

  const deleteProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    const newProjects = projects.filter(p => p.id !== id);
    persistProjects(newProjects);
    
    if (project) {
      const newDeployments = deployments.filter(d => d.projectId !== id);
      persistDeployments(newDeployments);
      
      const newEnvs = environments.filter(e => e.projectId !== id);
      persistEnvironments(newEnvs);
      
      const activityItem = createActivityItem('project_updated', id, project.name, `Project "${project.name}" was deleted`);
      persistActivity([activityItem, ...activity]);
    }
  }, [projects, deployments, environments, activity]);

  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
  }, []);

  const deployProject = useCallback((projectId: string, environment: 'production' | 'preview' | 'development'): Deployment => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const deployment = generateMockDeployment(projectId, project.name, environment);
    const newDeployments = [deployment, ...deployments];
    persistDeployments(newDeployments);

    const activityItem = createActivityItem('deployment', projectId, project.name, `Deployment started for ${environment}`);
    persistActivity([activityItem, ...activity]);

    if (environment === 'production') {
      const envDeployment = createEnvironmentDeployment(projectId, 'production', deployment.id);
      const existingProd = environments.find(e => e.projectId === projectId && e.environment === 'production');
      if (existingProd) {
        persistEnvironments(environments.map(e => e.id === existingProd.id ? envDeployment : e));
      } else {
        persistEnvironments([envDeployment, ...environments]);
      }
    }

    return deployment;
  }, [projects, deployments, environments, activity]);

  const cancelDeployment = useCallback((deploymentId: string) => {
    const deployment = deployments.find(d => d.id === deploymentId);
    if (!deployment) return;

    const updatedDeployment = { ...deployment, status: 'cancelled' as const };
    persistDeployments(deployments.map(d => d.id === deploymentId ? updatedDeployment : d));

    const activityItem = createActivityItem('deployment', deployment.projectId, deployment.projectName, `Deployment ${deploymentId.substring(0, 8)} was cancelled`);
    persistActivity([activityItem, ...activity]);
  }, [deployments, activity]);

  const redeploy = useCallback((deploymentId: string): Deployment => {
    const existing = deployments.find(d => d.id === deploymentId);
    if (!existing) throw new Error('Deployment not found');

    const newDeployment = generateMockDeployment(existing.projectId, existing.projectName, existing.environment);
    newDeployment.branch = existing.branch;
    const newDeployments = [newDeployment, ...deployments];
    persistDeployments(newDeployments);

    const activityItem = createActivityItem('deployment', existing.projectId, existing.projectName, `Redeployment started for ${existing.environment}`);
    persistActivity([activityItem, ...activity]);

    return newDeployment;
  }, [deployments, activity]);

  const rollback = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const previousDeployment = deployments.find(d => d.projectId === projectId && d.status === 'ready');
    if (!previousDeployment) return;

    const activityItem = createActivityItem('rollback', projectId, project.name, `Rolled back to deployment ${previousDeployment.id.substring(0, 8)}`);
    persistActivity([activityItem, ...activity]);
  }, [projects, deployments, activity]);

  const selectDeployment = useCallback((id: string | null) => {
    setSelectedDeploymentId(id);
  }, []);

  const refreshData = useCallback(() => {
    setProjects(storage.getProjects());
    setDeployments(storage.getDeployments());
    setEnvironments(storage.getEnvironments());
    setActivity(storage.getActivity());
  }, []);

  return (
    <AppContext.Provider value={{
      projects,
      deployments,
      environments,
      activity,
      selectedProjectId,
      selectedDeploymentId,
      createProject,
      updateProject,
      deleteProject,
      selectProject,
      deployProject,
      cancelDeployment,
      redeploy,
      rollback,
      selectDeployment,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
