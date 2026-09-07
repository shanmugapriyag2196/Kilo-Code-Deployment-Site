import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import GitHubService from "../services/githubService";
import { generateToken } from "../utils/jwt";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      hasGithubAccess: !!user.accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/github/connect",
  (req: Request, res: Response) => {
    const state = jwt.sign(
      { timestamp: Date.now() },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "10m" }
    );
    const githubService = new GitHubService();
    const url = githubService.getAuthUrl(state);
    res.json({ url, state });
  }
);

router.get("/github/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: "Invalid code" });
  }

  try {
    const githubService = new GitHubService();
    const accessToken = await githubService.getAccessToken(code as string);
    const ghUser = await githubService.getUser();

    let user = await prisma.user.findUnique({
      where: { githubId: String(ghUser.id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: String(ghUser.id),
          email: ghUser.email || `${ghUser.id}@github.com`,
          name: ghUser.name || ghUser.login,
          avatarUrl: ghUser.avatar_url,
          accessToken: accessToken,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: accessToken,
          name: ghUser.name || user.name,
          avatarUrl: ghUser.avatar_url,
        },
      });
    }

    const token = generateToken(user);

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("GitHub callback error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to authenticate with GitHub" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
