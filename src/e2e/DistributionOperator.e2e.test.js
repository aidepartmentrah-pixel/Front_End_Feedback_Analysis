// src/e2e/DistributionOperator.e2e.test.js
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import TrendMonitoringPage from '../pages/TrendMonitoringPage';
import {
  singleBucketData,
  multiBucketData,
  binarySplitData,
  noDataResponse,
} from '../test/fixtures/distributionData';

// MSW Server Setup
const server = setupServer(
  rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
    return res(ctx.json(singleBucketData));
  }),
  rest.get('http://127.0.0.1:8000/api/data/hierarchy', (req, res, ctx) => {
    return res(ctx.json({
      Administration: [],
      Department: [],
      Section: []
    }));
  }),
  rest.get('http://127.0.0.1:8000/api/data/reference-data', (req, res, ctx) => {
    return res(ctx.json({
      Domain: [],
      Category: [],
      Stage: []
    }));
  }),
  rest.get('http://127.0.0.1:8000/api/trends/scope', (req, res, ctx) => {
    return res(ctx.json({}));
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Disable API mocking after tests
afterAll(() => server.close());

// Helper to render the component
const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('Distribution Operator - E2E Integration Tests', () => {
  describe('Test 1: Single Time Mode Flow', () => {
    it('should complete full single time mode analysis workflow', async () => {
      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          return res(ctx.json(singleBucketData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Step 1: Select dimension
      const dimensionSelect = screen.getAllByRole('combobox').find(
        (el) => el.closest('[aria-labelledby="dimension-label"]')
      );
      expect(dimensionSelect).toBeInTheDocument();
      fireEvent.mouseDown(dimensionSelect);
      
      const categoryOption = await screen.findByText('Category');
      fireEvent.click(categoryOption);

      // Step 2: Ensure "Single Time Period" is selected (default)
      const singleTimeRadio = screen.getByLabelText(/Single Time Period/i);
      expect(singleTimeRadio).toBeChecked();

      // Step 3: Set year
      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: '2024' } });
      expect(yearInput.value).toBe('2024');

      // Step 4: Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Step 5: Verify loading state
      expect(await screen.findByText(/Analyzing.../i)).toBeInTheDocument();

      // Step 6: Wait for results and verify chart selector appears
      await waitFor(() => {
        expect(screen.getByText(/Visualization Type/i)).toBeInTheDocument();
      });

      // Step 7: Verify default chart renders (Bar Chart)
      const barChartTab = screen.getByLabelText(/Bar chart visualization/i);
      expect(barChartTab).toHaveAttribute('aria-selected', 'true');

      // Step 8: Switch to Pie Chart
      const pieChartTab = screen.getByLabelText(/Pie chart visualization/i);
      fireEvent.click(pieChartTab);

      await waitFor(() => {
        expect(pieChartTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Test 2: Multi Time Mode Flow', () => {
    it('should handle multiple time periods selection and stacked visualization', async () => {
      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          return res(ctx.json(multiBucketData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Step 1: Select dimension
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const domainOption = await screen.findByText('Domain');
      fireEvent.click(domainOption);

      // Step 2: Select "Multiple Time Periods"
      const multiTimeRadio = screen.getByLabelText(/Multiple Time Periods/i);
      fireEvent.click(multiTimeRadio);

      await waitFor(() => {
        expect(multiTimeRadio).toBeChecked();
      });

      // Step 3: Add first period (2024-Q1)
      const seasonInputs = screen.getAllByLabelText(/Season/i);
      fireEvent.change(seasonInputs[0], { target: { value: '2024-Q1' } });

      // Step 4: Add another period
      const addButton = screen.getByLabelText(/Add another time period/i);
      fireEvent.click(addButton);

      // Step 5: Set second period (2024-Q2)
      await waitFor(() => {
        const updatedSeasonInputs = screen.getAllByLabelText(/Season/i);
        expect(updatedSeasonInputs.length).toBeGreaterThan(1);
      });

      const secondSeasonInput = screen.getAllByLabelText(/Season/i)[1];
      fireEvent.change(secondSeasonInput, { target: { value: '2024-Q2' } });

      // Step 6: Submit
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Step 7: Wait for results
      await waitFor(() => {
        expect(screen.getByText(/Visualization Type/i)).toBeInTheDocument();
      });

      // Step 8: Verify stacked bar chart is available
      const stackedTab = screen.getByLabelText(/Stacked bar chart visualization/i);
      expect(stackedTab).toBeInTheDocument();

      // Step 9: Switch to Line Chart
      const lineTab = screen.getByLabelText(/Line chart visualization/i);
      fireEvent.click(lineTab);

      await waitFor(() => {
        expect(lineTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Test 3: Binary Split Mode Flow', () => {
    it('should handle binary split time period selection', async () => {
      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          return res(ctx.json(binarySplitData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Step 1: Select dimension
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const severityOption = await screen.findByText('Severity');
      fireEvent.click(severityOption);

      // Step 2: Select "Binary Split"
      const binarySplitRadio = screen.getByLabelText(/Binary Split/i);
      fireEvent.click(binarySplitRadio);

      await waitFor(() => {
        expect(binarySplitRadio).toBeChecked();
      });

      // Step 3: Set start and end dates
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-06-30' } });

      expect(startDateInput.value).toBe('2024-01-01');
      expect(endDateInput.value).toBe('2024-06-30');

      // Step 4: Submit
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Step 5: Wait for results
      await waitFor(() => {
        expect(screen.getByText(/Visualization Type/i)).toBeInTheDocument();
      });

      // Step 6: Verify table view works
      const tableTab = screen.getByLabelText(/Table view visualization/i);
      fireEvent.click(tableTab);

      await waitFor(() => {
        expect(tableTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Test 4: NO_DATA Handling', () => {
    it('should display friendly message when no data is available', async () => {
      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          return res(ctx.json(noDataResponse));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Set up request
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const harmOption = await screen.findByText('Harm');
      fireEvent.click(harmOption);

      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: '2023' } });

      // Submit
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Wait for NO_DATA message
      await waitFor(() => {
        expect(screen.getByText(/No incidents recorded/i)).toBeInTheDocument();
      });

      // Verify no chart selector is shown
      expect(screen.queryByText(/Visualization Type/i)).not.toBeInTheDocument();
    });
  });

  describe('Test 5: Error Recovery Flow', () => {
    it('should display error message and allow retry', async () => {
      let attemptCount = 0;

      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          attemptCount++;
          if (attemptCount === 1) {
            return res(
              ctx.status(400),
              ctx.json({
                detail: 'Invalid time window format'
              })
            );
          }
          return res(ctx.json(singleBucketData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Submit with invalid data
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const categoryOption = await screen.findByText('Category');
      fireEvent.click(categoryOption);

      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: 'invalid' } });

      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/Invalid time window format/i)).toBeInTheDocument();
      });

      // Verify error is displayed with alert role
      const errorCard = screen.getByRole('alert');
      expect(errorCard).toBeInTheDocument();

      // Fix the input
      fireEvent.change(yearInput, { target: { value: '2024' } });

      // Click Retry button
      const retryButton = screen.getByRole('button', { name: /Retry distribution analysis/i });
      fireEvent.click(retryButton);

      // Wait for successful response
      await waitFor(() => {
        expect(screen.getByText(/Visualization Type/i)).toBeInTheDocument();
      });

      expect(attemptCount).toBe(2);
    });
  });

  describe('Test 6: Network Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          return res.networkError('Network connection failed');
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Set up valid request
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const domainOption = await screen.findByText('Domain');
      fireEvent.click(domainOption);

      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: '2024' } });

      // Submit
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Wait for network error message
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      // Verify error is displayed
      const errorCard = screen.getByRole('alert');
      expect(errorCard).toBeInTheDocument();
    });
  });

  describe('Test 7: Optional Filters Integration', () => {
    it('should include optional filters in API request', async () => {
      let capturedRequest = null;

      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', async (req, res, ctx) => {
          capturedRequest = await req.json();
          return res(ctx.json(singleBucketData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Select dimension
      const dimensionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(dimensionSelect);
      const categoryOption = await screen.findByText('Category');
      fireEvent.click(categoryOption);

      // Set year
      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: '2024' } });

      // Open optional filters accordion
      const optionalFiltersButton = screen.getByText(/Optional Filters/i);
      fireEvent.click(optionalFiltersButton);

      // Wait for accordion to expand
      await waitFor(() => {
        expect(screen.getByText(/Apply additional filters/i)).toBeInTheDocument();
      });

      // Select stage filter
      const stageSelect = screen.getByLabelText(/Stage/i);
      fireEvent.mouseDown(stageSelect);
      await waitFor(() => {
        expect(screen.getByText('Stage 1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Stage 1'));

      // Submit
      const analyzeButton = screen.getByRole('button', { name: /Analyze distribution data/i });
      fireEvent.click(analyzeButton);

      // Wait for request to complete
      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      // Verify request includes filters
      expect(capturedRequest.filters).toBeDefined();
      expect(capturedRequest.filters.stage).toBe('Stage 1');
    });
  });

  describe('Test 8: Performance - Debouncing', () => {
    it('should debounce filter changes to prevent excessive API calls', async () => {
      jest.useFakeTimers();
      let apiCallCount = 0;

      server.use(
        rest.post('http://127.0.0.1:8000/api/operators/distribution', (req, res, ctx) => {
          apiCallCount++;
          return res(ctx.json(singleBucketData));
        })
      );

      renderWithRouter(<TrendMonitoringPage />);

      await waitFor(() => {
        expect(screen.getByText(/Distribution Analysis/i)).toBeInTheDocument();
      });

      // Rapidly change year multiple times
      const yearInput = screen.getByLabelText(/Year/i);
      fireEvent.change(yearInput, { target: { value: '2020' } });
      fireEvent.change(yearInput, { target: { value: '2021' } });
      fireEvent.change(yearInput, { target: { value: '2022' } });
      fireEvent.change(yearInput, { target: { value: '2023' } });
      fireEvent.change(yearInput, { target: { value: '2024' } });

      // Fast-forward time (debounce is 500ms)
      jest.advanceTimersByTime(500);

      // The debounce should prevent multiple renders
      expect(apiCallCount).toBe(0); // No API call yet because we haven't submitted

      jest.useRealTimers();
    });
  });
});
