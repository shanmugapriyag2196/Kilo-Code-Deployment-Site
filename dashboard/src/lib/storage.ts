import { Project, Deployment, EnvironmentDeployment, ActivityItem } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'vg_projects',
  DEPLOYMENTS: 'vg_deployments',
  ENVIRONMENTS: 'vg_environments',
  ACTIVITY: 'vg_activity',
} as const;

export const storage = {
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getDeployments(): Deployment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPLOYMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDeployments(deployments: Deployment[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(deployments));
  },

  getEnvironments(): EnvironmentDeployment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveEnvironments(environments: EnvironmentDeployment[]): void {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(environments));
  },

  getActivity(): ActivityItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveActivity(activity: ActivityItem[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activity));
  },

  addActivity(item: ActivityItem): void {
    const activity = this.getActivity();
    activity.unshift(item);
    if (activity.length > 100) activity.pop();
    this.saveActivity(activity);
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};
