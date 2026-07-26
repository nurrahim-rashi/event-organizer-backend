import { getOrganizerProfileData } from "../services/organizer.service.js";
export const getProfile = async (req, res) => {
    const { id } = req.params;
    const idString = Array.isArray(id) ? id[0] : id;
    const organizerId = parseInt(idString, 10);
    if (isNaN(organizerId)) {
        const error = new Error("Invalid Organizer ID format");
        error.status = 400;
        throw error;
    }
    const profileData = await getOrganizerProfileData(organizerId);
    res.status(200).json(profileData);
};
