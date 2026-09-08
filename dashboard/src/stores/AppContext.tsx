import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, Deployment, EnvironmentDeployment, ActivityItem, GitHubTreeItem } from '../types';
import { storage } from '../lib/storage';
import { generateMockDeployment, createActivityItem, createEnvironmentDeployment, getNextStatus, generateDeploymentLogsForStage } from '../lib/mockData';
import { fetchCommitsFromGitHub, fetchCommitTree, parseGitHubRepo } from '../services/githubService';
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
  syncProjectFromGitHub: (projectId: string, projectOverride?: Project) => Promise<Deployment[]>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  deployProject: (projectId: string, environment: 'production' | 'preview' | 'development') => Deployment;
  cancelDeployment: (deploymentId: string) => void;
  redeploy: (deploymentId: string) => Deployment;
  rollback: (projectId: string) => void;
  selectDeployment: (id: string | null) => void;
  refreshData: () => void;
  getCommitTree: (deploymentId: string, force?: boolean) => Promise<GitHubTreeItem[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [deployments, setDeployments] = useState<Deployment[]>(() => storage.getDeployments());
  const [environments, setEnvironments] = useState<EnvironmentDeployment[]>(() => storage.getEnvironments());
  const [activity, setActivity] = useState<ActivityItem[]>(() => storage.getActivity());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);
  const [commitTrees, setCommitTrees] = useState<Record<string, GitHubTreeItem[]>>({});

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

  const persistCommitTrees = (trees: Record<string, GitHubTreeItem[]>) => {
    setCommitTrees(trees);
    localStorage.setItem('vg_commit_trees', JSON.stringify(trees));
  };

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Project => {
    const now = new Date().toISOString();
    const project: Project = {
      ...projectData,
      id: uuidv4(),
      platform: projectData.platform || 'vercel',
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

  const syncProjectFromGitHub = useCallback(async (projectId: string, projectOverride?: Project): Promise<Deployment[]> => {
    const project = projectOverride || projects.find(p => p.id === projectId);
    if (!project || !project.gitRepository) return [];

    const commits = await fetchCommitsFromGitHub(project.gitRepository);
    if (commits.length === 0) return [];

    const newDeployments: Deployment[] = [];
    const now = new Date().toISOString();

    commits.forEach((commit, index) => {
      const commitNumber = index + 1;
      const deploymentId = `deploy_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
      const deployment: Deployment = {
        id: deploymentId,
        projectId,
        projectName: project.name,
        environment: 'production',
        platform: project.platform || 'vercel',
        branch: 'main',
        commitSha: commit.sha,
        commitNumber,
        commitMessage: commit.message.split('\n')[0],
        deploymentUrl: `https://${project.name.replace(/\s+/g, '-').toLowerCase()}-${project.branch}.vercel.app`,
        buildDuration: Math.floor(Math.random() * 5000) + 2000,
        createdAt: new Date(Date.now() - (commits.length - index) * 60000).toISOString(),
        status: 'ready',
        logs: generateDeploymentLogsForStage(deploymentId, commitNumber, 'ready'),
      };
      newDeployments.push(deployment);
    });

    const allDeployments = [...newDeployments, ...deployments];
    persistDeployments(allDeployments);

    const envDeployment = {
      id: `env_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      environment: 'production' as const,
      deploymentId: newDeployments[0].id,
      url: `https://${project.name.replace(/\s+/g, '-').toLowerCase()}-production.vercel.app`,
      branch: 'main',
      status: 'ready' as const,
      updatedAt: now,
    };

    const existingProd = environments.find(e => e.projectId === projectId && e.environment === 'production');
    if (existingProd) {
      persistEnvironments(environments.map(e => e.id === existingProd.id ? envDeployment : e));
    } else {
      persistEnvironments([envDeployment, ...environments]);
    }

    const activityItem = createActivityItem('deployment', projectId, project.name, `Synced ${commits.length} commits from GitHub`);
    persistActivity([activityItem, ...activity]);

    return newDeployments;
  }, [projects, deployments, environments, activity, commitTrees]);

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

    const existingDeployments = deployments.filter(d => d.projectId === projectId);
    const commitNumber = existingDeployments.length > 0 ? Math.max(...existingDeployments.map(d => d.commitNumber)) + 1 : 1;

    const deployment = generateMockDeployment(projectId, project.name, environment, commitNumber);
    const newDeployments = [deployment, ...deployments];
    persistDeployments(newDeployments);

    const activityItem = createActivityItem('deployment', projectId, project.name, `Deployment started for ${environment}`);
    persistActivity([activityItem, ...activity]);

    if (environment === 'production') {
      const envDeployment = createEnvironmentDeployment(projectId, project.name, 'production', deployment.id);
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

    const existingDeployments = deployments.filter(d => d.projectId === existing.projectId);
    const commitNumber = existingDeployments.length > 0 ? Math.max(...existingDeployments.map(d => d.commitNumber)) + 1 : 1;

    const newDeployment = generateMockDeployment(existing.projectId, existing.projectName, existing.environment, commitNumber);
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

  const getCommitTree = useCallback(async (deploymentId: string, force = false): Promise<GitHubTreeItem[]> => {
    const deployment = deployments.find(d => d.id === deploymentId);
    if (!deployment) return [];
    
    if (!force) {
      const cached = commitTrees[deploymentId];
      if (cached && cached.length > 0) return cached;
    }

    const project = projects.find(p => p.id === deployment.projectId);
    if (!project?.gitRepository) return [];

    const repoInfo = parseGitHubRepo(project.gitRepository);
    if (!repoInfo) return [];

    const tree = await fetchCommitTree(repoInfo.owner, repoInfo.repo, deployment.commitSha);
    if (tree.length > 0) {
      const newCommitTrees = { ...commitTrees, [deploymentId]: tree };
      persistCommitTrees(newCommitTrees);
    }
    
    return tree;
  }, [deployments, projects, commitTrees]);

  const selectDeployment = useCallback((id: string | null) => {
    setSelectedDeploymentId(id);
  }, []);

  const refreshData = useCallback(() => {
    setProjects(storage.getProjects());
    setDeployments(storage.getDeployments());
    setEnvironments(storage.getEnvironments());
    setActivity(storage.getActivity());
    try {
      const trees = localStorage.getItem('vg_commit_trees');
      if (trees) setCommitTrees(JSON.parse(trees));
    } catch {
      setCommitTrees({});
    }
  }, []);

  useEffect(() => {
    const activeStatuses: Deployment['status'][] = ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check'];
    
    const interval = setInterval(() => {
      setDeployments(prev => {
        const hasActive = prev.some(d => activeStatuses.includes(d.status));
        if (!hasActive) return prev;

        const updated = prev.map(deployment => {
          if (!activeStatuses.includes(deployment.status)) return deployment;

          const nextStatus = getNextStatus(deployment.status);
          if (!nextStatus) return deployment;

          const newLogs = generateDeploymentLogsForStage(deployment.id, deployment.commitNumber, nextStatus);
          const buildDuration = nextStatus === 'ready' ? Math.floor(Math.random() * 5000) + 3000 : deployment.buildDuration;
          const deploymentUrl = nextStatus === 'ready'
            ? `https://${deployment.projectName.replace(/\s+/g, '-').toLowerCase()}-${deployment.environment}.vercel.app`
            : deployment.deploymentUrl;

          return {
            ...deployment,
            status: nextStatus,
            logs: [...deployment.logs, ...newLogs],
            buildDuration,
            deploymentUrl,
          };
        });

        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          storage.saveDeployments(updated);
        }

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider     value={{
      projects,
      deployments,
      environments,
      activity,
      selectedProjectId,
      selectedDeploymentId,
      createProject,
      syncProjectFromGitHub,
      updateProject,
      deleteProject,
      selectProject,
      deployProject,
      cancelDeployment,
      redeploy,
      rollback,
      selectDeployment,
      refreshData,
      getCommitTree,
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
