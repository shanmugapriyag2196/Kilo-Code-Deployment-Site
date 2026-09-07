import { AlertCircle, CheckCircle, Clock, Package, Rocket, Server, Globe } from "lucide-react";

export interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: "complete" | "active" | "pending" | "error";
  icon: React.ElementType;
}

interface DeploymentProgressProps {
  status: string;
  steps?: DeploymentStep[];
}

const defaultSteps: DeploymentStep[] = [
  {
    id: "1",
    title: "Queued",
    description: "Deployment is waiting to start",
    status: "pending",
    icon: Clock,
  },
  {
    id: "2",
    title: "Installing Dependencies",
    description: "Downloading and installing packages",
    status: "pending",
    icon: Package,
  },
  {
    id: "3",
    title: "Building",
    description: "Running build commands",
    status: "pending",
    icon: Server,
  },
  {
    id: "4",
    title: "Deploying",
    description: "Deploying to edge network",
    status: "pending",
    icon: Rocket,
  },
  {
    id: "5",
    title: "Live",
    description: "Deployment is live and serving traffic",
    status: "pending",
    icon: Globe,
  },
];

export default function DeploymentProgress({ status, steps }: DeploymentProgressProps) {
  const allSteps = steps || defaultSteps;

  const stepStatusMap: Record<string, DeploymentStep["status"][]> = {
    PENDING: ["pending", "pending", "pending", "pending", "pending"],
    BUILDING: ["complete", "active", "pending", "pending", "pending"],
    DEPLOYING: ["complete", "complete", "active", "pending", "pending"],
    READY: ["complete", "complete", "complete", "complete", "complete"],
    ERROR: ["complete", "error", "pending", "pending", "pending"],
    CANCELED: ["complete", "pending", "pending", "pending", "pending"],
  };

  const statuses = stepStatusMap[status] || stepStatusMap.PENDING;

  return (
    <div className="space-y-4">
      {allSteps.map((step, index) => {
        const stepStatus = statuses[index] || "pending";
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                stepStatus === "complete"
                  ? "bg-green-500 text-white"
                  : stepStatus === "active"
                  ? "bg-primary-500 text-white animate-pulse"
                  : stepStatus === "error"
                  ? "bg-red-500 text-white"
                  : "bg-dark-border text-gray-500"
              }`}
            >
              {stepStatus === "complete" ? (
                <CheckCircle className="h-4 w-4" />
              ) : stepStatus === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  stepStatus === "complete"
                    ? "text-green-400"
                    : stepStatus === "active"
                    ? "text-primary-400"
                    : stepStatus === "error"
                    ? "text-red-400"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
