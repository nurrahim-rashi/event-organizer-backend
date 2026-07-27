import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
export const getEventsService = async (query) => {
    const { page, take, sortOrder, sortBy, search, location, category } = query;
    const whereClause = {};
    if (search) {
        whereClause.name = { contains: search, mode: "insensitive" };
    }
    if (location) {
        whereClause.location = { contains: location, mode: "insensitive" };
    }
    if (category) {
        const categoryArray = category.split(",");
        whereClause.category = { in: categoryArray };
    }
    whereClause.deletedAt = null;
    const pageNumber = Number(page) || 1;
    const takeNumber = Number(take) || 8;
    const events = await prisma.event.findMany({
        where: whereClause,
        include: {
            ticketTypes: true,
        },
        skip: (pageNumber - 1) * takeNumber,
        take: takeNumber,
        orderBy: { [sortBy]: sortOrder },
    });
    const total = await prisma.event.count({ where: whereClause });
    return {
        data: events,
        meta: {
            page: pageNumber,
            take: takeNumber,
            total: total,
        },
    };
};
export const getEventService = async (id, filterType = "month") => {
    const event = await prisma.event.findFirst({
        where: { id, deletedAt: null },
        include: {
            organizer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePic: true,
                    role: true,
                },
            },
            ticketTypes: true,
            vouchers: true,
            transactions: {
                where: { status: "DONE" },
                select: {
                    totalPrice: true,
                    createdAt: true,
                    items: { select: { qty: true } },
                },
                orderBy: { createdAt: "asc" },
            },
        },
    });
    if (!event)
        throw new ApiError("Event not found!", 404);
    return event;
};
export const createEventService = async (body, file) => {
    let bannerImageUrl = "";
    if (file) {
        const uploadResult = await cloudinaryUpload(file);
        bannerImageUrl = uploadResult.secure_url;
    }
    else {
        bannerImageUrl = body.bannerImage || "";
    }
    const event = await prisma.event.create({
        data: {
            name: body.name,
            description: body.description,
            location: body.location,
            category: body.category,
            bannerImage: bannerImageUrl,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            organizerId: Number(body.organizerId),
            ticketTypes: { create: body.ticketTypes || [] },
            vouchers: { create: body.vouchers || [] },
        },
        include: { ticketTypes: true, vouchers: true },
    });
    return { message: "Event created successfully.", data: event };
};
export const updateEventService = async (id, body, file) => {
    const event = await prisma.event.findFirst({
        where: { id, deletedAt: null },
        include: { ticketTypes: true },
    });
    if (!event)
        throw new ApiError("Event not found!", 404);
    let bannerImageUrl = event.bannerImage;
    if (file) {
        const uploadResult = await cloudinaryUpload(file);
        bannerImageUrl = uploadResult.secure_url;
    }
    // Ambil semua ID tiket yang dikirim dari frontend (hanya yang punya ID)
    const incomingTicketIds = (body.ticketTypes || [])
        .filter((t) => t.id)
        .map((t) => t.id);
    return await prisma.$transaction(async (tx) => {
        // 1. Update data event dasar
        const updatedEvent = await tx.event.update({
            where: { id },
            data: {
                name: body.name || event.name,
                description: body.description || event.description,
                location: body.location || event.location,
                category: body.category || event.category,
                bannerImage: bannerImageUrl,
                startDate: body.startDate ? new Date(body.startDate) : event.startDate,
                endDate: body.endDate ? new Date(body.endDate) : event.endDate,
            },
        });
        // 2. HAPUS tiket yang ada di DB tapi TIDAK ADA di payload baru
        await tx.ticketType.deleteMany({
            where: {
                eventId: id,
                id: { notIn: incomingTicketIds },
            },
        });
        // 3. Upsert tiket (Update yang ada, Create yang baru)
        if (body.ticketTypes && Array.isArray(body.ticketTypes)) {
            for (const ticket of body.ticketTypes) {
                if (ticket.id) {
                    // Update jika sudah ada id
                    await tx.ticketType.update({
                        where: { id: ticket.id },
                        data: {
                            name: ticket.name,
                            price: Number(ticket.price),
                            totalTicket: Number(ticket.totalTicket),
                        },
                    });
                }
                else {
                    // Buat baru jika tidak ada id
                    await tx.ticketType.create({
                        data: {
                            name: ticket.name,
                            price: Number(ticket.price),
                            totalTicket: Number(ticket.totalTicket),
                            eventId: id,
                        },
                    });
                }
            }
        }
        return updatedEvent;
    });
};
export const deleteEventService = async (id) => {
    const event = await prisma.event.findFirst({
        where: { id, deletedAt: null },
    });
    if (!event)
        throw new ApiError("Event not found!", 404);
    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: "Event deleted successfully." };
};
export const getEventAttendeeService = async (eventId) => {
    const attendees = await prisma.transaction.findMany({
        where: {
            eventId,
            status: "DONE",
        },
        select: {
            id: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    return attendees;
};
