import { Project } from "@prisma/client";
import { prisma } from "../prisma/client";
import { GitHubService } from "./githubService";

type DeploymentStatus = "PENDING" | "BUILDING" | "DEPLOYING" | "READY" | "ERROR" | "CANCELED";
type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export class DeploymentService {
  private deploymentId: string;
  private project: Project;
  private githubService: GitHubService;

  constructor(deploymentId: string, project: Project, githubService: GitHubService) {
    this.deploymentId = deploymentId;
    this.project = project;
    this.githubService = githubService;
  }

  private async addLog(message: string, level: LogLevel = "INFO") {
    await prisma.deploymentLog.create({
      data: {
        deploymentId: this.deploymentId,
        level,
        message,
      },
    });
  }

  private async updateStatus(status: DeploymentStatus) {
    await prisma.deployment.update({
      where: { id: this.deploymentId },
      data: { status },
    });
  }

  async startDeployment(commit?: any) {
    const startTime = Date.now();

    try {
      await this.addLog(`Starting deployment for ${this.project.name}`, "INFO");
      await this.updateStatus("BUILDING");
      await this.addLog("Detected project framework and dependencies", "INFO");

      if (commit) {
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: {
            commitSha: commit.sha,
            commitMessage: commit.commit.message,
            branch: this.project.branch,
          },
        });
        await this.addLog(
          `Commit: ${commit.commit.message.split("\n")[0]} (${commit.sha.substring(0, 7)})`,
          "INFO"
        );
      }

      await this.simulateBuild();
      await this.updateStatus("DEPLOYING");
      await this.simulateDeploy();
      await this.updateStatus("READY");

      const duration = Math.floor((Date.now() - startTime) / 1000);
      const deploymentUrl = `https://${this.project.slug}.deployment-platform.vercel.app`;

      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: {
          status: "READY",
          duration,
          url: deploymentUrl,
          completedAt: new Date(),
        },
      });

      await this.addLog(`Deployment completed in ${duration}s`, "INFO");
      await this.addLog(`Live URL: ${deploymentUrl}`, "INFO");
    } catch (error: any) {
      await this.updateStatus("ERROR");
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: {
          status: "ERROR",
          duration,
          completedAt: new Date(),
        },
      });
      await this.addLog(`Deployment failed: ${error.message}`, "ERROR");
    }
  }

  private async simulateBuild() {
    await this.addLog("Installing dependencies...", "INFO");
    await this.delay(800);

    await this.addLog("Running build command...", "INFO");
    await this.delay(1200);

    await this.addLog("Build completed successfully", "INFO");
  }

  private async simulateDeploy() {
    await this.addLog("Preparing deployment package...", "INFO");
    await this.delay(500);

    await this.addLog("Deploying to edge network...", "INFO");
    await this.delay(1000);

    await this.addLog("Propagating to global CDN...", "INFO");
    await this.delay(800);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default DeploymentService;
