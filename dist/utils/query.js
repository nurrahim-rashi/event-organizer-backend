export const baseQuery = (req) => {
    return {
        page: parseInt(req.query.page) || 1,
        take: parseInt(req.query.take) || 9,
        sortOrder: req.query.sortOrder || "desc",
        sortBy: req.query.sortBy || "createdAt",
        search: req.query.search || "",
        location: req.query.location || "",
        category: req.query.category || "",
    };
};
