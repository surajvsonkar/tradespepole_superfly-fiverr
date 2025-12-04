import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a new job lead (Homeowner only)
export const createJobLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      category,
      location,
      budget,
      urgency,
      contactDetails,
      maxPurchases,
      price,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !budget || !contactDetails) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const jobLead = await prisma.jobLead.create({
      data: {
        title,
        description,
        category,
        location,
        budget,
        urgency: urgency || 'Medium',
        postedBy: userId,
        contactDetails,
        maxPurchases: maxPurchases || 6,
        price: price || 9.99,
        isActive: true,
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) })
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Job lead created successfully',
      jobLead
    });
  } catch (error) {
    console.error('Create job lead error:', error);
    res.status(500).json({ error: 'Failed to create job lead' });
  }
};

// Get all job leads (with filters)
export const getJobLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      location,
      urgency,
      isActive,
      limit = '20',
      offset = '0'
    } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }

    if (urgency) {
      where.urgency = urgency as string;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const jobLeads = await prisma.jobLead.findMany({
      where,
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.jobLead.count({ where });

    res.status(200).json({
      jobLeads,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Get job leads error:', error);
    res.status(500).json({ error: 'Failed to get job leads' });
  }
};

// Get job lead by ID
export const getJobLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const jobLead = await prisma.jobLead.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            location: true
          }
        }
      }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    res.status(200).json({ jobLead });
  } catch (error) {
    console.error('Get job lead error:', error);
    res.status(500).json({ error: 'Failed to get job lead' });
  }
};

// Get my posted jobs (Homeowner)
export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const jobLeads = await prisma.jobLead.findMany({
      where: {
        postedBy: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch user details for purchasedBy and interests
    const enrichedJobLeads = await Promise.all(
      jobLeads.map(async (jobLead) => {
        // Get all unique user IDs from purchasedBy and interests
        const purchaserIds = jobLead.purchasedBy;
        const interestIds = (jobLead.interests as any[]).map((interest: any) => interest.tradespersonId);
        const allUserIds = [...new Set([...purchaserIds, ...interestIds])];

        // Fetch user details
        const users = await prisma.user.findMany({
          where: {
            id: {
              in: allUserIds
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            avatar: true,
            location: true,
            trades: true,
            rating: true,
            reviews: true,
            verified: true
          }
        });

        // Create a map for quick lookup
        const userMap = new Map(users.map(u => [u.id, u]));

        // Enrich interests with full user details
        const enrichedInterests = (jobLead.interests as any[]).map((interest: any) => ({
          ...interest,
          tradespersonDetails: userMap.get(interest.tradespersonId) || null
        }));

        return {
          ...jobLead,
          interests: enrichedInterests,
          purchasedByDetails: [...new Set(purchaserIds)].map(id => userMap.get(id)).filter(Boolean)
        };
      })
    );

    res.status(200).json({ jobLeads: enrichedJobLeads });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

// Purchase a job lead (Tradesperson)
export const purchaseJobLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get job lead
    const jobLead = await prisma.jobLead.findUnique({
      where: { id }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    // Check if already purchased
    if (jobLead.purchasedBy.includes(userId)) {
      res.status(400).json({ error: 'You have already purchased this job lead' });
      return;
    }

    // Check if max purchases reached
    if (jobLead.purchasedBy.length >= jobLead.maxPurchases) {
      res.status(400).json({ error: 'Maximum purchases reached for this job lead' });
      return;
    }

    // Get user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentCredits = parseFloat(user.credits?.toString() || '0');
    const jobPrice = parseFloat(jobLead.price.toString());

    if (currentCredits < jobPrice) {
      res.status(400).json({ error: 'Insufficient credits' });
      return;
    }

    // Update job lead and user credits in a transaction
    const [updatedJobLead] = await prisma.$transaction([
      prisma.jobLead.update({
        where: { id },
        data: {
          purchasedBy: {
            push: userId
          }
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: currentCredits - jobPrice
        }
      })
    ]);

    res.status(200).json({
      message: 'Job lead purchased successfully',
      jobLead: updatedJobLead
    });
  } catch (error) {
    console.error('Purchase job lead error:', error);
    res.status(500).json({ error: 'Failed to purchase job lead' });
  }
};

// Express interest in a job lead (Tradesperson)
export const expressInterest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { message, price } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get tradesperson info
    const tradesperson = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, type: true }
    });

    if (!tradesperson || tradesperson.type !== 'tradesperson') {
      res.status(403).json({ error: 'Only tradespeople can express interest' });
      return;
    }

    // Get job lead
    const jobLead = await prisma.jobLead.findUnique({
      where: { id }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    // Create interest object
    const interest = {
      id: crypto.randomUUID(),
      tradespersonId: userId,
      tradespersonName: tradesperson.name,
      message: message || '',
      price: price || 0,
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Add interest to job lead
    const updatedJobLead = await prisma.jobLead.update({
      where: { id },
      data: {
        interests: {
          push: interest
        }
      }
    });

    res.status(200).json({
      message: 'Interest expressed successfully',
      interest
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Failed to express interest' });
  }
};

// Update interest status (Homeowner)
export const updateInterestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { jobId, interestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get job lead
    const jobLead = await prisma.jobLead.findUnique({
      where: { id: jobId }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    // Check if user is the poster
    if (jobLead.postedBy !== userId) {
      res.status(403).json({ error: 'Only the job poster can update interest status' });
      return;
    }

    // Update interest status
    const updatedInterests = (jobLead.interests as any[]).map((interest: any) => {
      if (interest.id === interestId) {
        return { ...interest, status };
      }
      return interest;
    });

    const updatedJobLead = await prisma.jobLead.update({
      where: { id: jobId },
      data: {
        interests: updatedInterests,
        ...(status === 'accepted' && {
          hiredTradesperson: (jobLead.interests as any[]).find((i: any) => i.id === interestId)?.tradespersonId
        })
      }
    });

    res.status(200).json({
      message: 'Interest status updated successfully',
      jobLead: updatedJobLead
    });
  } catch (error) {
    console.error('Update interest status error:', error);
    res.status(500).json({ error: 'Failed to update interest status' });
  }
};

// Update job lead
export const updateJobLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get job lead
    const jobLead = await prisma.jobLead.findUnique({
      where: { id }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    // Check if user is the poster
    if (jobLead.postedBy !== userId) {
      res.status(403).json({ error: 'Only the job poster can update this job' });
      return;
    }

    const {
      title,
      description,
      category,
      location,
      budget,
      urgency,
      contactDetails,
      isActive,
      hiredTradesperson
    } = req.body;

    const updatedJobLead = await prisma.jobLead.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(location && { location }),
        ...(budget && { budget }),
        ...(urgency && { urgency }),
        ...(contactDetails && { contactDetails }),
        ...(isActive !== undefined && { isActive }),
        ...(hiredTradesperson && { hiredTradesperson })
      }
    });

    res.status(200).json({
      message: 'Job lead updated successfully',
      jobLead: updatedJobLead
    });
  } catch (error) {
    console.error('Update job lead error:', error);
    res.status(500).json({ error: 'Failed to update job lead' });
  }
};

// Delete job lead
export const deleteJobLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get job lead
    const jobLead = await prisma.jobLead.findUnique({
      where: { id }
    });

    if (!jobLead) {
      res.status(404).json({ error: 'Job lead not found' });
      return;
    }

    // Check if user is the poster
    if (jobLead.postedBy !== userId) {
      res.status(403).json({ error: 'Only the job poster can delete this job' });
      return;
    }

    await prisma.jobLead.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Job lead deleted successfully' });
  } catch (error) {
    console.error('Delete job lead error:', error);
    res.status(500).json({ error: 'Failed to delete job lead' });
  }
};
