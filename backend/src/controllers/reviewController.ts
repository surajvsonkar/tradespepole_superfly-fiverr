import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a review
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      jobId,
      tradespersonId,
      rating,
      comment
    } = req.body;

    // Validate required fields
    if (!jobId || !tradespersonId || !rating || !comment) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        jobId,
        tradespersonId,
        homeownerId: userId,
        rating,
        comment
      },
      include: {
        tradesperson: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        homeowner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Update tradesperson's average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { tradespersonId },
      select: { rating: true }
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await prisma.user.update({
      where: { id: tradespersonId },
      data: {
        rating: avgRating,
        reviews: allReviews.length
      }
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for a user (tradesperson)
export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        tradespersonId: id
      },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.review.count({
      where: { tradespersonId: id }
    });

    res.status(200).json({
      reviews,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Get review by ID
export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        tradesperson: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        homeowner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.status(200).json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
};

// Get recent reviews (for landing page)
export const getRecentReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '3' } = req.query;

    const reviews = await prisma.review.findMany({
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true
          }
        },
        tradesperson: {
          select: {
            id: true,
            name: true,
            trades: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ error: 'Failed to get recent reviews' });
  }
};
