import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";
import GitHubService from "../services/githubService";

const router = Router();

router.get("/status", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { accessToken: true },
    });
    res.json({ connected: !!user?.accessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repos", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const { page, per_page } = req.query;
    const githubService = new GitHubService(user.accessToken);
    const repos = await githubService.getUserRepos(
      Number(page) || 1,
      Number(per_page) || 30
    );
    res.json(repos);
  } catch (error: any) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: "GitHub token expired. Please reconnect." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repos/:owner/:repo/branches", authenticate, async (req: AuthRequest, res) => {
  try {
    const { owner, repo } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const githubService = new GitHubService(user.accessToken);
    const branches = await githubService.getRepoBranches(owner, repo);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repos/:owner/:repo/commits", authenticate, async (req: AuthRequest, res) => {
  try {
    const { owner, repo } = req.params;
    const { branch } = req.query;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { accessToken: true },
    });

    if (!user || !user.accessToken) {
      return res.status(400).json({ error: "GitHub not connected" });
    }

    const githubService = new GitHubService(user.accessToken);
    const commits = await githubService.getLatestCommit(owner, repo, branch as string || "main");
    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;