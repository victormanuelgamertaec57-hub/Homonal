// utils/hotmart.ts

// Usar un Product ID de ejemplo si no es proporcionado
const DEFAULT_PRODUCT_ID = '1234567';

export const buildHotmartUrl = (
  productId: string = DEFAULT_PRODUCT_ID, 
  email: string, 
  name: string, 
  plan: '1_week' | '4_weeks' | '12_weeks'
) => {
  // Mapear los planes a posibles offer codes de Hotmart
  const offerMap = {
    '1_week': 'OFFER_1_WEEK',
    '4_weeks': 'OFFER_4_WEEKS',
    '12_weeks': 'OFFER_12_WEEKS'
  };

  const offCode = offerMap[plan] || offerMap['4_weeks'];
  
  const baseUrl = `https://pay.hotmart.com/${productId}`;
  const params = new URLSearchParams({
    checkoutMode: '10',
    email: email,
    name: name,
    offCode: offCode,
    utm_source: 'metaads',
    utm_medium: 'quiz',
    utm_campaign: 'metodo-hormonal'
  });

  return `${baseUrl}?${params.toString()}`;
};
