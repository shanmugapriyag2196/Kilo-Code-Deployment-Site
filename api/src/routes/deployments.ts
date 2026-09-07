import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { project } = req.query;
    const where = project
      ? { AND: [{ project: { slug: String(project) } }, { project: { userId: req.user!.id } }] }
      : { project: { userId: req.user!.id } };

    const deployments = await prisma.deployment.findMany({
      where,
      include: {
        logs: { orderBy: { timestamp: "asc" } },
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deployment = await prisma.deployment.findFirst({
      where: {
        id,
        project: { userId: req.user!.id },
      },
      include: {
        logs: { orderBy: { timestamp: "asc" } },
        project: true,
      },
    });
    if (!deployment) return res.status(404).json({ error: "Deployment not found" });
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/logs", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const logs = await prisma.deploymentLog.findMany({
      where: {
        deployment: {
          id,
          project: { userId: req.user!.id },
        },
      },
      orderBy: { timestamp: "asc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/cancel", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deployment = await prisma.deployment.updateMany({
      where: {
        id,
        project: { userId: req.user!.id },
        status: { in: ["PENDING", "BUILDING", "DEPLOYING"] },
      },
      data: { status: "CANCELED" },
    });
    if (deployment.count === 0) {
      return res.status(404).json({ error: "Deployment not found or cannot be canceled" });
    }
    res.json({ message: "Deployment canceled" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deployment = await prisma.deployment.findFirst({
      where: {
        id,
        project: { userId: req.user!.id },
      },
      select: { id: true },
    });
    if (!deployment) return res.status(404).json({ error: "Deployment not found" });
    await prisma.deployment.delete({ where: { id } });
    res.json({ message: "Deployment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;