// src/utils/reportHelpers.js

/**
 * Calculate domain percentages for seasonal reports
 * @param {Array} complaints - Array of complaint objects
 * @returns {Object} - { clinical: %, management: %, relational: % }
 */
export const calculateDomainPercentages = (complaints) => {
  const total = complaints.length;
  if (total === 0) return { clinical: 0, management: 0, relational: 0 };

  const clinical = complaints.filter(c => c.problemDomain?.toUpperCase() === 'CLINICAL').length;
  const management = complaints.filter(c => c.problemDomain?.toUpperCase() === 'MANAGEMENT').length;
  const relational = complaints.filter(c => c.problemDomain?.toUpperCase() === 'RELATIONAL').length;

  return {
    clinical: ((clinical / total) * 100).toFixed(2),
    management: ((management / total) * 100).toFixed(2),
    relational: ((relational / total) * 100).toFixed(2),
    clinicalCount: clinical,
    managementCount: management,
    relationalCount: relational,
    total
  };
};

/**
 * Check if domain percentage exceeds threshold
 * @param {number} percentage - Domain percentage
 * @param {number} threshold - Threshold value
 * @returns {boolean}
 */
export const exceedsThreshold = (percentage, threshold) => {
  return parseFloat(percentage) > parseFloat(threshold);
};

/**
 * Group complaints by category and subcategory for HCAT analysis
 * @param {Array} complaints - Array of complaint objects
 * @param {string} domain - Domain to filter (CLINICAL, MANAGEMENT, RELATIONAL)
 * @returns {Array} - Grouped HCAT data
 */
export const groupByHCAT = (complaints, domain) => {
  // Filter by domain
  const domainComplaints = complaints.filter(
    c => c.problemDomain?.toUpperCase() === domain.toUpperCase()
  );

  // Group by category and subcategory
  const grouped = {};

  domainComplaints.forEach(complaint => {
    const category = complaint.problemCategory || 'Unknown';
    const subCategory = complaint.subCategory || 'Unknown';
    const key = `${category}::${subCategory}`;

    if (!grouped[key]) {
      grouped[key] = {
        category,
        subCategory,
        classificationAr: complaint.classificationAr || '',
        classificationEn: complaint.classificationEn || '',
        complaints: [],
        count: 0,
        severityLow: 0,
        severityMedium: 0,
        severityHigh: 0
      };
    }

    grouped[key].complaints.push(complaint);
    grouped[key].count++;

    // Count severity
    const severity = complaint.severity?.toUpperCase();
    if (severity === 'LOW') grouped[key].severityLow++;
    else if (severity === 'MEDIUM') grouped[key].severityMedium++;
    else if (severity === 'HIGH') grouped[key].severityHigh++;
  });

  // Convert to array and calculate percentages
  const total = domainComplaints.length;
  const result = Object.values(grouped).map(item => ({
    ...item,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : 0
  }));

  return result;
};

/**
 * Check if category needs follow-up based on rules
 * Rules:
 * 1. Category % > threshold
 * 2. Medium severity > 2
 * 3. Low severity > 3
 */
export const needsFollowUp = (hcatItem, threshold) => {
  // Rule 1: Category percentage exceeds threshold
  if (parseFloat(hcatItem.percentage) > parseFloat(threshold)) {
    return { needed: true, reason: `Category percentage (${hcatItem.percentage}%) exceeds threshold (${threshold}%)` };
  }

  // Rule 2: Medium severity > 2
  if (hcatItem.severityMedium > 2) {
    return { needed: true, reason: `Medium severity count (${hcatItem.severityMedium}) exceeds limit (2)` };
  }

  // Rule 3: Low severity > 3
  if (hcatItem.severityLow > 3) {
    return { needed: true, reason: `Low severity count (${hcatItem.severityLow}) exceeds limit (3)` };
  }

  return { needed: false, reason: '' };
};

/**
 * Check if domain needs red flag based on high severity ratio
 * Rules:
 * - Clinical: > 3%
 * - Management: > 1%
 * - Relational: > 2%
 */
export const needsRedFlag = (domain, highCount, totalCount) => {
  if (totalCount === 0) return { needed: false, ratio: 0, threshold: 0 };

  const ratio = ((highCount / totalCount) * 100).toFixed(2);
  let threshold = 0;

  switch (domain.toUpperCase()) {
    case 'CLINICAL':
      threshold = 3;
      break;
    case 'MANAGEMENT':
      threshold = 1;
      break;
    case 'RELATIONAL':
      threshold = 2;
      break;
    default:
      threshold = 0;
  }

  return {
    needed: parseFloat(ratio) > threshold,
    ratio: parseFloat(ratio),
    threshold,
    reason: parseFloat(ratio) > threshold 
      ? `High severity ratio (${ratio}%) exceeds ${domain} threshold (${threshold}%)`
      : ''
  };
};

/**
 * Get all categories that need follow-up across all domains
 */
export const getFollowUpCategories = (complaints, thresholdMode, threshold) => {
  const domains = thresholdMode === 'clinical' 
    ? ['CLINICAL'] 
    : ['CLINICAL', 'MANAGEMENT', 'RELATIONAL'];

  const followUpItems = [];

  domains.forEach(domain => {
    const hcatData = groupByHCAT(complaints, domain);
    hcatData.forEach(item => {
      const followUp = needsFollowUp(item, threshold);
      if (followUp.needed) {
        followUpItems.push({
          domain,
          ...item,
          followUpReason: followUp.reason
        });
      }
    });
  });

  return followUpItems;
};

/**
 * Get all domains that need red flag
 */
export const getRedFlagDomains = (complaints) => {
  const domains = ['CLINICAL', 'MANAGEMENT', 'RELATIONAL'];
  const redFlagItems = [];

  domains.forEach(domain => {
    const domainComplaints = complaints.filter(
      c => c.problemDomain?.toUpperCase() === domain.toUpperCase()
    );
    const highCount = domainComplaints.filter(
      c => c.severity?.toUpperCase() === 'HIGH'
    ).length;

    const redFlag = needsRedFlag(domain, highCount, domainComplaints.length);
    if (redFlag.needed) {
      redFlagItems.push({
        domain,
        totalCount: domainComplaints.length,
        highCount,
        ...redFlag
      });
    }
  });

  return redFlagItems;
};

/**
 * Filter complaints by date range or month/year
 */
export const filterComplaintsByDate = (complaints, filters) => {
  return complaints.filter(complaint => {
    const complaintDate = new Date(complaint.dateReceived);

    // Use date range if both fromDate and toDate are set
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      return complaintDate >= from && complaintDate <= to;
    }

    // Otherwise use month/year
    if (filters.month && filters.year) {
      const complaintMonth = complaintDate.getMonth() + 1; // 1-12
      const complaintYear = complaintDate.getFullYear();
      return complaintMonth === parseInt(filters.month) && complaintYear === parseInt(filters.year);
    }

    return true;
  });
};

/**
 * Filter complaints by department hierarchy
 */
export const filterComplaintsByDepartment = (complaints, filters) => {
  return complaints.filter(complaint => {
    if (filters.building && complaint.building !== filters.building) return false;
    if (filters.idara && complaint.idara !== filters.idara) return false;
    if (filters.dayra && complaint.dayra !== filters.dayra) return false;
    if (filters.qism && complaint.qism !== filters.qism) return false;
    return true;
  });
};

/**
 * Calculate numeric statistics for monthly reports
 */
export const calculateMonthlyStats = (complaints) => {
  const total = complaints.length;
  
  // Severity distribution
  const severityHigh = complaints.filter(c => c.severity?.toUpperCase() === 'HIGH').length;
  const severityMedium = complaints.filter(c => c.severity?.toUpperCase() === 'MEDIUM').length;
  const severityLow = complaints.filter(c => c.severity?.toUpperCase() === 'LOW').length;

  // Domain distribution
  const clinical = complaints.filter(c => c.problemDomain?.toUpperCase() === 'CLINICAL').length;
  const management = complaints.filter(c => c.problemDomain?.toUpperCase() === 'MANAGEMENT').length;
  const relational = complaints.filter(c => c.problemDomain?.toUpperCase() === 'RELATIONAL').length;

  // Category grouping
  const categories = {};
  complaints.forEach(c => {
    const cat = c.problemCategory || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return {
    total,
    severity: {
      high: severityHigh,
      medium: severityMedium,
      low: severityLow,
      highPercent: total > 0 ? ((severityHigh / total) * 100).toFixed(2) : 0,
      mediumPercent: total > 0 ? ((severityMedium / total) * 100).toFixed(2) : 0,
      lowPercent: total > 0 ? ((severityLow / total) * 100).toFixed(2) : 0
    },
    domain: {
      clinical,
      management,
      relational,
      clinicalPercent: total > 0 ? ((clinical / total) * 100).toFixed(2) : 0,
      managementPercent: total > 0 ? ((management / total) * 100).toFixed(2) : 0,
      relationalPercent: total > 0 ? ((relational / total) * 100).toFixed(2) : 0
    },
    categories: Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(2) : 0
    })).sort((a, b) => b.count - a.count)
  };
};

/**
 * Calculate seasonal statistics for simplified seasonal reports
 * Only tracks total open cases and clinical percentage vs threshold
 */
export const calculateSeasonalStats = (complaints) => {
  // Filter only OPEN records
  const openRecords = complaints.filter(c => c.status?.toLowerCase() !== 'closed');
  
  const totalOpen = openRecords.length;
  const clinicalCount = openRecords.filter(c => c.problemDomain?.toUpperCase() === 'CLINICAL').length;
  const clinicalPercentage = totalOpen > 0 ? (clinicalCount / totalOpen) * 100 : 0;

  return {
    totalOpen,
    clinicalCount,
    clinicalPercentage,
    openRecords
  };
};

/**
 * Group open records by HCAT structure for official seasonal report
 * Groups by Domain -> Category -> Subcategory
 * Returns array matching official HCAT table format
 */
export const groupByHCATStructure = (complaints) => {
  // Filter only OPEN records
  const openRecords = complaints.filter(c => c.status?.toLowerCase() !== 'closed');

  // Group by Domain -> Category -> Subcategory
  const grouped = {};

  openRecords.forEach(record => {
    const domain = record.problemDomain || 'Unknown';
    const category = record.problemCategory || 'Unknown';
    const subCategory = record.subCategory || 'Unknown';
    const key = `${domain}::${category}::${subCategory}`;

    if (!grouped[key]) {
      grouped[key] = {
        problemDomain: domain,
        problemCategory: category,
        subCategory: subCategory,
        classificationAr: record.classificationAr || '',
        classificationEn: record.classificationEn || '',
        severityLow: 0,
        severityMedium: 0,
        severityHigh: 0,
        count: 0
      };
    }

    grouped[key].count++;

    // Count severity
    const severity = record.severity?.toUpperCase();
    if (severity === 'LOW') grouped[key].severityLow++;
    else if (severity === 'MEDIUM') grouped[key].severityMedium++;
    else if (severity === 'HIGH') grouped[key].severityHigh++;
  });

  // Convert to array and sort by Domain -> Category -> Subcategory
  const result = Object.values(grouped).sort((a, b) => {
    // Sort by domain
    if (a.problemDomain !== b.problemDomain) {
      // Order: CLINICAL, MANAGEMENT, RELATIONAL
      const domainOrder = { 'CLINICAL': 1, 'MANAGEMENT': 2, 'RELATIONAL': 3 };
      return (domainOrder[a.problemDomain] || 999) - (domainOrder[b.problemDomain] || 999);
    }
    // Sort by category
    if (a.problemCategory !== b.problemCategory) {
      return a.problemCategory.localeCompare(b.problemCategory);
    }
    // Sort by subcategory
    return a.subCategory.localeCompare(b.subCategory);
  });

  return result;
};
