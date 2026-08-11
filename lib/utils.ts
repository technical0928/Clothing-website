export const categoryMenuList = [
  {
    id: 1,
    title: "Lawn Shirts",
    icon: "👚",
    href: "/shop/lawn-shirts",
  },
  {
    id: 2,
    title: "Ethnic Shirts",
    icon: "👕",
    href: "/shop/ethnic-shirts",
  },
  {
    id: 3,
    title: "Formalwear",
    icon: "🎩",
    href: "/shop/formalwear",
  },
  {
    id: 4,
    title: "Partywear",
    icon: "🌟",
    href: "/shop/partywear",
  },
  {
    id: 5,
    title: "Accessories",
    icon: "🧣",
    href: "/shop/accessories",
  },
];

export const incentives = [
  {
    name: "Free Shipping",
    description:
      "Enjoy free delivery on all orders across Pakistan — no minimum spend required.",
    imageSrc: "/shipping icon.png",
  },
  {
    name: "24/7 Customer Support",
    description:
      "Our style advisors are available round the clock to help you with sizing, orders & more.",
    imageSrc: "/support icon.png",
  },
  {
    name: "Easy Returns",
    description:
      "Not the right fit? Return or exchange within 30 days — hassle-free.",
    imageSrc: "/fast shopping icon.png",
  },
];

export const navigation = {
  sale: [
    { name: "Seasonal Discounts", href: "/shop?sort=lowPrice" },
    { name: "New Arrivals", href: "/shop" },
    { name: "Clearance Sale", href: "/shop?price=3000" },
  ],
  about: [
    { name: "About Noor-e-Multan", href: "/about#about-noor-e-multan" },
    { name: "Careers", href: "/about#careers" },
    { name: "Our Story", href: "/about#our-story" },
  ],
  buy: [
    { name: "Noor-e-Multan Loyalty Card", href: "/support#loyalty-card" },
    { name: "Terms Of Use", href: "/support#terms" },
    { name: "Privacy Policy", href: "/support#privacy" },
    { name: "Size Guide", href: "/support#size-guide" },
    { name: "Fabric Care", href: "/support#fabric-care" },
  ],
  help: [
    { name: "Contact Us", href: "/support#contact" },
    { name: "How to Order", href: "/support#how-to-order" },
    { name: "FAQ", href: "/support#faq" },
  ],
};

export const isValidNameOrLastname = (input: string) => {
  // Simple name or lastname regex format check
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(input);
};

export const isValidEmailAddressFormat = (input: string) => {
  // simple email address format check
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(input);
};

export const isValidCardNumber = (input: string) => {
  // Remove all non-digit characters
  const cleanedInput = input.replace(/[^0-9]/g, "");
  
  // Check if the cleaned input has valid length (13-19 digits)
  if (!/^\d{13,19}$/.test(cleanedInput)) {
    return false;
  }
  
  // Implement Luhn algorithm for credit card validation
  return luhnCheck(cleanedInput);
};

/**
 * Luhn algorithm implementation for credit card validation
 * @param cardNumber - The credit card number as a string
 * @returns boolean - true if the card number is valid according to Luhn algorithm
 */
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Enhanced credit card validation with card type detection
 * @param input - The credit card number as a string
 * @returns object with validation result and card type
 */
export const validateCreditCard = (input: string) => {
  const cleanedInput = input.replace(/[^0-9]/g, "");
  
  // Basic length and format check
  if (!/^\d{13,19}$/.test(cleanedInput)) {
    return {
      isValid: false,
      cardType: 'unknown',
      error: 'Invalid card number format'
    };
  }
  
  // Luhn algorithm check
  if (!luhnCheck(cleanedInput)) {
    return {
      isValid: false,
      cardType: 'unknown',
      error: 'Invalid card number (Luhn check failed)'
    };
  }
  
  // Detect card type based on BIN (Bank Identification Number)
  const cardType = detectCardType(cleanedInput);
  
  return {
    isValid: true,
    cardType,
    error: null
  };
};

/**
 * Detect credit card type based on BIN patterns
 * @param cardNumber - The credit card number as a string
 * @returns string - The detected card type
 */
const detectCardType = (cardNumber: string): string => {
  const firstDigit = cardNumber[0];
  const firstTwoDigits = cardNumber.substring(0, 2);
  const firstFourDigits = cardNumber.substring(0, 4);
  const firstThreeDigits = cardNumber.substring(0, 3);
  
  // Visa: starts with 4
  if (firstDigit === '4') {
    return 'visa';
  }
  
  // Mastercard: starts with 5 or 2
  if (firstDigit === '5' || (firstTwoDigits >= '22' && firstTwoDigits <= '27')) {
    return 'mastercard';
  }
  
  // American Express: starts with 34 or 37
  if (firstTwoDigits === '34' || firstTwoDigits === '37') {
    return 'amex';
  }
  
  // Discover: starts with 6011, 65, or 644-649
  if (firstFourDigits === '6011' || firstTwoDigits === '65' || 
      (firstThreeDigits >= '644' && firstThreeDigits <= '649')) {
    return 'discover';
  }
  
  // Diners Club: starts with 300-305, 36, or 38
  if ((firstThreeDigits >= '300' && firstThreeDigits <= '305') || 
      firstTwoDigits === '36' || firstTwoDigits === '38') {
    return 'diners';
  }
  
  // JCB: starts with 35
  if (firstTwoDigits === '35') {
    return 'jcb';
  }
  
  return 'unknown';
};

export const isValidCreditCardExpirationDate = (input: string) => {
  // simple expiration date format check
  const regex = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/;
  return regex.test(input);
};

export const isValidCreditCardCVVOrCVC = (input: string) => {
  // simple CVV or CVC format check
  const regex = /^[0-9]{3,4}$/;
  return regex.test(input);
};
