# Quick Reference Guide: ML Training Tab Smart Features

## 🎯 Quick Start

### Find Underperforming Models
1. Set "Performance Threshold" to "Show F1 < 60%"
2. Models with F1 scores below 60% will be displayed
3. Check the Performance Alerts section for recommendations

### Find Data-Sparse Models
1. Set "Minimum Record Count" to "At least 100 records"
2. Only models with 100+ training records shown
3. Group by "Record Count" to see distribution

### Compare Model Families
1. Select "Group By: Family"
2. Scroll to "Family Comparison Chart"
3. See side-by-side metric comparison

## 📊 Filter Combinations

### Critical Issues Only
```
Performance Threshold: Show F1 < 40%
Minimum Records: Show All
Group By: Performance
Sort By: F1 Score (Ascending)
```
→ Shows worst performing models first

### Identify Training Gaps
```
Performance Threshold: Show All
Minimum Records: At least 200 records
Group By: Record Count
Sort By: Record Count (Descending)
```
→ Shows which models need more training data

### Family Health Check
```
Performance Threshold: Show All
Minimum Records: Show All
Group By: Family
Sort By: F1 Score (Descending)
```
→ See each family's best and worst models

## 🎨 Color Code Reference

### Performance Badges (F1 Score)
- 🟢 **Green** (>80%): Excellent performance
- 🔵 **Blue** (60-80%): Good performance
- 🟠 **Orange** (40-60%): Fair performance
- 🔴 **Red** (<40%): Poor performance

### Alert Severity
- 🔴 **Red Critical**: F1 < 30% - Immediate action needed
- 🟠 **Orange Warning**: F1 30-50% - Review recommended
- 🔵 **Blue Info**: General information

## 📈 Chart Interpretation

### Database Growth Chart
- **Upward trend**: Good - More training data accumulating
- **Flat line**: Concerning - No new data being collected
- **Steep spike**: Investigate - Possible data import or system change

### Performance Trends Chart
- **Upward slope**: Model improving over time ✅
- **Downward slope**: Model degrading - may need retraining ⚠️
- **Flat line**: Model plateaued - consider architecture changes
- **Volatile**: Inconsistent data quality or training issues

### Training Timeline Chart
- **Green bars**: Successful training run
- **Red bars**: Failed training run
- **Increasing height**: Training taking longer (more data?)
- **Average line**: Benchmark for typical training duration

### Family Comparison Chart
- **Taller bars = Better**: Higher metric values
- **Compare across families**: Identify which families perform better
- **Balanced bars**: Model has consistent metrics
- **Unbalanced bars**: Check if overfitting (high precision, low recall)

## ⚡ Pro Tips

### Fastest Workflow
1. Check Summary Cards for quick overview
2. Review Performance Alerts for issues
3. Use filters to drill down into problems
4. Train models after addressing alerts

### Regular Monitoring
- **Daily**: Check critical alerts
- **Weekly**: Review performance trends chart
- **Monthly**: Analyze database growth and training timeline

### Before Training
1. Verify alerts are addressed
2. Check database growth shows new data
3. Review last training success rate
4. Ensure no training currently running

### After Training
1. Watch progress banner for completion
2. Check if alerts decreased
3. Compare new metrics to previous run
4. Review performance trends for improvement

## 🔍 Search Strategies

### Find Specific Model
1. Use browser search (Ctrl+F / Cmd+F)
2. Type model name (e.g., "Domain_Model")
3. Or set restrictive filters and scroll

### Compare Two Models
1. Note their current group
2. Use "Sort By" to bring them closer together
3. Read metrics side-by-side in table

### Historical Analysis
1. Note current metrics
2. Check Performance Trends chart
3. Look for the model's line over time
4. Check Training Timeline for correlation

## 🚨 Troubleshooting

### "No models match your filter criteria"
- Filters too restrictive
- Try "Show All" on both filters
- Check if any training has completed

### Charts not loading
- Backend may be down
- Check browser console for errors
- Refresh page
- Verify backend URL is correct

### Training button disabled
- Training already in progress (check banner)
- Wait for current training to complete
- Or check backend status

### Progress not updating
- Polling may have stopped
- Refresh page to restart polling
- Check network connectivity

## 📱 Mobile Usage

### Best Practices on Small Screens
- Use portrait orientation for filters
- Rotate to landscape for charts
- Swipe/scroll tables horizontally
- Use one filter at a time for clarity

### Touch Gestures
- Tap dropdowns to select
- Tap radio buttons to switch grouping
- Tap sort arrow to toggle direction
- Tap charts for tooltips (if supported)

## ⌨️ Keyboard Shortcuts

### Standard Browser Shortcuts
- **Ctrl+F**: Find model by name
- **Tab**: Navigate between filters
- **Space**: Toggle selected radio button
- **Enter**: Open dropdown (when focused)
- **Esc**: Close dropdown

### Recommended Workflow Shortcuts
1. Tab to Performance Threshold
2. Enter to open, Arrow keys to select
3. Tab to Record Count
4. Repeat selection
5. Tab to Group By radio buttons
6. Arrow keys to switch

## 🔔 Alert Action Guide

### Critical Alert (Red)
**Example**: "Classification_En has critically low F1 score (14.1%)"

**Actions**:
1. Check model's record count (likely too low)
2. Review training data quality
3. Consider architecture changes
4. May need feature engineering

### Warning Alert (Orange)
**Example**: "Harm_Ordinal_High has F1 of 33.3%"

**Actions**:
1. Investigate data distribution
2. Check for class imbalance
3. Review feature relevance
4. Consider collecting more data

### Info Alert (Blue)
**Example**: "Overall system performing well"

**Actions**:
- No immediate action needed
- Continue monitoring
- Document current state

## 📊 Metric Definitions

### F1 Score
- Harmonic mean of precision and recall
- **Best for**: Overall model quality
- **Range**: 0-1 (higher is better)
- **Target**: >0.7 for production models

### Accuracy
- Percentage of correct predictions
- **Best for**: Balanced datasets
- **Range**: 0-1 (higher is better)
- **Caution**: Can be misleading with imbalanced data

### Precision
- Of predicted positives, how many were correct
- **Best for**: When false positives are costly
- **Range**: 0-1 (higher is better)
- **Use case**: Critical patient issues

### Recall
- Of actual positives, how many were found
- **Best for**: When false negatives are costly
- **Range**: 0-1 (higher is better)
- **Use case**: Safety-critical events

## 🎓 Training Best Practices

### When to Train
✅ **Train Now**:
- After collecting 50+ new records
- Weekly scheduled maintenance
- After fixing data quality issues
- When alerts indicate degradation

❌ **Wait to Train**:
- Less than 10 new records
- During peak system usage
- When another training is running
- If backend is unstable

### Optimal Schedule
- **Small systems**: Weekly training
- **Medium systems**: Bi-weekly training
- **Large systems**: Monthly training
- **Critical systems**: After significant events

### Data Quality Checks Before Training
1. Verify no duplicate records
2. Check for missing critical fields
3. Ensure label consistency
4. Review outliers and anomalies

---

## 🆘 Support Resources

### If Something Doesn't Work
1. Check browser console for errors (F12)
2. Verify backend is running (http://localhost:8000)
3. Review network tab for failed requests
4. Check PHASE5_SMART_FILTERING_README.md
5. Contact system administrator

### Common Issues
| Issue | Solution |
|-------|----------|
| Filters not applying | Hard refresh (Ctrl+Shift+R) |
| Charts showing old data | Click "Train All Models" |
| Progress stuck | Check backend logs |
| Table empty | Adjust filters or check backend |
| Slow performance | Reduce chart history limit |

---

**Version**: 1.0  
**Last Updated**: January 21, 2026  
**For**: Settings > Training Tab (ML Models)
