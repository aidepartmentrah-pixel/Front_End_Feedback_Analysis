// src/api/investigation.js

const BASE_URL = "http://127.0.0.1:8000/api/investigation";

/**
 * Fetch available seasons from the backend
 * 
 * @returns {Promise<Object>} Object containing seasons array and current_season
 */
export async function fetchSeasons() {
  console.log("🔍 Fetching available seasons...");
  const url = `${BASE_URL}/seasons`;
  console.log("📡 Seasons API URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    console.log("📥 Seasons response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Seasons API error response:", errorText);
      throw new Error(`Failed to load seasons: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Seasons loaded successfully:", data);
    console.log("📅 Available seasons:", data.seasons?.length);
    console.log("📅 Current season:", data.current_season);
    
    return data;
  } catch (error) {
    console.error("❌ Error fetching seasons:", error);
    throw error;
  }
}

/**
 * Fetch hierarchical investigation tree with aggregated incident data
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.season - Season identifier (e.g., "2024-Q4" or numeric season ID)
 * @param {string} params.tree_type - Type of aggregation/visualization
 *   - "incident_count" - Total incidents per node
 *   - "domain_distribution_numbers" - Domain breakdown (absolute counts)
 *   - "domain_distribution_percentage" - Domain breakdown (percentages)
 *   - "severity_distribution_numbers" - Severity breakdown (absolute counts)
 *   - "severity_distribution_percentage" - Severity breakdown (percentages)
 *   - "red_flag_incidents" - Red flag count per node
 *   - "never_event_incidents" - Never event count per node
 * @param {number|null} params.administration_id - Optional filter to specific administration
 * @param {number|null} params.department_id - Optional filter to specific department
 * @param {number|null} params.section_id - Optional filter to specific section
 * @returns {Promise<Object>} Investigation tree data
 */
export async function fetchInvestigationTree({
  season,
  tree_type,
  administration_id = null,
  department_id = null,
  section_id = null,
}) {
  console.log("=== INVESTIGATION API REQUEST ===");
  console.log("🔍 Raw parameters received:", {
    season,
    tree_type,
    administration_id,
    department_id,
    section_id,
  });
  console.log("🔍 Parameter types:", {
    season: typeof season,
    tree_type: typeof tree_type,
    administration_id: typeof administration_id,
    department_id: typeof department_id,
    section_id: typeof section_id,
  });

  // ========================================
  // PARAMETER VALIDATION
  // ========================================
  const validTreeTypes = [
    "incident_count",
    "domain_distribution_numbers",
    "domain_distribution_percentage",
    "severity_distribution_numbers",
    "severity_distribution_percentage",
    "red_flag_incidents",
    "never_event_incidents",
  ];

  const errors = [];

  // Check required parameters
  if (!season || season === "undefined" || season === "null" || season === "") {
    errors.push("season is required and must be a valid value");
  }

  if (!tree_type || tree_type === "undefined" || tree_type === "null" || tree_type === "") {
    errors.push("tree_type is required and must be a valid value");
  }

  // Validate tree_type against allowed values
  if (tree_type && !validTreeTypes.includes(tree_type)) {
    errors.push(`tree_type must be one of: ${validTreeTypes.join(", ")} (got: "${tree_type}")`);
  }

  if (errors.length > 0) {
    console.error("❌ Parameter Validation Errors:", errors);
    throw new Error(`Invalid parameters: ${errors.join("; ")}`);
  }

  console.log("✅ Parameters validated successfully");

  // ========================================
  // BUILD QUERY PARAMETERS
  // ========================================
  const params = new URLSearchParams();
  params.append("season", String(season));
  params.append("tree_type", tree_type);
  
  // Only add optional IDs if they are valid numbers (not empty strings, null, undefined)
  if (administration_id && administration_id !== "" && !isNaN(administration_id)) {
    params.append("administration_id", String(administration_id));
    console.log("📍 Adding administration_id:", administration_id);
  }
  if (department_id && department_id !== "" && !isNaN(department_id)) {
    params.append("department_id", String(department_id));
    console.log("📍 Adding department_id:", department_id);
  }
  if (section_id && section_id !== "" && !isNaN(section_id)) {
    params.append("section_id", String(section_id));
    console.log("📍 Adding section_id:", section_id);
  }

  const url = `${BASE_URL}/tree?${params.toString()}`;
  console.log("📡 Full Investigation tree API URL:", url);
  console.log("📡 Query String Parameters:", params.toString());
  console.log("=================================");

  try {
    const response = await fetch(url, {
      method: "GET", // Explicitly specify GET method
      headers: {
        "Accept": "application/json",
      },
    });
    
    console.log("📥 Investigation tree response status:", response.status);
    console.log("📥 Response OK:", response.ok);
    console.log("📥 Response headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Investigation tree API error response (raw):", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error("❌ Parsed error JSON:", errorJson);
        
        // FastAPI returns { "detail": "error message" }
        const errorMessage = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
        throw new Error(`Failed to load investigation tree: ${response.status} - ${errorMessage}`);
      } catch (parseError) {
        // If not JSON, use the text directly
        console.error("❌ Could not parse error as JSON");
        throw new Error(`Failed to load investigation tree: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log("✅ Investigation tree data loaded successfully");
    console.log("✅ Data summary:", {
      season: data.season,
      season_label: data.season_label,
      tree_type: data.tree_type,
      scope_level: data.scope?.level,
      tree_nodes: data.tree?.length,
      total_incidents: data.summary?.total_incidents,
    });
    
    return data;
  } catch (error) {
    console.error("❌ Error fetching investigation tree:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    throw error;
  }
}

/**
 * Test function with hardcoded values for debugging
 * Can be called from browser console: window.testInvestigationAPI()
 */
export async function testInvestigationAPI() {
  console.log("🧪 === RUNNING INVESTIGATION API TEST ===");
  
  const testCases = [
    {
      name: "Basic test - Season 1, incident_count",
      params: {
        season: "1",
        tree_type: "incident_count",
      }
    },
    {
      name: "With administration filter",
      params: {
        season: "1",
        tree_type: "incident_count",
        administration_id: 1,
      }
    },
    {
      name: "Domain distribution percentage",
      params: {
        season: "1",
        tree_type: "domain_distribution_percentage",
      }
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    try {
      const result = await fetchInvestigationTree(testCase.params);
      console.log(`✅ ${testCase.name} - SUCCESS`);
      console.log("Data summary:", {
        season: result.season,
        tree_type: result.tree_type,
        nodes: result.tree?.length,
        total_incidents: result.summary?.total_incidents,
      });
    } catch (error) {
      console.error(`❌ ${testCase.name} - FAILED:`, error.message);
    }
  }
  
  console.log("\n🧪 === TEST COMPLETE ===");
}

// Make test function available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.testInvestigationAPI = testInvestigationAPI;
  console.log("🧪 Test function available: window.testInvestigationAPI()");
}
