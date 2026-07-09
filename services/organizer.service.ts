import { prisma } from "../lib/prisma.js";

export const getOrganizerProfileData = async (organizerId: number) => {
  const organizerData = await prisma.user.findUnique({
    where: { id: organizerId },
    select: {
      id: true,
      name: true,
      email: true,
      profilePic: true,
      role: true,
      referralCode: true,
      organizedEvents: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!organizerData) {
    throw new Error("Organizer not found");
  }

  const eventIds = organizerData.organizedEvents.map((e) => e.id);

  let reviews: any[] = [];
  if (eventIds.length > 0) {
    reviews = await prisma.review.findMany({
      where: {
        transaction: {
          eventId: { in: eventIds },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            profilePic: true,
          },
        },
        transaction: {
          include: {
            event: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const distributionMap: { [key: number]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((r) => {
    if (distributionMap[r.rating] !== undefined) {
      distributionMap[r.rating]++;
    }
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = distributionMap[stars];
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, percentage };
  });

  return {
    organizer: {
      id: organizerData.id,
      name: organizerData.name,
      email: organizerData.email,
      profilePic: organizerData.profilePic,
      role: organizerData.role,
      referralCode: organizerData.referralCode,
    },
    eventsCount: eventIds.length,
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews,
    ratingDistribution,
    reviews,
  };
};
