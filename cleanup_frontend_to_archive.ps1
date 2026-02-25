# ============================================================
# CLEANUP SCRIPT - Move Frontend Development Files to Archive
# ============================================================
# This script moves test files, documentation, debug scripts,
# and other development artifacts to an archive folder.
# 
# REVIEW THIS SCRIPT BEFORE RUNNING!
# Run with: .\cleanup_frontend_to_archive.ps1
# ============================================================

$projectRoot = "C:\Users\IT\Documents\GitHub Repository\frontend"
$archiveDir = Join-Path $projectRoot "archive"

# Create archive directory structure
$subfolders = @(
    "documentation",
    "test_scripts",
    "debug_scripts",
    "coverage_reports",
    "misc"
)

Write-Host "Creating archive directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
foreach ($folder in $subfolders) {
    New-Item -ItemType Directory -Path (Join-Path $archiveDir $folder) -Force | Out-Null
}

# ============================================================
# 1. DOCUMENTATION FILES (.md files - completion reports, etc.)
#    EXCLUDES: README.md (project readme to keep)
# ============================================================
$docFiles = @(
    "API_CARDS_SPECIFICATION.md",
    "AUTH_PLUMBING_DISCOVERY.md",
    "BRAND_COLOR_TRANSFORMATION_COMPLETE.md",
    "BREAKDOWN_CARDS_IMPLEMENTATION.md",
    "CASCADED_HIERARCHY_REPORT_SCOPE.md",
    "CUSTOM_VIEW_COMPLETION_REPORT.md",
    "CUSTOM_VIEW_FEATURE_README.md",
    "CUSTOM_VIEW_INTEGRATION.md",
    "CUSTOM_VIEW_QUICK_REFERENCE.md",
    "DEBUGGING_COMPLETE_SUMMARY.md",
    "DISTRIBUTION_OPERATOR_FINAL_REPORT.md",
    "DISTRIBUTION_OPERATOR_QUICKSTART.md",
    "EDIT_PAGE_VALIDATION_COMPLETE.md",
    "EXISTING_PAGES_DISCOVERY.md",
    "FEEDBACK_CLINICAL_RISK_TROUBLESHOOTING.md",
    "FIELD_SELECTION_DEBUGGING_GUIDE.md",
    "FOLLOW_UP_ACTIONS_README.md",
    "FOLLOW_UP_BACKEND_INTEGRATION.md",
    "FORCE_CLOSE_BACKEND_PROMPT.md",
    "HISTORY_AGGREGATE_REPORTS_BACKEND_PROMPT.md",
    "HISTORY_PAGE_API_SPECIFICATION.md",
    "HISTORY_SEARCH_DEBUG_PROMPT.md",
    "INBOX_API_BACKEND_PROMPT.md",
    "INSERT_ENDPOINT_UPDATE_SUMMARY.md",
    "INSERT_RECORD_API_INTEGRATION.md",
    "INSIGHT_DATA_CONSISTENCY_BACKEND_PROMPT.md",
    "INSIGHT_PAGE_FIELD_VERIFICATION.md",
    "INSIGHT_USER_WORKLOAD_BACKEND_PROMPT.md",
    "MODULE_5.10_IMPLEMENTATION.md",
    "NEVER_EVENTS_BACKEND_COMPLETE_PROMPT.md",
    "PATIENT_HISTORY_README.md",
    "PHASE5_QUICK_REFERENCE.md",
    "PHASE5_SMART_FILTERING_README.md",
    "PHASE7_INTEGRATION_SUMMARY.md",
    "PHASE_D_TESTING_COMPLETE.md",
    "PHASE_D_TESTING_SUMMARY.md",
    "PHASE_G_COMPLETION_REPORT.md",
    "PHASE_J_TASK_4_COMPLETE.md",
    "PHASE_J_TASK_5_COMPLETE.md",
    "PHASE_J_TASK_6_COMPLETE.md",
    "PHASE_J_TASK_7_COMPLETE.md",
    "PHASE_J_TASK_8_COMPLETE.md",
    "PHASE_J_TASK_9_COMPLETE.md",
    "PHASE_K_GUARDS_COMPLETE.md",
    "RED_FLAGS_BACKEND_COMPLETE_PROMPT.md",
    "ROUTING_NAVIGATION_DISCOVERY.md",
    "ROW_EDIT_DELETE_CODE_EXAMPLES.md",
    "ROW_EDIT_DELETE_IMPLEMENTATION.md",
    "SEASONAL_EXPLANATIONS_README.md",
    "SESSION_PERSISTENCE_FIX.md",
    "SETTINGS_BACKEND_CHECK_AND_FIX.md",
    "SETTINGS_BACKEND_FIXES_PROMPT.md",
    "SETTINGS_PAGE_BACKEND_VERIFICATION.md",
    "SORTING_ISSUE_DIAGNOSIS.md",
    "STEP_4.15_ERROR_HARDENING_COMPLETE.md",
    "STEP_4.16_MANUAL_TESTING_GUIDE.md",
    "TABLEVIEW_REDESIGN_SUMMARY.md",
    "UI_COMPONENT_STYLE_DISCOVERY.md",
    "UNIFIED_USERS_TAB_SUMMARY.md",
    "USERS_BULK_DELETE_BACKEND_PROMPT.md",
    "USER_CONTEXT_DISCOVERY.md",
    "VALIDATION_INTEGRATION_COMPLETE.md"
)

Write-Host "`nMoving documentation files..." -ForegroundColor Yellow
$movedDocs = 0
foreach ($file in $docFiles) {
    $sourcePath = Join-Path $projectRoot $file
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination (Join-Path $archiveDir "documentation") -Force
        $movedDocs++
    }
}
Write-Host "  Moved $movedDocs documentation files" -ForegroundColor Green

# ============================================================
# 2. DEBUG/DIAGNOSE SCRIPTS (.js files for debugging)
# ============================================================
$debugScripts = @(
    "diagnose-redflags-api.js",
    "diagnose-users-api.js",
    "verify-mapping.js"
)

Write-Host "`nMoving debug scripts..." -ForegroundColor Yellow
$movedDebug = 0
foreach ($file in $debugScripts) {
    $sourcePath = Join-Path $projectRoot $file
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination (Join-Path $archiveDir "debug_scripts") -Force
        $movedDebug++
    }
}
Write-Host "  Moved $movedDebug debug scripts" -ForegroundColor Green

# ============================================================
# 3. TEST SCRIPTS (.js, .mjs test runners)
# ============================================================
$testScripts = @(
    "runPhaseJ9Tests.mjs",
    "runVisibilityTests.js"
)

Write-Host "`nMoving test scripts..." -ForegroundColor Yellow
$movedTests = 0
foreach ($file in $testScripts) {
    $sourcePath = Join-Path $projectRoot $file
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination (Join-Path $archiveDir "test_scripts") -Force
        $movedTests++
    }
}
Write-Host "  Moved $movedTests test scripts" -ForegroundColor Green

# ============================================================
# 4. COVERAGE FOLDER (test coverage reports)
# ============================================================
Write-Host "`nMoving coverage folder..." -ForegroundColor Yellow
$movedCoverage = 0
$coveragePath = Join-Path $projectRoot "coverage"
if (Test-Path $coveragePath) {
    Move-Item -Path $coveragePath -Destination (Join-Path $archiveDir "coverage_reports") -Force
    $movedCoverage = 1
}
Write-Host "  Moved coverage folder" -ForegroundColor Green

# ============================================================
# 5. TESTS FOLDER
# ============================================================
Write-Host "`nMoving tests folder..." -ForegroundColor Yellow
$movedTestsFolder = 0
$testsPath = Join-Path $projectRoot "tests"
if (Test-Path $testsPath) {
    Move-Item -Path $testsPath -Destination $archiveDir -Force
    $movedTestsFolder = 1
}
Write-Host "  Moved tests folder" -ForegroundColor Green

# ============================================================
# 6. OLD CLEANUP SCRIPT (this project's reference script)
# ============================================================
Write-Host "`nMoving old cleanup script..." -ForegroundColor Yellow
$movedMisc = 0
$oldCleanup = Join-Path $projectRoot "cleanup_to_archive.ps1"
if (Test-Path $oldCleanup) {
    Move-Item -Path $oldCleanup -Destination (Join-Path $archiveDir "misc") -Force
    $movedMisc++
}
Write-Host "  Moved $movedMisc misc files" -ForegroundColor Green

# ============================================================
# SUMMARY
# ============================================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Documentation files moved: $movedDocs"
Write-Host "Debug scripts moved:       $movedDebug"
Write-Host "Test scripts moved:        $movedTests"
Write-Host "Coverage folder moved:     $movedCoverage"
Write-Host "Tests folder moved:        $movedTestsFolder"
Write-Host "Misc files moved:          $movedMisc"
Write-Host "------------------------------------------------------------"
$total = $movedDocs + $movedDebug + $movedTests + $movedCoverage + $movedTestsFolder + $movedMisc
Write-Host "TOTAL ITEMS MOVED:         $total" -ForegroundColor Yellow
Write-Host "`nAll files moved to: $archiveDir" -ForegroundColor Cyan
Write-Host "`nRemaining in project root (PRODUCTION CODE):"
Write-Host "  - src/           (React app code)"
Write-Host "  - public/        (Static assets)"
Write-Host "  - backend/       (Backend code)"
Write-Host "  - node_modules/  (Dependencies)"
Write-Host "  - .git/          (Version control)"
Write-Host "  - .github/       (GitHub config)"
Write-Host "  - package.json"
Write-Host "  - package-lock.json"
Write-Host "  - .gitignore"
Write-Host "  - README.md"
Write-Host "============================================================`n"

# Self-cleanup: move this script to archive after running
Write-Host "Moving this cleanup script to archive..." -ForegroundColor Yellow
$thisScript = $MyInvocation.MyCommand.Path
if ($thisScript -and (Test-Path $thisScript)) {
    Copy-Item -Path $thisScript -Destination (Join-Path $archiveDir "misc") -Force
    Write-Host "  Script copied to archive (delete original manually if desired)" -ForegroundColor Green
}
