
interface PricingSettings {
    defaultLeadPrice: number;
    maxLeadPurchases: number;
    directoryPrice: number;
    boostPlanPrices: Record<string, { price: number; duration: number; name: string }>;
}

export const DEFAULT_PRICING: PricingSettings = {
    defaultLeadPrice: 9.99,
    maxLeadPurchases: 6,
    directoryPrice: 0.99,
    boostPlanPrices: {
        '1_week_boost': { name: '1 Week Boost', price: 19.99, duration: 7 },
        '1_month_boost': { name: '1 Month Boost', price: 49.99, duration: 30 },
        '3_month_boost': { name: '3 Month Boost', price: 99.99, duration: 90 },
        '5_year_unlimited': { name: '5 Year Unlimited Leads', price: 995.00, duration: 1825 }
    }
};

export const getLeadPrice = (basePrice: number, membershipType: string | null): number => {
    // If user has unlimited 5-year membership, leads are free
    if (membershipType === 'unlimited_5_year') {
        return 0;
    }

    // Apply 20% discount for any membership upgrade or boost plan
    // basic, premium, premium_3_month, 1_week_boost, 1_month_boost, 3_month_boost are all boost memberships
    if (membershipType && membershipType !== 'none') {
        return Math.max(0.99, Number((basePrice * 0.80).toFixed(2))); // 20% discount
    }

    // No membership - full price
    return Math.max(0.99, Number(basePrice.toFixed(2)));
};

export const getBoostPrice = (planId: string, customPrices?: Record<string, any>): number => {
    const prices = customPrices || DEFAULT_PRICING.boostPlanPrices;
    const plan = prices[planId] || DEFAULT_PRICING.boostPlanPrices[planId];
    return plan ? plan.price : 0;
};
