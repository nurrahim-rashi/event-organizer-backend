import { getDashboardStatsService } from "../services/dashboard.service.js";
export const getDashboardStatsController = async (req, res) => {
    const userId = Number(req.user.id);
    const role = req.user.role;
    const { filter, eventId } = req.query;
    const stats = await getDashboardStatsService(userId, role, filter, eventId ? Number(eventId) : undefined);
    res.status(200).send({
        success: true,
        data: stats,
    });
};
