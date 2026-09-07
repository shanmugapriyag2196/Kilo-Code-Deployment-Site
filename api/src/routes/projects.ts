import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";
import GitHubService from "../services/githubService";
import DeploymentService from "../services/deploymentService";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      include: {
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create", authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      githubRepo,
      branch,
      buildCommand,
      outputDir,
      framework,
    } = req.body;

    if (!name || !githubRepo) {
      return res.status(400).json({ error: "Name and GitHub repo are required" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user || !user.accessToken) {
      return res
        .status(400)
        .json({ error: "GitHub not connected. Please connect GitHub first." });
    }

    const githubService = new GitHubService(user.accessToken);
    const repoParts = githubRepo.split("/");
    if (repoParts.length < 2) {
      return res
        .status(400)
        .json({ error: "Invalid repo format. Use owner/repo format." });
    }

    const owner = repoParts[repoParts.length - 2];
    const repoName = repoParts[repoParts.length - 1];

    try {
      const repo = await githubService.getRepo(owner, repoName);
      const branches = await githubService.getRepoBranches(owner, repoName);
      const selectedBranch =
        branches.find((b: any) => b.name === branch) || branches[0];

      const project = await prisma.project.create({
        data: {
          name,
          slug: `${slug}-${user.githubId.slice(0, 8)}`,
          description,
          repoUrl: repo.html_url,
          githubRepo: repo.full_name,
          branch: selectedBranch?.name || repo.default_branch,
          buildCommand,
          outputDir,
          framework,
          userId: user.id,
        },
      });

      res.status(201).json(project);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return res
          .status(404)
          .json({ error: "Repository not found or access denied" });
      }
      throw error;
    }
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Project with this slug already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/deploy", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { branch = "main", triggeredBy = "manual" } = req.body;

    const project = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { accessToken: true, id: true },
    });

    const deployment = await prisma.deployment.create({
      data: {
        projectName: project.name,
        status: "PENDING",
        commitSha: "",
        branch,
        triggeredBy,
        projectId: project.id,
      },
    });

    res.status(201).json(deployment);

    if (user?.accessToken) {
      const githubService = new GitHubService(user.accessToken);
      if (project.githubRepo) {
        const repoParts = project.githubRepo.split("/");
        const owner = repoParts[0];
        const repoName = repoParts[1];
        const commit = await githubService.getLatestCommit(
          owner,
          repoName,
          branch
        );

        const deploymentService = new DeploymentService(
          deployment.id,
          project,
          githubService
        );
        await deploymentService.startDeployment(commit);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
