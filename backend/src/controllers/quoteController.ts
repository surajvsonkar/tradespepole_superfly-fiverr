import { Response } from 'express';
import prisma from '../configs/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendEmail, sendSMS } from '../utils/notifications';
import crypto from 'crypto';

// Create a quote request (Homeowner)
export const createQuoteRequest = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		// Get homeowner info
		const homeowner = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, type: true },
		});

		if (!homeowner || homeowner.type !== 'homeowner') {
			res
				.status(403)
				.json({ error: 'Only homeowners can create quote requests' });
			return;
		}

		const {
			projectTitle,
			projectDescription,
			category,
			location,
			budget,
			urgency,
			contactDetails,
			maxResponses,
		} = req.body;

		// Validate required fields
		if (
			!projectTitle ||
			!projectDescription ||
			!category ||
			!location ||
			!budget ||
			!contactDetails
		) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		const quoteRequest = await prisma.quoteRequest.create({
			data: {
				homeownerId: userId,
				homeownerName: homeowner.name,
				projectTitle,
				projectDescription,
				category,
				location,
				budget,
				urgency: urgency || 'Medium',
				contactDetails,
				maxResponses: maxResponses || 5,
			},
			include: {
				homeowner: {
					select: {
						id: true,
						name: true,
						email: true,
						location: true,
					},
				},
			},
		});

		res.status(201).json({
			message: 'Quote request created successfully',
			quoteRequest,
		});
	} catch (error) {
		console.error('Create quote request error:', error);
		res.status(500).json({ error: 'Failed to create quote request' });
	}
};

// Get all quote requests (with filters)
export const getQuoteRequests = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const {
			category,
			location,
			urgency,
			limit = '20',
			offset = '0',
		} = req.query;

		const where: any = {};

		if (category) {
			where.category = category as string;
		}

		if (location) {
			where.location = {
				contains: location as string,
				mode: 'insensitive',
			};
		}

		if (urgency) {
			where.urgency = urgency as string;
		}

		const quoteRequests = await prisma.quoteRequest.findMany({
			where,
			include: {
				homeowner: {
					select: {
						id: true,
						name: true,
						location: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: parseInt(limit as string),
			skip: parseInt(offset as string),
		});

		const total = await prisma.quoteRequest.count({ where });

		res.status(200).json({
			quoteRequests,
			pagination: {
				total,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
			},
		});
	} catch (error) {
		console.error('Get quote requests error:', error);
		res.status(500).json({ error: 'Failed to get quote requests' });
	}
};

// Get quote request by ID
export const getQuoteRequestById = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const quoteRequest = await prisma.quoteRequest.findUnique({
			where: { id },
			include: {
				homeowner: {
					select: {
						id: true,
						name: true,
						email: true,
						location: true,
					},
				},
			},
		});

		if (!quoteRequest) {
			res.status(404).json({ error: 'Quote request not found' });
			return;
		}

		// Enrich responses with tradesperson details
		const enrichedResponses = await Promise.all(
			(quoteRequest.responses as any[]).map(async (response) => {
				const tradesperson = await prisma.user.findUnique({
					where: { id: response.tradespersonId },
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
						avatar: true,
						rating: true,
						trades: true,
						verified: true
					}
				});

				const isAccepted = response.status === 'accepted';

				return {
					...response,
					tradespersonDetails: tradesperson ? {
						id: tradesperson.id,
						name: tradesperson.name,
						avatar: tradesperson.avatar,
						rating: tradesperson.rating,
						trades: tradesperson.trades,
						verified: tradesperson.verified,
						// Reveal contact info only if accepted
						email: isAccepted ? tradesperson.email : undefined,
						phone: isAccepted ? tradesperson.phone : undefined,
					} : null
				};
			})
		);

		res.status(200).json({ 
			quoteRequest: {
				...quoteRequest,
				responses: enrichedResponses
			} 
		});
	} catch (error) {
		console.error('Get quote request error:', error);
		res.status(500).json({ error: 'Failed to get quote request' });
	}
};

// Get my quote requests (Homeowner)
export const getMyQuoteRequests = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		const quoteRequests = await prisma.quoteRequest.findMany({
			where: {
				homeownerId: userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Enrich responses for each quote request
		const enrichedQuoteRequests = await Promise.all(
			quoteRequests.map(async (qr) => {
				const enrichedResponses = await Promise.all(
					(qr.responses as any[]).map(async (response) => {
						const tradesperson = await prisma.user.findUnique({
							where: { id: response.tradespersonId },
							select: {
								id: true,
								name: true,
								email: true,
								phone: true,
								avatar: true,
								rating: true,
								trades: true,
								verified: true
							}
						});

						const isAccepted = response.status === 'accepted';

						return {
							...response,
							tradespersonDetails: tradesperson ? {
								id: tradesperson.id,
								name: tradesperson.name,
								avatar: tradesperson.avatar,
								rating: tradesperson.rating,
								trades: tradesperson.trades,
								verified: tradesperson.verified,
								// Reveal contact info only if accepted
								email: isAccepted ? tradesperson.email : undefined,
								phone: isAccepted ? tradesperson.phone : undefined,
							} : null
						};
					})
				);

				return {
					...qr,
					responses: enrichedResponses
				};
			})
		);

		res.status(200).json({ quoteRequests: enrichedQuoteRequests });
	} catch (error) {
		console.error('Get my quote requests error:', error);
		res.status(500).json({ error: 'Failed to get quote requests' });
	}
};

// Submit a quote response (Tradesperson)
export const submitQuoteResponse = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const {
			quotedPrice,
			description,
			timeline,
			paidAmount,
			membershipDiscount,
		} = req.body;

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		// Get tradesperson info
		const tradesperson = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, type: true },
		});

		if (!tradesperson || tradesperson.type !== 'tradesperson') {
			res
				.status(403)
				.json({ error: 'Only tradespeople can submit quote responses' });
			return;
		}

		// Validate required fields
		if (!quotedPrice || !description || !timeline) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		// Get quote request
		const quoteRequest = await prisma.quoteRequest.findUnique({
			where: { id },
		});

		if (!quoteRequest) {
			res.status(404).json({ error: 'Quote request not found' });
			return;
		}

		// Check if max responses reached
		if ((quoteRequest.responses as any[]).length >= quoteRequest.maxResponses) {
			res
				.status(400)
				.json({ error: 'Maximum responses reached for this quote request' });
			return;
		}

		// Check if tradesperson already responded
		const alreadyResponded = (quoteRequest.responses as any[]).some(
			(response: any) => response.tradespersonId === userId
		);

		if (alreadyResponded) {
			res
				.status(400)
				.json({ error: 'You have already responded to this quote request' });
			return;
		}

		// Create response object
		const response = {
			id: crypto.randomUUID(),
			tradespersonId: userId,
			tradespersonName: tradesperson.name,
			quotedPrice,
			description,
			timeline,
			paidAmount: paidAmount || 0,
			membershipDiscount: membershipDiscount || 0,
			createdAt: new Date().toISOString(),
			status: 'pending',
		};

		// Add response to quote request
		const updatedQuoteRequest = await prisma.quoteRequest.update({
			where: { id },
			data: {
				responses: {
					push: response,
				},
			},
		});

		res.status(200).json({
			message: 'Quote response submitted successfully',
			response,
		});
	} catch (error) {
		console.error('Submit quote response error:', error);
		res.status(500).json({ error: 'Failed to submit quote response' });
	}
};

// Update quote response status (Homeowner)
export const updateQuoteResponseStatus = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { quoteId, responseId } = req.params;
		const { status } = req.body; // 'accepted' or 'declined'

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (!['accepted', 'declined'].includes(status)) {
			res.status(400).json({ error: 'Invalid status' });
			return;
		}

		// Get quote request
		const quoteRequest = await prisma.quoteRequest.findUnique({
			where: { id: quoteId },
		});

		if (!quoteRequest) {
			res.status(404).json({ error: 'Quote request not found' });
			return;
		}

		// Check if user is the homeowner
		if (quoteRequest.homeownerId !== userId) {
			res
				.status(403)
				.json({ error: 'Only the homeowner can update response status' });
			return;
		}

		// Update response status
		const updatedResponses = (quoteRequest.responses as any[]).map(
			(response: any) => {
				if (response.id === responseId) {
					return { ...response, status };
				}
				return response;
			}
		);

		const updatedQuoteRequest = await prisma.quoteRequest.update({
			where: { id: quoteId },
			data: {
				responses: updatedResponses,
			},
		});

		// Trigger notifications if status is accepted
		if (status === 'accepted') {
			try {
				const acceptedResponse = updatedResponses.find((r: any) => r.id === responseId);
				if (acceptedResponse) {
					const tradesperson = await prisma.user.findUnique({
						where: { id: acceptedResponse.tradespersonId },
						select: { email: true, phone: true, name: true }
					});

					if (tradesperson) {
						// Send Email
						const emailSubject = `Quote Accepted: ${quoteRequest.projectTitle}`;
						const emailText = `Hi ${tradesperson.name},\n\nYour quote for "${quoteRequest.projectTitle}" has been accepted by the homeowner. You can now contact them to discuss further.\n\nBest regards,\n24/7 Tradespeople Team`;
						const emailHtml = `
							<div style="font-family: sans-serif;">
								<h2>Congratulations!</h2>
								<p>Your quote for <strong>${quoteRequest.projectTitle}</strong> has been accepted.</p>
								<p>You can now view the homeowner's contact details in your dashboard.</p>
								<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a>
							</div>
						`;
						await sendEmail(tradesperson.email, emailSubject, emailText, emailHtml);

						// Send SMS
						if (tradesperson.phone) {
							const smsMessage = `24/7 Tradespeople: Your quote for "${quoteRequest.projectTitle}" has been accepted! Login to view details.`;
							await sendSMS(tradesperson.phone, smsMessage);
						}
					}
				}
			} catch (notificationError) {
				console.error('Error sending quote acceptance notification:', notificationError);
			}
		}

		res.status(200).json({
			message: 'Quote response status updated successfully',
			quoteRequest: updatedQuoteRequest,
		});
	} catch (error) {
		console.error('Update quote response status error:', error);
		res.status(500).json({ error: 'Failed to update quote response status' });
	}
};

// Delete quote request
export const deleteQuoteRequest = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.userId;
		const { id } = req.params;

		if (!userId) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		// Get quote request
		const quoteRequest = await prisma.quoteRequest.findUnique({
			where: { id },
		});

		if (!quoteRequest) {
			res.status(404).json({ error: 'Quote request not found' });
			return;
		}

		// Check if user is the homeowner
		if (quoteRequest.homeownerId !== userId) {
			res
				.status(403)
				.json({ error: 'Only the homeowner can delete this quote request' });
			return;
		}

		await prisma.quoteRequest.delete({
			where: { id },
		});

		res.status(200).json({ message: 'Quote request deleted successfully' });
	} catch (error) {
		console.error('Delete quote request error:', error);
		res.status(500).json({ error: 'Failed to delete quote request' });
	}
};
