/**
 * State Module
 * Holds all data loaded from Excel/CSV and current calculation results.
 */

export const state = {
    // --- Data Tables (Loaded from Excel) ---
    lathData: [],
    axleData: [],
    motorData: [],
    bottomLathData: [],
    safetyBrakeData: [],
    endplateData: [],
    wicketData: [],
    endlockData: [],
    guideData: [],
    chainDriveData: [],

    // --- Image Storage (Extracted from Excel) ---
    lathImageMap: new Map(),        // Stores base64 strings keyed by Lath Name
    safetyBrakeImageMap: new Map(), // Stores base64 strings keyed by Brake Name
    motorImageMap: new Map(),       // Stores base64 strings keyed by Motor Name

    // --- Current Calculation Results ---
    calculatedRotations: 0,
    maxCoilDiameter: 0,
    lastTorqueProfile: [],          // Array of {torque, diameter, heightLifted}
    visionCalcs: null,              // Holds results of vision panel distribution
    
    // --- UI & Filter State ---
    currentFilteredMotors: [],      // Motors matching current voltage/mounting/torque
    currentFilteredEndplates: [],   // Endplates matching current material/size
    
    // --- User Overrides ---
    userSelectedAxleIndex: null,    // If user manually picks an axle, we store it here
    
    // --- Constant Reference (Defaults) ---
    defaults: {
        axleFixity: 20,             // 20% by default
        additionalAxleLength: 20,   // 20mm total extra
        frictionBaseline: 10        // 10% baseline
    }
};

/**
 * Helper function to reset state if a new file is uploaded
 */
export function resetState() {
    state.lathData = [];
    state.axleData = [];
    state.motorData = [];
    state.bottomLathData = [];
    state.safetyBrakeData = [];
    state.endplateData = [];
    state.wicketData = [];
    state.endlockData = [];
    state.guideData = [];
    state.chainDriveData = [];
    
    state.lathImageMap.clear();
    state.safetyBrakeImageMap.clear();
    state.motorImageMap.clear();
    
    state.userSelectedAxleIndex = null;
    state.lastTorqueProfile = [];
}