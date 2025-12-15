import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Review, JobLead, QuoteRequest } from '../types';
import { authService, getAuthToken } from '../services';
import { reviewService } from '../services/reviewService';

const initialState: AppState = {
  currentUser: null,
  currentView: 'home',
  serviceFilter: null,
  quoteRequests: [],
  jobLeads: [],
  users: [],
  reviews: [],
  conversations: [],
  showAuthModal: false,
  authMode: 'login',
  userType: 'homeowner',
  isLoading: true
};

type Action = 
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_VIEW_WITH_FILTER'; payload: { view: string; filter?: string } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SHOW_AUTH_MODAL'; payload: { mode: 'login' | 'signup'; userType: 'homeowner' | 'tradesperson' } }
  | { type: 'HIDE_AUTH_MODAL' }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'PARK_ACCOUNT'; payload: string }
  | { type: 'REACTIVATE_ACCOUNT'; payload: string }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'UPDATE_JOB_LEADS'; payload: JobLead[] }
  | { type: 'HIRE_TRADESPERSON'; payload: { jobId: string; tradespersonId: string } }
  | { type: 'ACCEPT_INTEREST'; payload: { leadId: string; interestId: string } }
  | { type: 'CREATE_CONVERSATION'; payload: { jobId: string; homeownerId: string; tradespersonId: string } }
  | { type: 'SET_CONVERSATIONS'; payload: any[] }
  | { type: 'UPDATE_CONVERSATION'; payload: any }
  | { type: 'PURCHASE_LEAD'; payload: { leadId: string; tradespersonId: string; price: number } }
  | { type: 'EXPRESS_INTEREST'; payload: { leadId: string; tradespersonId: string; message: string; price: number } }
  | { type: 'EXPRESS_INTEREST'; payload: { leadId: string; tradespersonId: string; message: string; price: number } }
  | { type: 'DISMISS_JOB'; payload: { jobId: string; tradespersonId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'ADD_QUOTE_REQUEST'; payload: QuoteRequest }
  | { type: 'RESPOND_TO_QUOTE'; payload: { quoteId: string; response: any } }
  | { type: 'RESPOND_TO_QUOTE'; payload: { quoteId: string; response: any } }
  | { type: 'ACCEPT_QUOTE_RESPONSE'; payload: { quoteId: string; responseId: string } }
  | { type: 'SET_USERS'; payload: User[] };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_VIEW_WITH_FILTER':
      return { 
        ...state, 
        currentView: action.payload.view,
        serviceFilter: action.payload.filter || null
      };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'UPDATE_USER':
      return { 
        ...state, 
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...action.payload } 
          : null 
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SHOW_AUTH_MODAL':
      return { 
        ...state, 
        showAuthModal: true, 
        authMode: action.payload.mode,
        userType: action.payload.userType
      };
    case 'HIDE_AUTH_MODAL':
      return { ...state, showAuthModal: false };
    case 'ADD_REVIEW':
      return { ...state, reviews: [...state.reviews, action.payload] };
    case 'PARK_ACCOUNT':
      return {
        ...state,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          accountStatus: 'parked',
          parkedDate: new Date().toISOString()
        } : null
      };
    case 'REACTIVATE_ACCOUNT':
      return {
        ...state,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          accountStatus: 'active',
          reactivatedDate: new Date().toISOString()
        } : null
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        currentUser: null,
        currentView: 'home'
      };
    case 'UPDATE_JOB_LEADS':
      return { ...state, jobLeads: action.payload };
    case 'HIRE_TRADESPERSON':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.jobId
            ? { ...lead, hiredTradesperson: action.payload.tradespersonId, isActive: false }
            : lead
        )
      };
    case 'ACCEPT_INTEREST':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? {
                ...lead,
                interests: lead.interests.map(interest =>
                  interest.id === action.payload.interestId
                    ? { ...interest, status: 'accepted' as const }
                    : interest
                )
              }
            : lead
        )
      };
    case 'CREATE_CONVERSATION':
      // This would create a new conversation - for now just return state
      // In a real app, this would add to state.conversations
      return state;
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        )
      };
    case 'PURCHASE_LEAD':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? { ...lead, purchasedBy: [...lead.purchasedBy, action.payload.tradespersonId] }
            : lead
        ),
        currentUser: state.currentUser ? {
          ...state.currentUser,
          credits: (state.currentUser.credits || 0) - action.payload.price
        } : null
      };
    case 'EXPRESS_INTEREST':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? {
                ...lead,
                interests: [
                  ...lead.interests,
                  {
                    id: `interest_${Date.now()}`,
                    tradespersonId: action.payload.tradespersonId,
                    tradespersonName: state.currentUser?.name || 'Unknown',
                    message: action.payload.message,
                    date: new Date().toLocaleDateString(),
                    status: 'pending' as const,
                    price: action.payload.price
                  }
                ]
              }
            : lead
        )
      };
    case 'DISMISS_JOB':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.jobId
            ? {
                ...lead,
                dismissedBy: [...(lead.dismissedBy || []), action.payload.tradespersonId]
              }
            : lead
        )
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'ADD_QUOTE_REQUEST':
      return {
        ...state,
        quoteRequests: [action.payload, ...state.quoteRequests]
      };
    case 'RESPOND_TO_QUOTE':
      return {
        ...state,
        quoteRequests: state.quoteRequests.map(req =>
          req.id === action.payload.quoteId
            ? { ...req, responses: [...req.responses, action.payload.response] }
            : req
        )
      };
    case 'ACCEPT_QUOTE_RESPONSE':
      return {
        ...state,
        quoteRequests: state.quoteRequests.map(req =>
          req.id === action.payload.quoteId
            ? {
                ...req,
                responses: req.responses.map(res =>
                  res.id === action.payload.responseId
                    ? { ...res, status: 'accepted' as const }
                    : res
                )
              }
            : req
        )
      };
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Fetch reviews in parallel with auth check if possible, or sequentially
        // We want to load everything before showing the app
        
        const reviewsPromise = reviewService.getRecentReviews().catch(err => {
            console.error('Failed to fetch reviews:', err);
            return { reviews: [] };
        });

        const token = getAuthToken();
        const authPromise = token ? authService.getMe().catch(err => {
            console.error('Failed to initialize auth:', err);
            authService.logout();
            return null;
        }) : Promise.resolve(null);

        const [reviewsResponse, authResponse] = await Promise.all([reviewsPromise, authPromise]);

        if (reviewsResponse?.reviews) {
            dispatch({ type: 'SET_REVIEWS', payload: reviewsResponse.reviews });
        }

        if (authResponse?.user) {
            dispatch({ type: 'SET_USER', payload: authResponse.user });
        }

      } catch (error) {
        console.error('Unexpected error during initialization:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
