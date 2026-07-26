import { prisma } from "../lib/prisma.js";
export const createTicketService = async (body) => {
    const { name, price, totalTicket, eventId } = body;
    const ticket = await prisma.ticketType.create({
        data: {
            name,
            price: Number(price),
            totalTicket: Number(totalTicket),
            eventId: Number(eventId),
        },
    });
    return { data: ticket };
};
export const getTicketsByEventService = async (eventId) => {
    const tickets = await prisma.ticketType.findMany({
        where: {
            eventId: eventId,
            deletedAt: null,
        },
    });
    return { data: tickets };
};
export const updateTicketService = async (id, body) => {
    const { name, price, totalTicket } = body;
    const ticket = await prisma.ticketType.update({
        where: { id: id },
        data: {
            name,
            price: price ? Number(price) : undefined,
            totalTicket: totalTicket ? Number(totalTicket) : undefined,
        },
    });
    return { data: ticket };
};
export const deleteTicketService = async (id) => {
    await prisma.ticketType.update({
        where: { id: id },
        data: { deletedAt: new Date() },
    });
    return { message: "Ticket type deleted successfully" };
};
