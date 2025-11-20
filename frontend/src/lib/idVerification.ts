import { userService } from '../services/userService';

export interface VerificationData {
  documentType: string;
  frontImage: File;
  backImage?: File;
  selfieImage: File;
  personalDetails: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    postcode: string;
    phoneNumber: string;
  };
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
  checkId?: string;
  status?: string;
  error?: string;
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const submitVerification = async (
  userId: string,
  verificationData: VerificationData
): Promise<VerificationResponse> => {
  try {
    // In a real implementation, we would upload images to a server/storage
    // and send the data to a verification provider (like Yoti, Onfido, etc.)
    // For now, we'll simulate the process
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Convert images to base64 (just to validate they can be processed)
    await fileToBase64(verificationData.frontImage);
    await fileToBase64(verificationData.selfieImage);
    if (verificationData.backImage) {
      await fileToBase64(verificationData.backImage);
    }

    // We can't actually verify the user on the backend without an admin endpoint or external service
    // So we'll return a success response that indicates the request was received
    
    return {
      success: true,
      message: 'Verification submitted successfully',
      checkId: `check_${Date.now()}`,
      status: 'PENDING'
    };
  } catch (error) {
    console.error('Verification submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during verification'
    };
  }
};

export const checkVerificationStatus = async (userId: string) => {
  try {
    const response = await userService.getUserById(userId);
    const user = response.user;

    return {
      status: user.verificationStatus || 'none',
      verified: user.verified,
      data: null // We don't expose verification data in the public profile
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return null;
  }
};