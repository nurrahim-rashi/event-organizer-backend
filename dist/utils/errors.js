export const globalError = (err, req, res, next) => {
    console.error("--- GLOBAL ERROR HANDLER ---");
    console.error("Pesan Error:", err.message);
    console.error("Stack Trace:", err.stack);
    const message = err.message || "Something went wrong!";
    const status = err.statusCode || 500;
    res.status(status).send(message);
};
export const notFoundError = (req, res) => {
    res.status(404).send({ message: "Route not found" });
};
