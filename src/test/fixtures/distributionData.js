// src/test/fixtures/distributionData.js

/**
 * Test fixtures for distribution data
 */

export const singleBucketData = {
  dimension: 'severity',
  time_mode: 'single',
  buckets: [
    {
      time_label: '2025',
      total: 100,
      status: null,
      values: [
        { key: 'High', count: 30, percent: 0.3 },
        { key: 'Medium', count: 50, percent: 0.5 },
        { key: 'Low', count: 20, percent: 0.2 },
      ],
    },
  ],
};

export const multiBucketData = {
  dimension: 'domain',
  time_mode: 'multi',
  buckets: [
    {
      time_label: '2024-Q4',
      total: 100,
      status: null,
      values: [
        { key: 'Clinical', count: 60, percent: 0.6 },
        { key: 'Operational', count: 30, percent: 0.3 },
        { key: 'Administrative', count: 10, percent: 0.1 },
      ],
    },
    {
      time_label: '2025-Q1',
      total: 150,
      status: null,
      values: [
        { key: 'Clinical', count: 100, percent: 0.67 },
        { key: 'Operational', count: 40, percent: 0.27 },
        { key: 'Administrative', count: 10, percent: 0.06 },
      ],
    },
  ],
};

export const binarySplitData = {
  dimension: 'stage',
  time_mode: 'binary_split',
  buckets: [
    {
      time_label: 'Before 2024-06-01',
      total: 80,
      status: null,
      values: [
        { key: 'Near Miss', count: 40, percent: 0.5 },
        { key: 'Adverse Event', count: 30, percent: 0.375 },
        { key: 'Sentinel Event', count: 10, percent: 0.125 },
      ],
    },
    {
      time_label: 'After 2024-06-01',
      total: 120,
      status: null,
      values: [
        { key: 'Near Miss', count: 50, percent: 0.42 },
        { key: 'Adverse Event', count: 50, percent: 0.42 },
        { key: 'Sentinel Event', count: 20, percent: 0.16 },
      ],
    },
  ],
};

export const noDataResponse = {
  dimension: 'stage',
  time_mode: 'single',
  buckets: [
    {
      time_label: '2025',
      total: 0,
      status: 'NO_DATA',
      values: [],
    },
  ],
};

export const emptyBucketData = {
  dimension: 'severity',
  time_mode: 'single',
  buckets: [
    {
      time_label: '2025',
      total: 0,
      status: null,
      values: [],
    },
  ],
};

export const singleValueBucket = {
  dimension: 'harm',
  time_mode: 'single',
  buckets: [
    {
      time_label: '2025',
      total: 50,
      status: null,
      values: [{ key: 'No Harm', count: 50, percent: 1.0 }],
    },
  ],
};

export const multiplePeriodsWithMissingKeys = {
  dimension: 'category',
  time_mode: 'multi',
  buckets: [
    {
      time_label: '2024',
      total: 50,
      status: null,
      values: [
        { key: 'Medication Error', count: 30, percent: 0.6 },
        { key: 'Fall', count: 20, percent: 0.4 },
      ],
    },
    {
      time_label: '2025',
      total: 80,
      status: null,
      values: [
        { key: 'Medication Error', count: 40, percent: 0.5 },
        { key: 'Fall', count: 20, percent: 0.25 },
        { key: 'Pressure Injury', count: 20, percent: 0.25 }, // New key not in 2024
      ],
    },
  ],
};

export const largeBucketData = {
  dimension: 'classification',
  time_mode: 'single',
  buckets: [
    {
      time_label: '2025',
      total: 200,
      status: null,
      values: [
        { key: 'Type A', count: 40, percent: 0.2 },
        { key: 'Type B', count: 35, percent: 0.175 },
        { key: 'Type C', count: 30, percent: 0.15 },
        { key: 'Type D', count: 25, percent: 0.125 },
        { key: 'Type E', count: 20, percent: 0.1 },
        { key: 'Type F', count: 15, percent: 0.075 },
        { key: 'Type G', count: 15, percent: 0.075 },
        { key: 'Type H', count: 10, percent: 0.05 },
        { key: 'Type I', count: 10, percent: 0.05 },
      ],
    },
  ],
};
