# Distribution Operator - Quick Start Guide

## For Developers

### Running Tests
```bash
# Run all distribution tests
npm test -- --testPathPattern="distribution" --watchAll=false

# Run specific component tests
npm test -- DistributionBarChart --watchAll=false

# Run with coverage
npm test -- distribution --watchAll=false --coverage
```

### Using the API Client
```javascript
import { fetchDistributionData } from '../api/distribution';

// Single time period
const singleRequest = {
  dimension: 'category',
  time_mode: 'single',
  time_windows: [{ type: 'year', value: 2024 }]
};

// With AbortSignal for cancellation
const controller = new AbortController();
const data = await fetchDistributionData(singleRequest, controller.signal);
```

### Using Chart Components
```javascript
import { lazy, Suspense } from 'react';
const DistributionBarChart = lazy(() => import('../components/distribution/DistributionBarChart'));

// In your component
<Suspense fallback={<CircularProgress />}>
  <DistributionBarChart bucket={data.buckets[0]} />
</Suspense>
```

### Adding New Dimensions
1. Update dimension selector in `TrendMonitoringPage.js`:
```javascript
<Option value="new_dimension">New Dimension</Option>
```

2. Backend must support the new dimension in the API

### Project Structure
```
src/
├── api/distribution.js          # API client
├── components/distribution/     # Chart components
├── hooks/useDebounce.js         # Custom hooks
├── test/fixtures/               # Mock data
└── pages/TrendMonitoringPage.js # Main UI
```

### Common Issues

**Q: Charts not rendering?**
A: Check browser console for errors. Ensure data structure matches expected format (buckets array with time_label, total, values).

**Q: Tests failing with matchMedia error?**
A: Material-UI's useMediaQuery requires matchMedia mock. This is handled automatically.

**Q: How to add new chart type?**
A:
1. Create new component in `src/components/distribution/`
2. Add lazy import in TrendMonitoringPage
3. Add new Tab in chart type selector
4. Add conditional render for new chart type
5. Write tests in `ComponentName.test.js`

### Performance Tips
- All chart components are memoized - avoid unnecessary prop changes
- Use `useDebounce` hook for frequently changing state
- Lazy loading is configured - charts load on-demand
- AbortSignal is supported - cancel requests when needed

### Testing Guidelines
- Use fixtures from `src/test/fixtures/distributionData.js`
- Mock Recharts components in tests
- Test both success and error states
- Aim for 80% coverage minimum

---

**Need Help?** Check `DISTRIBUTION_OPERATOR_FINAL_REPORT.md` for complete documentation.
