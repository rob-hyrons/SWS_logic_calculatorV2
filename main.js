import { state } from './state.js';
import { dom, switchTabVisibility } from './dom.js';
import * as Calc from './modules/calculators.js';
import * as Render from './modules/renderers.js';

/**
 * HEART OF THE APP: The Update Loop
 * This function runs whenever any input changes.
 */
function updateAll() {
    if (state.lathData.length === 0) return;

    // 1. Calculate Widths
    const selectedGuide = state.guideData[dom.guideType.value];
    const widths = Calc.calculateWidths(parseFloat(dom.width.value) || 0, dom.widthType.value, selectedGuide);
    
    dom.calculatedCurtainWidth.textContent = widths.curtainWidth.toFixed(0);
    dom.calculatedClearOpening.textContent = widths.clearOpening.toFixed(0);
    dom.calculatedOverallWidth.textContent = widths.overallWidth.toFixed(0);

    // 2. Calculate Curtain Properties
    const curtain = Calc.calculateCurtainProperties({
        lath: state.lathData[dom.lathType.value],
        bottomLath: state.bottomLathData[dom.bottomLathType.value],
        height: parseFloat(dom.height.value) || 0,
        curtainWidth: widths.curtainWidth,
        powderCoated: dom.powderCoated.checked,
        endlockData: state.endlockData,
        selectedEndlockIndex: dom.endlockType.value
    });

    // Update Input Results
    dom.weightKg.textContent = curtain.totalWeight.toFixed(2);
    dom.lathCount.textContent = curtain.numLaths;
    dom.curtainHeightExtended.textContent = curtain.fullCurtainLength.toFixed(0);

    // 3. Axle & Deflection
    const selectedAxle = state.axleData[dom.axleType.value] || state.axleData[0];
    const deflectionResults = Calc.calculateDeflection({
        totalWeight: curtain.totalWeight,
        axle: selectedAxle,
        length: widths.curtainWidth + (parseFloat(dom.additionalLength.value) || 20),
        curtainWidth: widths.curtainWidth,
        fixityPercent: parseFloat(dom.axleFixity.value) || 20
    });

    dom.axleDeflection.textContent = deflectionResults.deflection.toFixed(2);
    dom.deflectionRatio.textContent = `1 : ${Math.round(deflectionResults.ratio)}`;

    // 4. Torque Profile
    const startDia = parseFloat(selectedAxle.Diameter) || 100;
    state.lastTorqueProfile = Calc.getTorqueProfile(
        curtain.totalWeight, 
        state.lathData[dom.lathType.value], 
        curtain.fullCurtainLength, 
        startDia
    );

    // 5. Render Graphics
    renderGraphics(widths.curtainWidth, curtain, deflectionResults, selectedAxle);
}

/**
 * Handles Graphical Rendering
 */
function renderGraphics(width, curtain, deflectionResults, axle) {
    Render.drawTorqueGraph(dom.torqueGraphContainer, state.lastTorqueProfile);
    Render.drawDeflectionGraphic(dom.deflectionGraphicContainer, width, deflectionResults.deflection);
    Render.drawAxleCrossSection(dom.axleCrossSectionContainer, axle, parseFloat(dom.collarSize.value) || 0);
    Render.drawShutterGraphic(dom.shutterGraphicContainer, {
        width: width,
        height: curtain.fullCurtainLength,
        numLaths: curtain.numLaths,
        axleDia: parseFloat(axle.Diameter)
    });
}

/**
 * Data Loading Logic (Excel)
 */
async function loadInitialData() {
    const url = 'https://raw.githubusercontent.com/rob-hyrons/SWS_logic_calculator/main/Calculation%20Data.xlsx';
    dom.importStatus.textContent = "Fetching data...";

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

        // Map sheets to state
        state.lathData = XLSX.utils.sheet_to_json(workbook.Sheets['Lath']);
        state.axleData = XLSX.utils.sheet_to_json(workbook.Sheets['Axles']);
        state.motorData = XLSX.utils.sheet_to_json(workbook.Sheets['Motors']);
        state.bottomLathData = XLSX.utils.sheet_to_json(workbook.Sheets['Bottom lath']);
        state.guideData = XLSX.utils.sheet_to_json(workbook.Sheets['Guides']);
        state.endlockData = XLSX.utils.sheet_to_json(workbook.Sheets['Endlock']);
        
        populateDropdowns();
        dom.importStatus.textContent = "Data Loaded Successfully";
        dom.importStatus.style.color = "green";
        
        updateAll();
    } catch (err) {
        dom.importStatus.textContent = "Error loading data.";
        dom.importStatus.style.color = "red";
        console.error(err);
    }
}

/**
 * Populate HTML Select Elements
 */
function populateDropdowns() {
    const fill = (el, data, key) => {
        el.innerHTML = data.map((item, i) => `<option value="${i}">${item[key] || item.Name}</option>`).join('');
        el.disabled = false;
    };

    fill(dom.lathType, state.lathData, 'Name');
    fill(dom.axleType, state.axleData, 'Name');
    fill(dom.guideType, state.guideData, 'Name');
    fill(dom.bottomLathType, state.bottomLathData, 'Bottom lath name');
    fill(dom.endlockType, state.endlockData, 'Description');
}

/**
 * Event Listeners Initialization
 */
function initEventListeners() {
    // Standard Inputs
    [dom.width, dom.height, dom.lathType, dom.axleType, dom.guideType, dom.powderCoated, dom.axleFixity]
        .forEach(el => el.addEventListener('input', updateAll));

    // Tab Switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTabVisibility(btn.dataset.tab);
            // Redraw graphics on tab switch to handle container resizing
            updateAll(); 
        });
    });

    // Print
    dom.printButton.addEventListener('click', () => window.print());
}

// Startup
window.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadInitialData();
});