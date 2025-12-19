import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// Get user by ID (public profile)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        verified: true,
        membershipType: true,
        verificationStatus: true,
        accountStatus: true,
        workingArea: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Only show active accounts publicly
    if (user.accountStatus !== 'active' && req.userId !== id) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      name,
      avatar,
      location,
      trades,
      workingArea
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(location !== undefined && { location }),
        ...(trades !== undefined && { trades }),
        ...(workingArea !== undefined && { workingArea })
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
        verified: true,
        credits: true,
        membershipType: true,
        membershipExpiry: true,
        verificationStatus: true,
        accountStatus: true,
        workingArea: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get all tradespeople with filters (only those with active directory listings)
export const getTradespeople = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      trade,
      location,
      verified,
      minRating,
      limit = '20',
      offset = '0',
      includeUnlisted = 'false' // For admin purposes
    } = req.query;

    const where: any = {
      type: 'tradesperson',
      accountStatus: 'active'
    };

    // Only show tradespeople with active directory listings (unless admin override)
    if (includeUnlisted !== 'true') {
      where.hasDirectoryListing = true;
      where.directoryListingExpiry = {
        gt: new Date()
      };
    }

    if (trade) {
      where.trades = {
        has: trade as string
      };
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }

    if (verified === 'true') {
      where.verified = true;
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating as string)
      };
    }

    const tradespeople = await prisma.user.findMany({
      where,
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
        verified: true,
        membershipType: true,
        workingArea: true,
        createdAt: true
      },
      orderBy: [
        { verified: 'desc' },
        { rating: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.user.count({ where });

    res.status(200).json({
      tradespeople,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Get tradespeople error:', error);
    res.status(500).json({ error: 'Failed to get tradespeople' });
  }
};

// Update membership
export const updateMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { membershipType } = req.body;

    if (!membershipType || !['none', 'basic', 'premium', 'unlimited_5_year'].includes(membershipType)) {
      res.status(400).json({ error: 'Invalid membership type' });
      return;
    }

    // Calculate expiry date
    let membershipExpiry = null;
    if (membershipType === 'unlimited_5_year') {
      membershipExpiry = new Date();
      membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 5);
    } else if (membershipType === 'basic' || membershipType === 'premium') {
      membershipExpiry = new Date();
      membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        membershipType,
        membershipExpiry
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        membershipType: true,
        membershipExpiry: true,
        credits: true
      }
    });

    res.status(200).json({
      message: 'Membership updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ error: 'Failed to update membership' });
  }
};

// Update credits
export const updateCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, operation } = req.body; // operation: 'add' or 'subtract'

    if (!amount || !operation) {
      res.status(400).json({ error: 'Amount and operation are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentCredits = parseFloat(user.credits?.toString() || '0');
    let newCredits = currentCredits;

    if (operation === 'add') {
      newCredits = currentCredits + parseFloat(amount);
    } else if (operation === 'subtract') {
      newCredits = currentCredits - parseFloat(amount);
      if (newCredits < 0) {
        res.status(400).json({ error: 'Insufficient credits' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Invalid operation' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: newCredits },
      select: {
        id: true,
        name: true,
        credits: true
      }
    });

    res.status(200).json({
      message: 'Credits updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
};

// Manage directory listing
export const manageDirectoryListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { action } = req.body; // 'cancel' | 'pause' | 'resume'

    if (!action || !['cancel', 'pause', 'resume'].includes(action)) {
      res.status(400).json({ error: 'Invalid action. Must be cancel, pause, or resume' });
      return;
    }

    const data: any = {};

    if (action === 'cancel') {
      data.hasDirectoryListing = false;
      data.directoryStatus = 'paused'; // Defaults to paused when not listed
    } else if (action === 'pause') {
      data.directoryStatus = 'paused';
    } else if (action === 'resume') {
      data.directoryStatus = 'active';
      data.hasDirectoryListing = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        hasDirectoryListing: true,
        directoryStatus: true
      }
    });

    res.status(200).json({
      message: `Directory listing ${action}d successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Manage directory listing error:', error);
    res.status(500).json({ error: 'Failed to manage directory listing' });
  }
};
