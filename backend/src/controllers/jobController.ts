import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { geocodePostcode, calculateDistanceMiles, DEFAULT_POSTCODE, DEFAULT_COORDS, DEFAULT_JOB_RADIUS_MILES } from '../utils/geocoding';

// Initialize Twilio
const twilioClient = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Helper to send SMS
const sendSMS = async (to: string, message: string) => {
	if (!TWILIO_PHONE || !process.env.TWILIO_ACCOUNT_SID) {
		console.log('📱 Twilio not configured. SMS would be:', { to, message });
		return;
	}

	try {
		await twilioClient.messages.create({
			body: message,
			from: TWILIO_PHONE,
			to
		});
		console.log(`✅ SMS sent to ${to}`);
	} catch (error) {
		console.error('❌ Failed to send SMS:', error);
	}
};

// Helper to send email
const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
	if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
		console.log('\n📧 Email would be sent:');
		console.log('To:', to);
		console.log('Subject:', subject);
		console.log('Content:', text);
		return;
	}

	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.SMTP_EMAIL,
				pass: process.env.SMTP_PASSWORD
			}
		});

		await transporter.sendMail({
			from: process.env.SMTP_EMAIL,
			to,
			subject,
			text,
			html
		});
		console.log(`✅ Email sent to ${to}`);
	} catch (error) {
		console.error('❌ Failed to send email:', error);
	}
};

// Helper to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 3959; // Earth's radius in miles
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
		Math.sin(dLon/2) * Math.sin(dLon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return R * c;
};

// Notify tradespeople when a new job is posted in their area
const notifyNearbyTradespeople = async (jobLead: any) => {
	try {
		// Only notify if job has coordinates
		if (!jobLead.latitude || !jobLead.longitude) {
			console.log('Job has no coordinates, skipping notification');
			return;
		}

		// Find all tradespeople with:
		// 1. Active account
		// 2. Matching trade/category (optional, can match category)
		// 3. Have a working area defined OR are within a default radius
		const tradespeople = await prisma.user.findMany({
			where: {
				type: 'tradesperson',
				accountStatus: 'active',
				isEmailVerified: true
			},
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				trades: true,
				latitude: true,
				longitude: true,
				workingArea: true,
				location: true
			}
		});

		const jobLat = Number(jobLead.latitude);
		const jobLng = Number(jobLead.longitude);

		let notifiedCount = 0;

		for (const tradesperson of tradespeople) {
			let shouldNotify = false;
			let distance = 0;

			// Check if tradesperson has coordinates
			if (tradesperson.latitude && tradesperson.longitude) {
				const tradeLat = Number(tradesperson.latitude);
				const tradeLng = Number(tradesperson.longitude);
				distance = calculateDistance(jobLat, jobLng, tradeLat, tradeLng);

				// Get working area radius (default 15 miles)
				const workingArea = tradesperson.workingArea as any;
				const radiusMiles = workingArea?.radius || DEFAULT_JOB_RADIUS_MILES;

				if (distance <= radiusMiles) {
					shouldNotify = true;
				}
			} else {
				// If no coordinates, check if locations match by text
				if (tradesperson.location && jobLead.location) {
					const tradeLocation = tradesperson.location.toLowerCase();
					const jobLocation = jobLead.location.toLowerCase();
					// Check if they're in the same city
					if (tradeLocation.includes(jobLocation.split(',')[0]) || 
						jobLocation.includes(tradeLocation.split(',')[0])) {
						shouldNotify = true;
						distance = 0;
					}
				}
			}

			// Also check if tradesperson's trades match the job category
			const matchesTrade = tradesperson.trades.some(
				(trade: string) => trade.toLowerCase().includes(jobLead.category.toLowerCase()) ||
				jobLead.category.toLowerCase().includes(trade.toLowerCase())
			);

			// Only notify if within area AND matches trade (or no trades defined)
			if (shouldNotify && (matchesTrade || tradesperson.trades.length === 0)) {
				const distanceText = distance > 0 ? `${distance.toFixed(1)} miles away` : 'in your area';
				
				// Send SMS if phone available
				if (tradesperson.phone) {
					const smsMessage = `🔔 New Job Alert!\n\n"${jobLead.title}" - ${distanceText}\nLocation: ${jobLead.location}\nBudget: ${jobLead.budget}\n\nLogin to view details and express interest!`;
					await sendSMS(tradesperson.phone, smsMessage);
				}

				// Send Email
				if (tradesperson.email) {
					const emailSubject = `🔔 New Job Opportunity: ${jobLead.title}`;
					const emailText = `
Hi ${tradesperson.name},

A new job has been posted in your area!

📋 Job Details:
- Title: ${jobLead.title}
- Category: ${jobLead.category}
- Location: ${jobLead.location} (${distanceText})
- Budget: ${jobLead.budget}
- Urgency: ${jobLead.urgency}

📝 Description:
${jobLead.description}

Login to your account to view full details and express your interest!

Best regards,
24/7 Tradespeople Team
					`;
					
					const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
	<div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px; text-align: center;">
		<h1 style="color: white; margin: 0;">🔔 New Job Alert!</h1>
	</div>
	<div style="padding: 20px; background: #f9fafb;">
		<p>Hi <strong>${tradesperson.name}</strong>,</p>
		<p>A new job has been posted in your area!</p>
		
		<div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
			<h2 style="color: #1f2937; margin-top: 0;">${jobLead.title}</h2>
			<p style="color: #6b7280; margin: 5px 0;"><strong>📍 Location:</strong> ${jobLead.location} (${distanceText})</p>
			<p style="color: #6b7280; margin: 5px 0;"><strong>💰 Budget:</strong> ${jobLead.budget}</p>
			<p style="color: #6b7280; margin: 5px 0;"><strong>⚡ Urgency:</strong> ${jobLead.urgency}</p>
			<p style="color: #6b7280; margin: 5px 0;"><strong>🏷️ Category:</strong> ${jobLead.category}</p>
			<p style="color: #374151; margin-top: 15px;">${jobLead.description}</p>
		</div>
		
		<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
			View Job Details
		</a>
		
		<p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
			You're receiving this because you're registered as a tradesperson in this area.
		</p>
	</div>
</div>
					`;
					
					await sendEmail(tradesperson.email, emailSubject, emailText, emailHtml);
				}

				notifiedCount++;
			}
		}

		console.log(`📢 Notified ${notifiedCount} tradespeople about new job: ${jobLead.title}`);
	} catch (error) {
		console.error('Error notifying tradespeople:', error);
	}
};

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
      postcode,
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

    // Use provided postcode or default
    const jobPostcode = postcode || DEFAULT_POSTCODE;

    // Geocode the postcode to get coordinates if not provided
    let jobLatitude = latitude ? parseFloat(latitude) : null;
    let jobLongitude = longitude ? parseFloat(longitude) : null;

    if (!jobLatitude || !jobLongitude) {
      const geocodeResult = await geocodePostcode(jobPostcode);
      if (geocodeResult) {
        jobLatitude = geocodeResult.lat;
        jobLongitude = geocodeResult.lng;
        console.log(`📍 Geocoded postcode ${jobPostcode} to: ${jobLatitude}, ${jobLongitude}`);
      } else {
        // Use default coordinates if geocoding fails
        jobLatitude = DEFAULT_COORDS.lat;
        jobLongitude = DEFAULT_COORDS.lng;
        console.log(`📍 Using default coordinates for postcode ${jobPostcode}`);
      }
    }

    const jobLead = await prisma.jobLead.create({
      data: {
        title,
        description,
        category,
        location,
        postcode: jobPostcode,
        budget,
        urgency: urgency || 'Medium',
        postedBy: userId,
        contactDetails,
        maxPurchases: maxPurchases || 6,
        price: price || 9.99,
        isActive: true,
        latitude: jobLatitude,
        longitude: jobLongitude
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

    // Notify tradespeople in the job's area (async, don't wait)
    notifyNearbyTradespeople(jobLead).catch(err => 
      console.error('Failed to notify tradespeople:', err)
    );

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
    const userId = req.userId;
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

    let jobLeads = await prisma.jobLead.findMany({
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
      take: parseInt(limit as string) * 2, // Fetch extra to account for radius filtering
      skip: parseInt(offset as string)
    });

    // If user is a tradesperson, filter jobs by their postcode radius
    if (userId) {
      const tradesperson = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          type: true,
          workPostcode: true,
          jobRadius: true,
          latitude: true,
          longitude: true,
          workingArea: true
        }
      });

      if (tradesperson && tradesperson.type === 'tradesperson') {
        // Get tradesperson's coordinates
        let tradeLat: number | null = null;
        let tradeLng: number | null = null;
        let radiusMiles = tradesperson.jobRadius || DEFAULT_JOB_RADIUS_MILES;

        // Try to get coordinates from workingArea first
        const workingArea = tradesperson.workingArea as any;
        if (workingArea?.coordinates) {
          tradeLat = workingArea.coordinates.lat;
          tradeLng = workingArea.coordinates.lng;
          radiusMiles = workingArea.radius || radiusMiles;
        } else if (tradesperson.latitude && tradesperson.longitude) {
          tradeLat = Number(tradesperson.latitude);
          tradeLng = Number(tradesperson.longitude);
        } else {
          // Geocode tradesperson's postcode
          const tradePostcode = tradesperson.workPostcode || DEFAULT_POSTCODE;
          const geocodeResult = await geocodePostcode(tradePostcode);
          if (geocodeResult) {
            tradeLat = geocodeResult.lat;
            tradeLng = geocodeResult.lng;
          } else {
            tradeLat = DEFAULT_COORDS.lat;
            tradeLng = DEFAULT_COORDS.lng;
          }
        }

        // Filter jobs by radius
        if (tradeLat !== null && tradeLng !== null) {
          jobLeads = jobLeads.filter(job => {
            if (!job.latitude || !job.longitude) {
              return true; // Include jobs without coordinates
            }
            const jobLat = Number(job.latitude);
            const jobLng = Number(job.longitude);
            const distance = calculateDistanceMiles(tradeLat!, tradeLng!, jobLat, jobLng);
            
            // Add distance to job for display purposes
            (job as any).distanceFromTradesperson = Math.round(distance * 10) / 10;
            
            return distance <= radiusMiles;
          });

          // Sort by distance
          jobLeads.sort((a, b) => {
            const distA = (a as any).distanceFromTradesperson || 0;
            const distB = (b as any).distanceFromTradesperson || 0;
            return distA - distB;
          });

          console.log(`📍 Filtered jobs for tradesperson (radius: ${radiusMiles} miles): ${jobLeads.length} jobs found`);
        }
      }
    }

    // Apply limit after filtering
    jobLeads = jobLeads.slice(0, parseInt(limit as string));

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
