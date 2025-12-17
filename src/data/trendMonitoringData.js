// src/data/trendMonitoringData.js

// Monthly data for the last 12 months
export const monthlyDomainData = [
  { 
    month: "يناير", 
    monthEn: "January",
    total: 45,
    clinical: 28,
    management: 12,
    relational: 5
  },
  { 
    month: "فبراير", 
    monthEn: "February",
    total: 52,
    clinical: 32,
    management: 14,
    relational: 6
  },
  { 
    month: "مارس", 
    monthEn: "March",
    total: 48,
    clinical: 30,
    management: 13,
    relational: 5
  },
  { 
    month: "أبريل", 
    monthEn: "April",
    total: 56,
    clinical: 38,
    management: 12,
    relational: 6
  },
  { 
    month: "مايو", 
    monthEn: "May",
    total: 61,
    clinical: 42,
    management: 13,
    relational: 6
  },
  { 
    month: "يونيو", 
    monthEn: "June",
    total: 58,
    clinical: 40,
    management: 12,
    relational: 6
  },
  { 
    month: "يوليو", 
    monthEn: "July",
    total: 54,
    clinical: 35,
    management: 13,
    relational: 6
  },
  { 
    month: "أغسطس", 
    monthEn: "August",
    total: 49,
    clinical: 31,
    management: 12,
    relational: 6
  },
  { 
    month: "سبتمبر", 
    monthEn: "September",
    total: 47,
    clinical: 29,
    management: 13,
    relational: 5
  },
  { 
    month: "أكتوبر", 
    monthEn: "October",
    total: 53,
    clinical: 34,
    management: 13,
    relational: 6
  },
  { 
    month: "نوفمبر", 
    monthEn: "November",
    total: 50,
    clinical: 32,
    management: 12,
    relational: 6
  },
  { 
    month: "ديسمبر", 
    monthEn: "December",
    total: 44,
    clinical: 27,
    management: 12,
    relational: 5
  },
];

// Category breakdown data
export const monthlyCategoryData = [
  {
    month: "يناير",
    monthEn: "January",
    total: 45,
    medicalErrors: 18,
    lackOfCare: 15,
    communication: 8,
    administrative: 4
  },
  {
    month: "فبراير",
    monthEn: "February",
    total: 52,
    medicalErrors: 21,
    lackOfCare: 17,
    communication: 9,
    administrative: 5
  },
  {
    month: "مارس",
    monthEn: "March",
    total: 48,
    medicalErrors: 19,
    lackOfCare: 16,
    communication: 9,
    administrative: 4
  },
  {
    month: "أبريل",
    monthEn: "April",
    total: 56,
    medicalErrors: 24,
    lackOfCare: 18,
    communication: 10,
    administrative: 4
  },
  {
    month: "مايو",
    monthEn: "May",
    total: 61,
    medicalErrors: 27,
    lackOfCare: 20,
    communication: 10,
    administrative: 4
  },
  {
    month: "يونيو",
    monthEn: "June",
    total: 58,
    medicalErrors: 25,
    lackOfCare: 19,
    communication: 10,
    administrative: 4
  },
  {
    month: "يوليو",
    monthEn: "July",
    total: 54,
    medicalErrors: 22,
    lackOfCare: 18,
    communication: 10,
    administrative: 4
  },
  {
    month: "أغسطس",
    monthEn: "August",
    total: 49,
    medicalErrors: 20,
    lackOfCare: 16,
    communication: 9,
    administrative: 4
  },
  {
    month: "سبتمبر",
    monthEn: "September",
    total: 47,
    medicalErrors: 19,
    lackOfCare: 15,
    communication: 9,
    administrative: 4
  },
  {
    month: "أكتوبر",
    monthEn: "October",
    total: 53,
    medicalErrors: 22,
    lackOfCare: 17,
    communication: 10,
    administrative: 4
  },
  {
    month: "نوفمبر",
    monthEn: "November",
    total: 50,
    medicalErrors: 21,
    lackOfCare: 16,
    communication: 9,
    administrative: 4
  },
  {
    month: "ديسمبر",
    monthEn: "December",
    total: 44,
    medicalErrors: 18,
    lackOfCare: 14,
    communication: 8,
    administrative: 4
  },
];

// Thresholds/Limits for domains
export const domainLimits = {
  clinical: 35, // Monthly limit for clinical incidents
  management: 15, // Monthly limit for management incidents
  relational: 8, // Monthly limit for relational incidents
};

// Thresholds for categories
export const categoryLimits = {
  medicalErrors: 22,
  lackOfCare: 18,
  communication: 10,
  administrative: 5,
};
