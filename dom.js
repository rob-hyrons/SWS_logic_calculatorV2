/**
 * DOM Module
 * Centralizes all document element references.
 */

export const dom = {};

// List of all IDs present in the index.html
const elementIds = [
    // --- Tabs & Layout ---
    'import-status',
    'printButton',

    // --- Input Tab ---
    'width',
    'widthType',
    'guideType',
    'height',
    'additionalLength',
    'lathType',
    'endlockType',
    'useCustomLath',
    'custom-lath-options',
    'customLathWeight',
    'customTorqueWeight',
    'lath-image-container',
    'lathImageDisplay',
    'powderCoated',
    'bottomLathType',
    'addVision',
    'vision-slat-options',
    'visionLathType',
    'vision-lath-image-container',
    'visionLathImageDisplay',
    'visionStartHeight',
    'visionPanelHeight',

    // --- Input Results ---
    'calculated-curtain-width',
    'calculated-clear-opening',
    'calculated-overall-width',
    'weight-kg',
    'torque-weight-kg',
    'endlock-weight',
    'curtain-area',
    'lifted-curtain-area',
    'total-applied-friction',
    'lath-count',
    'laths-to-lift',
    'curtain-height-extended',
    'curtain-height-compressed',
    'max-torque-inputs',
    'motor-name-inputs',
    'motor-torque-inputs',

    // --- Axle Tab ---
    'shapeCircular',
    'shapeOctagonal',
    'axleType',
    'collarSize',
    'collar-size-group',
    'axle-weight',
    'total-deflection-weight',
    'axle-material-grade',
    'moment-of-inertia',
    'axle-deflection',
    'deflection-ratio',
    'ratio-paragraph',
    'axle-safety-factor',
    'axleFixity',
    'recommendation-box',

    // --- Motor Tab ---
    'motorUsageFilter',
    'motorManufacturerFilter',
    'motorVoltageFilter',
    'motorMountingType',
    'motorManualOverrideFilter',
    'friction',
    'motorSelector',
    'motor-image-container',
    'motorImageDisplay',
    'motor-name',
    'motor-torque',
    'motor-rpm',
    'motor-driveshaft-dia',
    'motor-cycles-per-hour',
    'opening-time',
    'power-consumed',
    'motor-limit-turns',
    'motor-limit-warning',

    // --- Endplate Tab ---
    'matSteel',
    'matAluminium',
    'includeDeflectionInSizing',
    'endplateSelector',
    'max-coil-diameter',
    'effective-coil-diameter',
    'effective-coil-para',
    'endplate-name',
    'endplate-size',
    'endplate-material',
    'prev-endplate-name',
    'prev-endplate-height',
    'next-endplate-name',
    'next-endplate-height',
    'endplate-downward-force',
    'endplate-pullout-force',

    // --- Safety Brake Tab ---
    'safetyBrakeSelector',
    'safety-brake-image-container',
    'safetyBrakeImageDisplay',
    'safety-brake-name',
    'safety-brake-capacity',
    'safety-brake-motor-torque',
    'safety-brake-driveshaft',

    // --- Wicket Door Tab ---
    'wicketDoorSelector',
    'wicket-door-name',
    'wicket-door-height',
    'wicket-door-width',
    'laths-at-wicket',
    'wicket-lath-height',
    'wicket-max-torque',

    // --- Chain Tab ---
    'chainSizeDisplay',
    'motorTeeth',
    'barrelTeeth',
    'sprocketDiameter',
    'plateWheelDiameter',
    'chainPitch',
    'chain-ratio',
    'chain-torque-barrel',
    'chain-torque-motor',
    'chain-tension-n',
    'chain-tension',
    'chain-breaking-load-n',
    'chain-safety-factor',

    // --- Admin Tab ---
    'csvFileInput',
    'importCsvButton',
    'generateCsvButton',
    'reportLathType',
    'reportLathLimit',
    'reportLathType2',
    'reportEndlockType',
    'reportBottomLathType',
    'reportAxleMatch',
    'reportCollarOverride',

    // --- Graphic Containers ---
    'shutter-graphic-container',
    'width-graphic-container',
    'deflection-graphic-container',
    'axle-cross-section-container',
    'torque-graph-container',
    'endplate-graphic-container',
    'endplate-force-diagram-container',
    'wicket-graphic-container',
    'wicket-torque-graph-container',
    'chain-graphic-container'
];

/**
 * Automatically populates the 'dom' object.
 * Converts 'hyphen-case' to 'camelCase'.
 * Example: 'weight-kg' becomes 'dom.weightKg'
 */
elementIds.forEach(id => {
    const key = id.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    dom[key] = document.getElementById(id);
    
    // Safety check for missing elements
    if (!dom[key]) {
        console.warn(`DOM Element with ID "${id}" was not found in the HTML.`);
    }
});

/**
 * Function to update CSS-based visibility of tab panes
 */
export function switchTabVisibility(targetTabId) {
    const panes = document.querySelectorAll('.tab-pane');
    const buttons = document.querySelectorAll('.tab-button');
    
    panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === targetTabId);
    });
    
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === targetTabId);
    });
}