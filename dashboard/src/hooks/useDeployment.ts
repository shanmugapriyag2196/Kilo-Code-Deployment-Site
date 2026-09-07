import { useState, useEffect, useRef } from 'react';
import { useApp } from '../stores/AppContext';
import { Deployment, DeploymentLog } from '../types';

export function useDeploymentSimulation(deploymentId: string | null) {
  const { deployments } = useApp();
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!deploymentId) {
      setCurrentDeployment(null);
      setLogs([]);
      setIsRunning(false);
      return;
    }

    const deployment = deployments.find(d => d.id === deploymentId);
    if (deployment) {
      setCurrentDeployment(deployment);
      setLogs(deployment.logs || []);
      
      const activeStatuses = ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check'];
      if (activeStatuses.includes(deployment.status)) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [deploymentId, deployments]);

  useEffect(() => {
    if (!currentDeployment || !isRunning) return;

    const statusOrder = ['queued', 'installing', 'building', 'testing', 'deploying', 'health_check', 'ready'];
    const currentIndex = statusOrder.indexOf(currentDeployment.status);
    
    if (currentIndex >= statusOrder.length - 1) {
      setIsRunning(false);
      return;
    }

      const nextStatus = statusOrder[currentIndex + 1] as Deployment['status'];
    const delay = 1500 + Math.random() * 2000;

    const timeout = setTimeout(() => {
      setCurrentDeployment(prev => {
        if (!prev || prev.id !== currentDeployment.id) return prev;
        
        const updated = { ...prev, status: nextStatus };
        
        if (nextStatus === 'ready') {
          updated.buildDuration = Math.floor(Math.random() * 5000) + 3000;
        }

        return updated;
      });

      if (nextStatus !== 'ready') {
        simulateProgress();
      } else {
        setIsRunning(false);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentDeployment, isRunning]);

  const simulateProgress = () => {
    // Handled in useEffect above
  };

  const stop = () => {
    setIsRunning(false);
  };

  return {
    currentDeployment,
    logs,
    isRunning,
    stop,
  };
}
