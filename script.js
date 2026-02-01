// Global Variables
let lathData = [], axleData = [], motorData = [], bottomLathData = [], safetyBrakeData = [], endplateData = [], wicketData = [], endlockData = [], guideData = [], chainDriveData = [];
let lathImageMap = new Map();
let safetyBrakeImageMap = new Map();
let motorImageMap = new Map();
let currentFilteredMotors = [], currentFilteredEndplates = [];
let calculatedRotations = 0, maxCoilDiameter = 0;
let lastTorqueProfile = [];
let userSelectedAxleIndex = null;
let visionCalcs = null; 

// Define dom object globally so functions can access it
const dom = {};

// Map DOM elements immediately (script is at end of body)
['width', 'widthType', 'guideType', 'additionalLength', 'height', 'lathType', 'bottomLathType', 'axleType', 'friction', 'import-status', 
    'total-axle-length', 'weight-kg', 'axle-deflection', 'deflection-ratio', 'ratio-paragraph', 
    'recommendation-box', 'deflection-graphic-container', 'torque-graph-container', 'lath-count', 'laths-to-lift',
    'max-torque', 'total-revolutions', 'motorMountingType', 'motorVoltageFilter', 'motorManufacturerFilter', 'motorUsageFilter', 'motorManualOverrideFilter', 'motorSelector', 'motor-name', 'motor-torque', 'motor-rpm', 
    'motor-driveshaft-dia', 'motor-cycles-per-hour',
    'opening-time', 'motor-torque-line', 'axle-weight', 'axle-material-grade', 'moment-of-inertia', 'total-deflection-weight',
    'safety-brake-torque', 'safety-brake-name', 'safety-brake-motor-torque',
    'safetyBrakeSelector', 'shutter-graphic-container', 'safety-brake-driveshaft',
    'curtain-height-extended', 'curtain-height-compressed', 'endplateSelector', 'matSteel', 'matAluminium', 'endplate-name', 'endplate-size',
    'endplate-material', 'max-coil-diameter', 'prev-endplate-name', 'prev-endplate-height', 'next-endplate-name', 'next-endplate-height',
    'width-warning', 'curtain-area', 'lifted-curtain-area', 'printButton', 'wicketDoorSelector', 'wicket-door-name', 'wicket-door-height', 'wicket-door-width',
    'wicket-graphic-container', 'laths-at-wicket', 'wicket-lath-height', 'wicket-max-torque', 'wicket-torque-graph-container',
    'addVision', 'vision-slat-options', 'visionLathType', 'visionStartHeight', 'visionPanelHeight', 'axle-safety-factor', 'power-consumed',
    'powderCoated', 'axle-cross-section-container', 'visionLathImageDisplay', 'safety-brake-capacity', 
    'safety-brake-image-container', 'safetyBrakeImageDisplay', 'endplate-graphic-container', 'endplate-downward-force', 
    'endplate-pullout-force', 'endplate-force-diagram-container', 'includeDeflectionInSizing', 'effective-coil-para', 'effective-coil-diameter', 'collarSize',
    'vision-percentage', 'vision-percentage-para', 'vision-area-m2', 'vision-area-m2-para', 'endlockType', 'endlock-weight',
    'admin-content', 'tab-content', 'importCsvButton', 'shapeCircular', 'shapeOctagonal', 'collar-size-group', 'torque-weight-kg',
    'useCustomLath', 'custom-lath-options', 'customLathWeight', 'customTorqueWeight', 'max-torque-inputs', 'motor-name-inputs', 'motor-torque-inputs', 'motor-torque-line-inputs',
    'width-graphic-container', 'calculated-curtain-width', 'calculated-clear-opening', 'calculated-overall-width', 'axleFixity',
    'reportLathType', 'reportLathLimit', 'reportLathType2', 'chainSizeDisplay', 'motorTeeth', 'barrelTeeth', 'chainPitch', 
    'chain-ratio', 'chain-torque-barrel', 'chain-torque-motor', 'chain-tension', 'chain-breaking-load', 'chain-safety-factor', 'chain-graphic-container',
    'sprocketDiameter', 'plateWheelDiameter', 'chain-tension-n', 'chain-breaking-load-n', 'total-applied-friction',
    'motor-image-container', 'motorImageDisplay', 'motor-limit-turns', 'motor-limit-warning',
    'tab-controls-container', 'input-controls-container', 'report-motor-filter-container', 'report-motor-voltage-filter-container', 'report-motor-mounting-filter-container', 'report-motor-usage-filter-container'
].forEach(id => dom[id] = document.getElementById(id));

// Setup Tabs
const tabButtons = document.querySelectorAll('.tab-button');
tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));

// Setup Input Listeners
['width', 'widthType', 'guideType', 'additionalLength', 'height', 'friction', 'motorMountingType', 'motorVoltageFilter', 'motorManufacturerFilter', 'motorUsageFilter', 'motorManualOverrideFilter', 'bottomLathType', 'lathType', 'matSteel', 'matAluminium',
    'visionLathType', 'visionStartHeight', 'visionPanelHeight', 'powderCoated', 'includeDeflectionInSizing', 'collarSize', 'endlockType',
    'useCustomLath', 'customLathWeight', 'customTorqueWeight', 'axleFixity', 'chainPitch'
].forEach(id => {
    if (dom[id]) dom[id].addEventListener('input', () => {
        userSelectedAxleIndex = null; 
        if (id === 'useCustomLath') {
            const isChecked = dom.useCustomLath.checked;
            dom['custom-lath-options'].style.display = isChecked ? 'block' : 'none';
            dom.lathType.disabled = isChecked;
        }
        if (id === 'lathType' && lathData.length > 0) {
            const selectedLath = lathData[dom.lathType.value];
            if (selectedLath) {
                if (selectedLath['Friction %'] !== undefined) {
                    dom.friction.value = selectedLath['Friction %'];
                }
            }
        }
        updateAllCalculations();
    });
});

if (dom.addVision) {
    dom.addVision.addEventListener('change', () => {
        dom['vision-slat-options'].style.display = dom.addVision.checked ? 'block' : 'none';
        updateAllCalculations();
    });
}

['shapeCircular', 'shapeOctagonal'].forEach(id => {
    if (dom[id]) dom[id].addEventListener('change', handleShapeChange);
});

if (dom.motorSelector) dom.motorSelector.addEventListener('change', updateSelectedMotorInfo);
if (dom.endplateSelector) dom.endplateSelector.addEventListener('change', updateSelectedEndplateInfo);
if (dom.safetyBrakeSelector) dom.safetyBrakeSelector.addEventListener('input', updateSelectedSafetyBrakeInfo);
if (dom.axleType) dom.axleType.addEventListener('input', handleAxleOverride);
if (dom.wicketDoorSelector) dom.wicketDoorSelector.addEventListener('input', updateSelectedWicketInfo);
if (dom.printButton) {
    dom.printButton.addEventListener('click', () => {
        window.print();
    });
}
if (dom.importCsvButton) dom.importCsvButton.addEventListener('click', handleCsvImport);

// Initialize Admin & Load Data
initializeAdminControls();

// Auto-load data
const excelFileUrl = 'https://raw.githubusercontent.com/rob-hyrons/SWS_logic_calculator/main/Calculation%20Data.xlsx';
const statusDiv = document.getElementById('import-status');
if(statusDiv) {
    statusDiv.textContent = 'Loading data from repository...'; statusDiv.style.color = '#555';
}

fetch(excelFileUrl).then(response => {
    if (!response.ok) { throw new Error(`Network response was not ok: ${response.statusText}`); }
    return response.arrayBuffer();
}).then(fileData => { processExcelFile(fileData); }).catch(error => {
    if(statusDiv) {
        statusDiv.textContent = 'Failed to fetch the Excel file from the repository. Please check the console for details.'; 
        statusDiv.style.color = 'red'; 
    }
    console.error('There has been a problem with the fetch operation:', error);
});


// --- HELPER FUNCTIONS ---

function updatePrintStyles() {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const tabButton = document.querySelector(`.tab-button[data-tab="${pane.id}"]`);
        if (tabButton && tabButton.style.display === 'none') {
            pane.classList.add('hide-in-print');
        } else {
            pane.classList.remove('hide-in-print');
        }
    });
}

function initializeAdminControls() {
    const tabContainer = document.getElementById('tab-controls-container');
    const inputContainer = document.getElementById('input-controls-container');
    if (!tabContainer || !inputContainer) return;
    
    tabContainer.innerHTML = '';
    inputContainer.innerHTML = '';

    document.querySelectorAll('.tab-button').forEach(tab => {
        const tabId = tab.dataset.tab;
        const labelText = tab.textContent.trim();
        const controlItem = document.createElement('div');
        controlItem.className = 'admin-control-item';
        const isChecked = tab.style.display !== 'none';
        controlItem.innerHTML = `<label><input type="checkbox" data-target-tab="${tabId}" ${isChecked ? 'checked' : ''}>${labelText}</label>`;
        tabContainer.appendChild(controlItem);
        controlItem.querySelector('input').addEventListener('change', (e) => {
            tab.style.display = e.target.checked ? '' : 'none';
            updatePrintStyles();
        });
    });

    document.querySelectorAll('[data-admin-label]').forEach((inputGroup, index) => {
        const labelText = inputGroup.dataset.adminLabel;
        const groupId = `admin-input-${index}`;
        inputGroup.id = groupId;
        const controlItem = document.createElement('div');
        controlItem.className = 'admin-control-item';
        controlItem.innerHTML = `<label><input type="checkbox" data-target-input="${groupId}" checked>${labelText}</label>`;
        inputContainer.appendChild(controlItem);
            controlItem.querySelector('input').addEventListener('change', (e) => {
            inputGroup.style.display = e.target.checked ? '' : 'none';
        });
    });

    const setupBulkActions = (selectAllId, deselectAllId, containerId) => {
        const selectAllBtn = document.getElementById(selectAllId);
        const deselectAllBtn = document.getElementById(deselectAllId);
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
                    if (!cb.checked) {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            });
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
                    if (cb.checked) {
                        cb.checked = false;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            });
        }
    };

    setupBulkActions('tabsSelectAll', 'tabsDeselectAll', 'tab-controls-container');
    setupBulkActions('inputsSelectAll', 'inputsDeselectAll', 'input-controls-container');
    updatePrintStyles();
}

function handleShapeChange() {
    const selectedShape = document.querySelector('input[name="axleShape"]:checked').value;
    const collarGroup = dom['collar-size-group'];
    
    collarGroup.style.display = 'block';
    
    userSelectedAxleIndex = null;
    updateAllCalculations();
}

function handleAxleOverride() {
    if (dom.axleType.value !== "") {
        userSelectedAxleIndex = dom.axleType.value; 
        updateAllCalculations(); 
    }
}

async function processExcelFile(fileData) {
    userSelectedAxleIndex = null; 
    try {
        const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
        const required = {
            'Lath': ['Name', 'Kgs/ m2', 'Thickness', 'Compressed lath height', 'uncompressed lath height', 'Friction %', 'Max Width', 'Lath image', 'Moment of inertia iy', 'Allowable Bending Stress (MPa)', 'vision percentage', 'min axle diameter'],
            'Bottom lath': ['Bottom lath name', 'BLath weight / m length', 'BLath height'],
            'Axles': ['Name', 'Diameter', 'Wall Thickness', 'Material grade', "Density (kg/m3)", 'Shape'],
            'Motors': ['Name', 'Torque (Nm) min', 'Torque (Nm) max', 'RPM', 'Mounting type', 'Wattage', 'Voltage', 'Manufacturer', 'Usage type', 'Manual override', 'Motor image', 'Limit turn', 'Driveshaft diameter mm'],
            'SafetyB': ['Name', 'Max Safety Torque (Nm)', 'Operating Torque (Nm)', 'Driveshaft diameter mm', 'Stop distance', 'SB image'],
            'Endplate': ['Name', 'Size', 'Material', 'Fixing holes'],
            'Wicket doors': ['Name', 'Height', 'Width'],
            'Endlock': ['Description', 'Weight in grams', 'end lock offset'],
            'Guides': ['Name', 'Width', 'Penetration'],
            'Chaindrive': ['Motor Description', 'Sprocket teeth', 'Plate wheel', 'Chain size', 'Chain Breaking Strain in newtons', 'Sprocket diameter', 'Platewheel Diameter']
        };

        for (const sheetName in required) {
            if (!workbook.Sheets[sheetName]) {
                if (sheetName === 'Wicket doors' || sheetName === 'Endlock') {
                    if(sheetName === 'Wicket doors') wicketData = [];
                    if(sheetName === 'Endlock') endlockData = [];
                    continue;
                }
                throw new Error(`Required sheet "${sheetName}" not found or is empty in the Excel file.`);
            }
            const objectData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            switch (sheetName) {
                case 'Lath': lathData = objectData; break;
                case 'Bottom lath': bottomLathData = objectData; break;
                case 'Axles': axleData = objectData; break;
                case 'Motors': motorData = objectData; break;
                case 'SafetyB': safetyBrakeData = objectData; break;
                case 'Endplate': endplateData = objectData; break;
                case 'Wicket doors': wicketData = objectData; break;
                case 'Endlock': endlockData = objectData; break;
                case 'Guides': guideData = objectData; break;
                case 'Chaindrive': chainDriveData = objectData; break;
            }
        }

        lathImageMap.clear(); safetyBrakeImageMap.clear(); motorImageMap.clear();
        const exceljsWorkbook = new ExcelJS.Workbook();
        await exceljsWorkbook.xlsx.load(fileData);

        const lathSheet = exceljsWorkbook.getWorksheet('Lath');
        if (lathSheet) await extractImagesFromSheet(exceljsWorkbook, lathSheet, 'name', 'lath image', lathImageMap);
        
        const safetyBrakeSheet = exceljsWorkbook.getWorksheet('SafetyB');
        if (safetyBrakeSheet) await extractImagesFromSheet(exceljsWorkbook, safetyBrakeSheet, 'name', 'sb image', safetyBrakeImageMap);
        
        const motorSheet = exceljsWorkbook.getWorksheet('Motors');
        if (motorSheet) await extractImagesFromSheet(exceljsWorkbook, motorSheet, 'name', 'motor image', motorImageMap);

        populateDropdown(dom.lathType, lathData, 'Name');
        populateDropdown(dom.guideType, guideData, 'Name');
        const visionSelect = dom.visionLathType;
        visionSelect.innerHTML = `<option value="">-- Select a vision lath --</option>`;
        lathData.forEach((item, index) => {
            const visionKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'vision percentage');
            const visionValue = visionKey ? (parseFloat(item[visionKey]) || 0) : 0;
            if (visionValue > 0) {
                const option = document.createElement('option');
                option.value = index;
                const nameKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'name');
                option.textContent = item[nameKey];
                visionSelect.appendChild(option);
            }
        });
        populateDropdown(dom.bottomLathType, bottomLathData, 'Bottom lath name');
        populateDropdown(dom.endlockType, endlockData, 'Description');
        populateMotorMountingTypes();
        populateMotorVoltageFilter();
        populateMotorManufacturerFilter();
        populateMotorUsageFilter();
        populateMotorManualOverrideFilter();
        populateDropdown(dom.wicketDoorSelector, wicketData, 'Name');

        ['lathType', 'guideType', 'bottomLathType', 'visionLathType', 'motorMountingType', 'motorVoltageFilter', 'motorManufacturerFilter', 'motorUsageFilter', 'motorManualOverrideFilter', 'safetyBrakeSelector', 'axleType', 'endplateSelector', 'wicketDoorSelector', 'endlockType'].forEach(id => {
            if(dom[id]) dom[id].disabled = false;
        });

        updateSelectedWicketInfo(); 
        if(dom['import-status']) {
            dom['import-status'].textContent = 'Successfully loaded data from repository.';
            dom['import-status'].style.color = 'green';
        }
        updateAllCalculations();
        setupReportFilters();

    } catch (error) {
        if(dom['import-status']) {
            dom['import-status'].textContent = `Error processing Excel file: ${error.message}`;
            dom['import-status'].style.color = 'red';
        }
        alert(`Error Reading File: ${error.message}`);
        lathData = []; axleData = []; motorData = []; bottomLathData = []; safetyBrakeData = []; endplateData = []; wicketData = []; endlockData = []; guideData = []; chainDriveData = [];
    }
}

function handleCsvImport() {
    const csvFileInput = document.getElementById('csvFileInput');
    const statusDiv = document.getElementById('import-status-admin');
    
    if (!csvFileInput.files || csvFileInput.files.length === 0) {
        statusDiv.textContent = 'Please select a CSV file first.';
        statusDiv.style.color = 'red';
        return;
    }
    const file = csvFileInput.files[0];
    statusDiv.textContent = 'Importing...';
    statusDiv.style.color = '#555';

    Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                statusDiv.textContent = `Error parsing CSV: ${results.errors[0].message}`;
                statusDiv.style.color = 'red';
                return;
            }
            if (results.data.length === 0) {
                statusDiv.textContent = 'CSV file is empty or contains only headers.';
                statusDiv.style.color = 'red';
                return;
            }
            populateFieldsFromCsv(results.data[0]);
            statusDiv.textContent = `Successfully imported data for "${results.data[0].Calculation_ID || 'N/A'}".`;
            statusDiv.style.color = 'green';
        },
        error: function(err) {
                statusDiv.textContent = `An error occurred: ${err}`;
                statusDiv.style.color = 'red';
        }
    });
}

function populateFieldsFromCsv(data) {
    const getVal = (key) => (data[key] || '').trim();
    const mappings = {
        'Curtain_Width_mm': { id: 'width', type: 'number' },
        'Curtain_Height_mm': { id: 'height', type: 'number' },
        'Additional_Axle_Width_mm': { id: 'additionalLength', type: 'number' },
        'Collar_Size_mm': { id: 'collarSize', type: 'number' },
        'Friction_Allowance_Percent': { id: 'friction', type: 'number' },
        'Vision_Start_Height_mm': { id: 'visionStartHeight', type: 'number' },
        'Vision_Panel_Height_mm': { id: 'visionPanelHeight', type: 'number' },
        'Is_Powder_Coated': { id: 'powderCoated', type: 'checkbox' },
        'Has_Vision_Slats': { id: 'addVision', type: 'checkbox' },
        'Include_Deflection_In_Sizing': { id: 'includeDeflectionInSizing', type: 'checkbox' },
        'Lath_Type_Name': { id: 'lathType', type: 'select' },
        'Endlock_Type_Name': { id: 'endlockType', type: 'select' },
        'Bottom_Lath_Name': { id: 'bottomLathType', type: 'select' },
        'Vision_Lath_Name': { id: 'visionLathType', type: 'select' },
        'Motor_Mounting_Type': { id: 'motorMountingType', type: 'select' },
        'Wicket_Door_Name': { id: 'wicketDoorSelector', type: 'select' },
        'Endplate_Material': { name: 'material', type: 'radio' },
    };

    for (const key in mappings) {
        const value = getVal(key);
        if (value === '') continue;
        const config = mappings[key];
        switch (config.type) {
            case 'number':
                const numEl = document.getElementById(config.id);
                if (numEl) numEl.value = value;
                break;
            case 'checkbox':
                const checkEl = document.getElementById(config.id);
                if (checkEl) checkEl.checked = (value.toLowerCase() === 'true');
                break;
            case 'select':
                const selectEl = document.getElementById(config.id);
                if (selectEl) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].text.trim() === value.trim()) {
                            selectEl.value = selectEl.options[i].value;
                            break;
                        }
                    }
                }
                break;
            case 'radio':
                const radioEl = document.querySelector(`input[name="${config.name}"][value="${value}"]`);
                if (radioEl) radioEl.checked = true;
                break;
        }
    }
    dom.addVision.dispatchEvent(new Event('change'));
    updateAllCalculations();
    switchTab('inputs-content');
}

async function extractImagesFromSheet(workbook, sheet, nameColHeader, imageColHeader, imageMap) {
    let nameCol = -1, imageCol = -1;
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
        const headerText = cell.value ? cell.value.toString().toLowerCase().trim() : '';
        if (headerText === nameColHeader) nameCol = colNumber;
        if (headerText === imageColHeader) imageCol = colNumber;
    });

    if (nameCol > 0 && imageCol > 0) {
        const images = sheet.getImages();
        images.forEach(image => {
            const imageRowNumber = image.range.tl.row + 1;
            const nameCell = sheet.getCell(imageRowNumber, nameCol);
            if (nameCell && nameCell.value) {
                const name = nameCell.value.toString();
                const imgData = workbook.getImage(image.imageId);
                const base64Image = btoa(new Uint8Array(imgData.buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                const imageSrc = `data:image/${imgData.extension};base64,${base64Image}`;
                imageMap.set(name, imageSrc);
            }
        });
    }
}

function populateMotorMountingTypes() {
    const mountingTypes = [...new Set(motorData.map(motor => motor['Mounting type']))];
    const select = dom.motorMountingType;
    select.innerHTML = '<option value="">-- All Types --</option>';
    mountingTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type; option.textContent = type; select.appendChild(option);
    });
}

function populateMotorVoltageFilter() {
    let voltageKey = '';
    if (motorData.length > 0) {
        voltageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'voltage');
    }
    if (!voltageKey) { dom.motorVoltageFilter.parentElement.style.display = 'none'; return; }
    
    const allVoltages = motorData.map(motor => String(motor[voltageKey] || ''))
                                    .join('/')
                                    .split('/')
                                    .map(v => v.trim())
                                    .filter(v => v);
    
    const uniqueVoltageTypes = [...new Set(allVoltages)];
    const select = dom.motorVoltageFilter;
    select.innerHTML = '<option value="">-- All Voltages --</option>';
    uniqueVoltageTypes.sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type; option.textContent = type; select.appendChild(option);
    });
    dom.motorVoltageFilter.parentElement.style.display = 'block';
}

function populateMotorManufacturerFilter() {
    let manufacturerKey = '';
    if (motorData.length > 0) {
        manufacturerKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manufacturer');
    }
    if (!manufacturerKey) { dom.motorManufacturerFilter.parentElement.style.display = 'none'; return; }
    const manufacturers = [...new Set(motorData.map(motor => motor[manufacturerKey]).filter(m => m))];
    const select = dom.motorManufacturerFilter;
    select.innerHTML = '<option value="">-- All Manufacturers --</option>';
    manufacturers.sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type; option.textContent = type; select.appendChild(option);
    });
    dom.motorManufacturerFilter.parentElement.style.display = 'block';
}

function populateMotorUsageFilter() {
    let usageKey = '';
    if (motorData.length > 0) {
        usageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'usage type');
    }
    if (!usageKey) { dom.motorUsageFilter.parentElement.style.display = 'none'; return; }
    const usageTypes = [...new Set(motorData.map(motor => motor[usageKey]).filter(m => m))];
    const select = dom.motorUsageFilter;
    select.innerHTML = '<option value="">-- All Usage Types --</option>';
    usageTypes.sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type; option.textContent = type; select.appendChild(option);
    });
    dom.motorUsageFilter.parentElement.style.display = 'block';
}

function populateMotorManualOverrideFilter() {
    let moKey = '';
    if (motorData.length > 0) {
        moKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manual override');
    }
    if (!moKey) { dom.motorManualOverrideFilter.parentElement.style.display = 'none'; return; }
    const moValues = [...new Set(motorData.map(motor => motor[moKey]).filter(v => v))];
    const select = dom.motorManualOverrideFilter;
    select.innerHTML = '<option value="">-- All --</option>';
    moValues.sort().forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        select.appendChild(option);
    });
    dom.motorManualOverrideFilter.parentElement.style.display = 'block';
}

function getLathWithCustomWeight() {
    let selectedLath = lathData[dom.lathType.value];
    if (!selectedLath) return null;
    if (dom.useCustomLath.checked) {
        const customWeight = parseFloat(dom.customLathWeight.value);
        if (!isNaN(customWeight) && customWeight > 0) {
            let customLath = { ...selectedLath };
            const weightKey = Object.keys(customLath).find(k => k.toLowerCase().trim() === 'kgs/ m2');
            if (weightKey) { customLath[weightKey] = customWeight; } else { customLath['Kgs/ m2'] = customWeight; }
            return customLath;
        }
    }
    return selectedLath;
}

function getCalculatedWidths() {
    const inputWidth = parseFloat(dom.width.value) || 0;
    const widthType = dom.widthType.value;
    const selectedGuideIndex = dom.guideType.value;
    let curtainWidth = 0, clearOpening = 0, overallWidth = 0;

    if (selectedGuideIndex !== "" && guideData[selectedGuideIndex]) {
        const guide = guideData[selectedGuideIndex];
        const penetrationKey = Object.keys(guide).find(k => k.toLowerCase().trim() === 'penetration');
        const widthKey = Object.keys(guide).find(k => k.toLowerCase().trim() === 'width');
        const guidePenetration = parseFloat(guide[penetrationKey]) || 0;
        const guideWidth = parseFloat(guide[widthKey]) || 0;

        if (widthType === 'curtainWidth') {
            curtainWidth = inputWidth;
            clearOpening = curtainWidth - (2 * guidePenetration);
            overallWidth = clearOpening + (2 * guideWidth);
        } else if (widthType === 'clearOpening') {
            clearOpening = inputWidth;
            curtainWidth = clearOpening + (2 * guidePenetration);
            overallWidth = clearOpening + (2 * guideWidth);
        } else if (widthType === 'overall') {
            overallWidth = inputWidth;
            clearOpening = overallWidth - (2 * guideWidth);
            curtainWidth = clearOpening + (2 * guidePenetration);
        }
    } else {
        curtainWidth = inputWidth; clearOpening = inputWidth; overallWidth = inputWidth;
    }
    dom['calculated-curtain-width'].textContent = curtainWidth.toFixed(0);
    dom['calculated-clear-opening'].textContent = clearOpening.toFixed(0);
    dom['calculated-overall-width'].textContent = overallWidth.toFixed(0);
    return { curtainWidth, clearOpening, overallWidth };
}

function updateAllCalculations() {
    if (lathData.length === 0) { return; };
    const calculatedWidths = getCalculatedWidths();
    const curtainWidth = calculatedWidths.curtainWidth;
    const effectiveLath = getLathWithCustomWeight();
    const lathImageContainer = document.getElementById('lath-image-container');
    const lathImageDisplay = document.getElementById('lathImageDisplay');
    
    if (effectiveLath) {
        const selectedLathName = effectiveLath['Name'];
        if (lathImageMap.has(selectedLathName)) {
            lathImageDisplay.src = lathImageMap.get(selectedLathName);
            lathImageContainer.style.display = dom.useCustomLath.checked ? 'none' : 'block';
        } else { lathImageContainer.style.display = 'none'; }
    } else { lathImageContainer.style.display = 'none'; }

    const visionLathImageContainer = document.getElementById('vision-lath-image-container');
    const visionLathImageDisplay = document.getElementById('visionLathImageDisplay');
    if (dom.addVision.checked) {
        const selectedVisionLathIndex = dom.visionLathType.value;
            if (selectedVisionLathIndex && lathData[selectedVisionLathIndex]) {
            const selectedVisionLathName = lathData[selectedVisionLathIndex]['Name'];
            if (lathImageMap.has(selectedVisionLathName)) {
                visionLathImageDisplay.src = lathImageMap.get(selectedVisionLathName);
                visionLathImageContainer.style.display = 'block';
            } else { visionLathImageContainer.style.display = 'none'; }
        } else { visionLathImageContainer.style.display = 'none'; }
    } else { visionLathImageContainer.style.display = 'none'; }

    const widthWarningDiv = dom['width-warning'];
    if (effectiveLath) {
        const maxWidthKey = Object.keys(effectiveLath).find(k => k.toLowerCase().trim() === 'max width');
        const maxWidth = maxWidthKey ? parseFloat(effectiveLath[maxWidthKey]) : 0;
        if (maxWidth > 0 && curtainWidth > maxWidth && !dom.useCustomLath.checked) {
            widthWarningDiv.textContent = `Warning: Calculated curtain width (${curtainWidth.toFixed(0)} mm) exceeds the maximum of ${maxWidth} mm for this lath type.`;
            widthWarningDiv.style.display = 'block';
        } else { widthWarningDiv.style.display = 'none'; }
    } else { widthWarningDiv.style.display = 'none'; }
    
    if (axleData.length === 0 || safetyBrakeData.length === 0) {
        drawDeflectionGraphic(0, 0); drawAxleCrossSection(null); calculateSafetyBrakeSelection(); drawShutterGraphic(); return;
    };
    
    const selectedBottomLath = bottomLathData[dom.bottomLathType.value];
    const estCurtainProps = calculateCurtainProperties(effectiveLath, selectedBottomLath, null, curtainWidth);
    const { bestAxle } = findAndSetBestAxle(estCurtainProps.totalWeight, curtainWidth);

    const finalCurtainProps = calculateCurtainProperties(effectiveLath, selectedBottomLath, bestAxle, curtainWidth);
    const { totalWeight, torqueWeight, travelHeight, fullCurtainLength, visionData, endlockOffsets } = finalCurtainProps;
    visionCalcs = visionData;
    calculateEndplateRecommendation(); 

    const { deflection, totalLength } = findAndSetBestAxle(totalWeight, curtainWidth);
    drawDeflectionGraphic(totalLength, deflection);
    calculateMotorRecommendation(torqueWeight, effectiveLath, bestAxle, travelHeight, curtainWidth);
    calculateSafetyBrakeSelection();
    
    const selectedEndplateIndex = dom.endplateSelector.value;
    const selectedEndplate = (selectedEndplateIndex !== "" && currentFilteredEndplates[selectedEndplateIndex]) ? currentFilteredEndplates[selectedEndplateIndex] : null;
    drawShutterGraphic(curtainWidth, parseFloat(dom.additionalLength.value), parseInt(dom['lath-count'].textContent), effectiveLath, selectedBottomLath, bestAxle, selectedEndplate, visionData, endlockOffsets);
    const selectedGuide = guideData.length > 0 ? guideData[dom.guideType.value] : null;
    drawTopDownWidthGraphic(calculatedWidths, selectedGuide);
    updateWicketCalculationsAndGraphic(endlockOffsets, curtainWidth);
    
    // Chain Calculation
    updateChainCalculations();
}

function updateChainCalculations() {
    // Get inputs
    const motorTeeth = parseInt(dom.motorTeeth.value) || 0;
    const barrelTeeth = parseInt(dom.barrelTeeth.value) || 0;
    const chainPitch = parseFloat(dom.chainPitch.value) || 0;
    const maxTorqueRequired = parseFloat(dom['max-torque'].textContent) || 0;
    const plateWheelDia = parseFloat(dom.plateWheelDiameter.value) || 0;

    if (motorTeeth <= 0 || barrelTeeth <= 0 || maxTorqueRequired <= 0) {
            ['chain-ratio', 'chain-torque-barrel', 'chain-torque-motor', 'chain-tension', 'chain-breaking-load', 'chain-safety-factor', 'chain-tension-n', 'chain-breaking-load-n'].forEach(id => { 
                const el = dom[id]; if(el) el.textContent = '0.0'; 
            });
            dom['chain-safety-factor'].classList.remove('warning-text', 'option-pass');
            drawChainGraphic(0, 0, 0, 0, 0, 0);
            return;
    }

    const ratio = barrelTeeth / motorTeeth;
    dom['chain-ratio'].textContent = `1 : ${ratio.toFixed(2)}`;
    dom['chain-torque-barrel'].textContent = maxTorqueRequired.toFixed(1);
    const motorTorque = maxTorqueRequired / ratio;
    dom['chain-torque-motor'].textContent = motorTorque.toFixed(1);

    let tensionN = 0;
    if (plateWheelDia > 0) {
        const radiusM = (plateWheelDia / 2) / 1000;
        tensionN = maxTorqueRequired / radiusM;
    }
    
    const tensionKg = tensionN / 9.81;

    dom['chain-tension-n'].textContent = tensionN.toFixed(1);
    dom['chain-tension'].textContent = tensionKg.toFixed(1);

    let safetyFactor = 0;
    let breakStrainN = 0;
    if (dom.chainSizeDisplay.dataset.breakingStrain) {
        breakStrainN = parseFloat(dom.chainSizeDisplay.dataset.breakingStrain);
    }

    dom['chain-breaking-load-n'].textContent = breakStrainN > 0 ? breakStrainN.toFixed(0) : 'N/A';
    
    if (breakStrainN > 0 && tensionN > 0) {
        safetyFactor = breakStrainN / tensionN;
        dom['chain-safety-factor'].textContent = safetyFactor.toFixed(2);
        
        if (safetyFactor < 6.0) { 
                dom['chain-safety-factor'].classList.add('warning-text');
                dom['chain-safety-factor'].classList.remove('option-pass');
                dom['chain-safety-factor'].textContent += " (FAIL < 6:1)";
        } else {
                dom['chain-safety-factor'].classList.remove('warning-text');
                dom['chain-safety-factor'].classList.add('option-pass');
        }
    } else {
        dom['chain-safety-factor'].textContent = 'N/A';
    }

    const motorDriveshaft = parseFloat(dom['motor-driveshaft-dia'].textContent) || 0;
    const sprocketDia = parseFloat(dom.sprocketDiameter.value) || 0;

    drawChainGraphic(motorTeeth, barrelTeeth, chainPitch, sprocketDia, plateWheelDia, motorDriveshaft);
}

function drawChainGraphic(motorTeeth, barrelTeeth, pitch, sprocketDia, plateWheelDia, driveshaftDia) {
    const container = dom['chain-graphic-container']; container.innerHTML = '';
    if (!motorTeeth || !barrelTeeth || !pitch) return;

    const pdMotor = (sprocketDia > 0) ? sprocketDia : pitch / Math.sin(Math.PI / motorTeeth);
    const pdBarrel = (plateWheelDia > 0) ? plateWheelDia : pitch / Math.sin(Math.PI / barrelTeeth);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const width = 550; const height = 300;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    const maxDia = Math.max(pdMotor, pdBarrel);
    const padding = 50;
    const centerDist = maxDia * 1.5 + 100; 
    const totalGraphicWidth = centerDist + (pdMotor/2) + (pdBarrel/2);
    const verticalSpaceNeeded = maxDia + 100;
    const scale = Math.min((width - 2*padding) / totalGraphicWidth, (height - 100) / verticalSpaceNeeded);
    const r1 = (pdMotor / 2) * scale;
    const r2 = (pdBarrel / 2) * scale;
    const d = centerDist * scale;
    const c1x = padding + r1; const c1y = height / 2;
    const c2x = c1x + d; const c2y = height / 2;

    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker'); marker.setAttribute('id', 'dim-arrow-chain'); marker.setAttribute('viewBox', '0 0 10 10'); marker.setAttribute('refX', '5'); marker.setAttribute('refY', '5'); marker.setAttribute('markerWidth', '4'); marker.setAttribute('markerHeight', '4'); marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path'); arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', '#343a40'); marker.appendChild(arrowPath); defs.appendChild(marker); svg.appendChild(defs);

    const createGearPath = (cx, cy, radius, teeth) => {
        const outerR = radius + (4 * scale); 
        const innerR = radius - (4 * scale); 
        let path = "";
        const step = (Math.PI * 2) / teeth;
        for (let i = 0; i < teeth; i++) {
            const angle = i * step;
            const halfStep = step / 4;
            const a1 = angle - halfStep;
            path += (i===0 ? "M" : "L") + (cx + Math.cos(a1)*innerR) + "," + (cy + Math.sin(a1)*innerR);
            const a2 = angle - halfStep/2;
            path += "L" + (cx + Math.cos(a2)*outerR) + "," + (cy + Math.sin(a2)*outerR);
            const a3 = angle + halfStep/2;
            path += "L" + (cx + Math.cos(a3)*outerR) + "," + (cy + Math.sin(a3)*outerR);
            const a4 = angle + halfStep;
            path += "L" + (cx + Math.cos(a4)*innerR) + "," + (cy + Math.sin(a4)*innerR);
        }
        path += "Z";
        return path;
    };

    const gear1 = document.createElementNS(svgNS, 'path');
    gear1.setAttribute('d', createGearPath(c1x, c1y, r1, motorTeeth));
    gear1.setAttribute('class', 'sprocket-wheel');
    svg.appendChild(gear1);

    const gear2 = document.createElementNS(svgNS, 'path');
    gear2.setAttribute('d', createGearPath(c2x, c2y, r2, barrelTeeth));
    gear2.setAttribute('class', 'sprocket-wheel');
    svg.appendChild(gear2);

    if(driveshaftDia > 0) {
        const rShaft = (driveshaftDia / 2) * scale;
        const shaft = document.createElementNS(svgNS, 'circle');
        shaft.setAttribute('cx', c1x); shaft.setAttribute('cy', c1y);
        shaft.setAttribute('r', rShaft);
        shaft.setAttribute('class', 'chain-driveshaft');
        svg.appendChild(shaft);
        
        const labelY = c1y - r1 - 35;
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', c1x); line.setAttribute('y1', c1y - rShaft);
        line.setAttribute('x2', c1x - 20); line.setAttribute('y2', labelY + 5);
        line.setAttribute('class', 'leader-line');
        svg.appendChild(line);
        
        const textDS = document.createElementNS(svgNS, 'text');
        textDS.setAttribute('x', c1x - 25); textDS.setAttribute('y', labelY);
        textDS.setAttribute('class', 'graph-data-label');
        textDS.setAttribute('text-anchor', 'end');
        textDS.textContent = `Ø${driveshaftDia} Driveshaft`;
        svg.appendChild(textDS);
    }

    const barrelCenter = document.createElementNS(svgNS, 'circle');
    barrelCenter.setAttribute('cx', c2x); barrelCenter.setAttribute('cy', c2y);
    barrelCenter.setAttribute('r', 3);
    barrelCenter.setAttribute('fill', '#495057');
    svg.appendChild(barrelCenter);

    if (d > Math.abs(r2 - r1)) {
        const alpha = Math.asin((r2 - r1) / d);
        const t1x_t = c1x + r1 * Math.sin(alpha);
        const t1y_t = c1y - r1 * Math.cos(alpha);
        const t1x_b = c1x + r1 * Math.sin(alpha); 
        const t1y_b = c1y + r1 * Math.cos(alpha);
        const t2x_t = c2x + r2 * Math.sin(alpha);
        const t2y_t = c2y - r2 * Math.cos(alpha);
        const t2x_b = c2x + r2 * Math.sin(alpha);
        const t2y_b = c2y + r2 * Math.cos(alpha);
        
        const path = document.createElementNS(svgNS, 'path');
        const dPath = `M ${t1x_t},${t1y_t} 
                        L ${t2x_t},${t2y_t} 
                        A ${r2},${r2} 0 1 1 ${t2x_b},${t2y_b} 
                        L ${t1x_b},${t1y_b} 
                        A ${r1},${r1} 0 0 1 ${t1x_t},${t1y_t}`;
        
        const chainBg = document.createElementNS(svgNS, 'path');
        chainBg.setAttribute('d', dPath);
        chainBg.setAttribute('class', 'chain-path-bg');
        svg.appendChild(chainBg);

        path.setAttribute('d', dPath);
        path.setAttribute('class', 'chain-path');
        svg.appendChild(path);
    }

    const text1 = document.createElementNS(svgNS, 'text');
    text1.setAttribute('x', c1x); text1.setAttribute('y', c1y + r1 + 25); 
    text1.setAttribute('class', 'graph-text'); 
    text1.style.fontWeight = "bold";
    text1.textContent = "Motor Sprocket";
    svg.appendChild(text1);

    const sub1 = document.createElementNS(svgNS, 'text');
    sub1.setAttribute('x', c1x); sub1.setAttribute('y', c1y + r1 + 40); 
    sub1.setAttribute('class', 'graph-data-label'); 
    sub1.textContent = `${motorTeeth} Teeth`;
    svg.appendChild(sub1);
    
    const sub1a = document.createElementNS(svgNS, 'text');
    sub1a.setAttribute('x', c1x); sub1a.setAttribute('y', c1y + r1 + 52); 
    sub1a.setAttribute('class', 'graph-data-label'); 
    sub1a.textContent = `Ø${pdMotor.toFixed(1)} mm`;
    svg.appendChild(sub1a);

    const text2 = document.createElementNS(svgNS, 'text');
    text2.setAttribute('x', c2x); text2.setAttribute('y', c2y + r2 + 25); 
    text2.setAttribute('class', 'graph-text'); 
    text2.style.fontWeight = "bold";
    text2.textContent = "Barrel Plate Wheel";
    svg.appendChild(text2);

    const sub2 = document.createElementNS(svgNS, 'text');
    sub2.setAttribute('x', c2x); sub2.setAttribute('y', c2y + r2 + 40); 
    sub2.setAttribute('class', 'graph-data-label'); 
    sub2.textContent = `${barrelTeeth} Teeth`;
    svg.appendChild(sub2);
    
    const sub2a = document.createElementNS(svgNS, 'text');
    sub2a.setAttribute('x', c2x); sub2a.setAttribute('y', c2y + r2 + 52); 
    sub2a.setAttribute('class', 'graph-data-label'); 
    sub2a.textContent = `Ø${pdBarrel.toFixed(1)} mm`;
    svg.appendChild(sub2a);

    const drawDim = (cx, cy, r) => {
        const lineY = cy - r - 10;
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', cx - r); line.setAttribute('y1', lineY);
        line.setAttribute('x2', cx + r); line.setAttribute('y2', lineY);
        line.setAttribute('class', 'dimension-line');
        line.setAttribute('marker-start', 'url(#dim-arrow-chain)');
        line.setAttribute('marker-end', 'url(#dim-arrow-chain)');
        svg.appendChild(line);
        
        const l1 = document.createElementNS(svgNS, 'line');
        l1.setAttribute('x1', cx - r); l1.setAttribute('y1', cy);
        l1.setAttribute('x2', cx - r); l1.setAttribute('y2', lineY);
        l1.setAttribute('class', 'leader-line'); svg.appendChild(l1);
        
        const l2 = document.createElementNS(svgNS, 'line');
        l2.setAttribute('x1', cx + r); l2.setAttribute('y1', cy);
        l2.setAttribute('x2', cx + r); l2.setAttribute('y2', lineY);
        l2.setAttribute('class', 'leader-line'); svg.appendChild(l2);
    };

    drawDim(c1x, c1y, r1);
    drawDim(c2x, c2y, r2);

    container.appendChild(svg);
}

function findAndSetBestAxle(totalWeightKgs, curtainWidth) {
    const width = curtainWidth || 0;
    const additionalLength = parseFloat(dom.additionalLength.value) || 0;
    const totalLength = width + additionalLength;
    dom['total-axle-length'].textContent = totalLength.toFixed(0);

    const selectedShape = document.querySelector('input[name="axleShape"]:checked')?.value || 'circular';
    if (totalLength <= 0 || axleData.length === 0) {
            ['axle-deflection', 'deflection-ratio', 'axle-weight', 'moment-of-inertia', 'total-deflection-weight', 'axle-safety-factor'].forEach(id => dom[id].textContent = '0.00');
        dom['axle-material-grade'].textContent = 'N/A'; dom.axleType.innerHTML = '<option>-- No data --</option>'; drawAxleCrossSection(null);
        return { bestAxle: null, deflection: 0, totalLength: 0 };
    }

    const axlesForShape = axleData.map((axle, index) => ({ ...axle, originalIndex: index })).filter(axle => {
        const axleShapeInSheet = (axle.Shape || 'circular').toLowerCase().trim();
        return axleShapeInSheet === selectedShape; 
    });

    if (axlesForShape.length === 0) {
        dom.axleType.innerHTML = `<option>-- No suitable ${selectedShape} axles available --</option>`;
        ['axle-deflection', 'deflection-ratio', 'axle-weight', 'moment-of-inertia', 'total-deflection-weight', 'axle-safety-factor'].forEach(id => dom[id].textContent = '0.00');
        dom['axle-material-grade'].textContent = 'N/A'; drawAxleCrossSection(null);
        return { bestAxle: null, deflection: 0, totalLength: 0 };
    }

    let requiredRatio = 400;
    if (curtainWidth > 10000) requiredRatio = 800;
    else if (curtainWidth > 8000) requiredRatio = 600;

    let recommendedAxleOriginalIndex = -1;
    const axlePerformances = [];
    axlesForShape.forEach(currentAxle => {
        const perf = performDeflectionCalc(totalWeightKgs, currentAxle, totalLength, curtainWidth);
        axlePerformances.push(perf);
        const passesTest = perf.ratio >= requiredRatio && perf.deflection <= 17;
        if (passesTest && recommendedAxleOriginalIndex === -1) {
            recommendedAxleOriginalIndex = currentAxle.originalIndex;
        }
    });
    if (recommendedAxleOriginalIndex === -1) { recommendedAxleOriginalIndex = axlesForShape.length > 0 ? axlesForShape[0].originalIndex : -1; }
    let finalSelectedOriginalIndex = userSelectedAxleIndex !== null ? userSelectedAxleIndex : recommendedAxleOriginalIndex;
    
    const isUserSelectionValid = axlesForShape.some(axle => axle.originalIndex == finalSelectedOriginalIndex);
    if (userSelectedAxleIndex !== null && !isUserSelectionValid) { 
        finalSelectedOriginalIndex = recommendedAxleOriginalIndex; 
    }

    const select = dom.axleType; select.innerHTML = '';
    axlesForShape.forEach((axle, index) => {
        const perf = axlePerformances[index];
        const option = document.createElement('option');
        option.value = axle.originalIndex;
        let optionText = axle['Name'];
        if (axle['Alternate name']) optionText += ` (${axle['Alternate name']})`;
        option.textContent = optionText;
        const passesTest = perf.ratio >= requiredRatio && perf.deflection <= 17;
        option.classList.toggle('option-pass', passesTest);
        option.classList.toggle('option-fail', !passesTest);
        select.appendChild(option);
    });
    
    if (finalSelectedOriginalIndex > -1) { select.value = finalSelectedOriginalIndex; }
    const selectedAxleData = axleData[select.value];
    if (!selectedAxleData) { drawAxleCrossSection(null); return { bestAxle: null, deflection: 0, totalLength }; }

    const finalPerformance = performDeflectionCalc(totalWeightKgs, selectedAxleData, totalLength, curtainWidth);
    dom['axle-weight'].textContent = finalPerformance.axleWeight.toFixed(2);
    const totalDeflectionWeight = totalWeightKgs + finalPerformance.axleWeight;
    dom['total-deflection-weight'].textContent = totalDeflectionWeight.toFixed(2);
    dom['axle-material-grade'].textContent = finalPerformance.materialGradeValue ? `${finalPerformance.materialGradeValue} MPa` : 'N/A';
    dom['moment-of-inertia'].textContent = finalPerformance.inertiaI.toLocaleString(undefined, { maximumFractionDigits: 2 });
    dom['axle-deflection'].textContent = finalPerformance.deflection.toFixed(2);
    dom['deflection-ratio'].textContent = (finalPerformance.ratio !== Infinity) ? `1 : ${Math.round(finalPerformance.ratio)} (Required 1:${requiredRatio})` : 'N/A';
    dom['axle-safety-factor'].textContent = isFinite(finalPerformance.safetyFactor) ? finalPerformance.safetyFactor.toFixed(2) : 'Very High';

    if (finalPerformance.ratio < requiredRatio || finalPerformance.deflection > 17) {
        dom['ratio-paragraph'].classList.add('warning-text');
        dom['axle-safety-factor'].parentElement.classList.add('warning-text');
        dom['recommendation-box'].style.display = 'block';
        const nextBest = axlesForShape.find(axle => {
            const perf = performDeflectionCalc(totalWeightKgs, axle, totalLength, curtainWidth);
            return perf.ratio >= requiredRatio && perf.deflection <= 17;
        });
        if (nextBest) { dom['recommendation-box'].innerHTML = `⚠️ <strong>Warning:</strong> Selected axle failed. Max allowable deflection is 17mm. Consider using <strong>${nextBest['Name']}</strong>.`; } else { dom['recommendation-box'].innerHTML = `⚠️ <strong>Critical Warning:</strong> No available ${selectedShape} axle passes the 1:${requiredRatio} ratio and 17mm deflection limit.`; }
    } else {
        dom['ratio-paragraph'].classList.remove('warning-text');
        dom['axle-safety-factor'].parentElement.classList.remove('warning-text');
        dom['recommendation-box'].style.display = 'none';
    }
    const collarSize = parseFloat(dom.collarSize.value) || 0;
    drawAxleCrossSection(selectedAxleData, collarSize);
    return { bestAxle: selectedAxleData, deflection: finalPerformance.deflection, totalLength };
}

function performDeflectionCalc(totalWeightKgs, axle, totalLength, curtainWidth) {
    if (!axle) return { deflection: 0, ratio: Infinity, safetyFactor: Infinity, axleWeight: 0, materialGradeValue: 'N/A', inertiaI: 0 };
    
    const outerDia = parseFloat(axle['Diameter']);
    const wallThick = parseFloat(axle['Wall Thickness']);
    const shape = (axle['Shape'] || 'circular').toLowerCase();
    const lengthM = totalLength / 1000;
    const density = parseFloat(axle['Density (kg/m3)']) || 0;
    const materialGradeValue = axle['Material grade'];
    const youngsModulusE = parseFloat(materialGradeValue) || 199000;
    
    let inertiaI = 0, axleWeight = 0;

    if (shape === 'octagonal') {
        const Do = outerDia; const Di = Do - 2 * wallThick;
        inertiaI = ((11 + 8 * Math.sqrt(2)) / 192) * (Math.pow(Do, 4) - Math.pow(Di, 4));
        const outerArea = 2 * (Math.sqrt(2) - 1) * Math.pow(Do, 2);
        const innerArea = 2 * (Math.sqrt(2) - 1) * Math.pow(Di, 2);
        const hollowArea_mm2 = outerArea - innerArea;
        const volume_m3 = (hollowArea_mm2 / 1000000) * lengthM;
        axleWeight = volume_m3 * density;
    } else {
        inertiaI = (Math.PI / 64) * (Math.pow(outerDia, 4) - Math.pow(outerDia - 2 * wallThick, 4));
        const outerRadiusM = outerDia / 2 / 1000;
        const innerRadiusM = (outerDia - 2 * wallThick) / 2 / 1000;
        const volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * lengthM;
        axleWeight = volumeM3 * density;
    }
    
    const totalForceW = (totalWeightKgs + axleWeight) * 9.81;
    const fixityInput = document.getElementById('axleFixity');
    const fixityPercent = fixityInput ? (parseFloat(fixityInput.value) || 0) : 0;
    const safePercent = Math.max(0, Math.min(100, fixityPercent));
    const coefficient = 5 - (4 * (safePercent / 100));

    const deflection = (totalLength > 0 && inertiaI > 0 && youngsModulusE > 0) 
        ? (coefficient * totalForceW * Math.pow(totalLength, 3)) / (384 * youngsModulusE * inertiaI) 
        : 0;
        
    const ratio = (deflection > 0) ? totalLength / deflection : Infinity;
    
    let requiredRatio = 400;
    if (curtainWidth > 10000) requiredRatio = 800;
    else if (curtainWidth > 8000) requiredRatio = 600;

    const safetyFactor = ratio / requiredRatio;
    return { deflection, ratio, safetyFactor, axleWeight, materialGradeValue, inertiaI };
}

function getEffectiveCoilDiameter(axle) {
    if (!axle) return 0;
    const shape = (axle['Shape'] || 'circular').toLowerCase();
    const diameter = parseFloat(axle['Diameter']) || 0;
    if (shape === 'octagonal') { return diameter / Math.cos(Math.PI / 8); }
    return diameter;
}

function calculateEndplateRecommendation() {
    if (endplateData.length === 0) return;
    dom['max-coil-diameter'].textContent = maxCoilDiameter.toFixed(1);
    const axleDeflection = parseFloat(dom['axle-deflection'].textContent) || 0;
    let effectiveCoilDiameter = maxCoilDiameter;

    if (dom.includeDeflectionInSizing.checked && axleDeflection > 0) {
        effectiveCoilDiameter += axleDeflection;
        dom['effective-coil-diameter'].textContent = effectiveCoilDiameter.toFixed(1);
        dom['effective-coil-para'].style.display = 'block';
    } else { dom['effective-coil-para'].style.display = 'none'; }
    
    const selectedMaterial = dom.matSteel.checked ? 'Steel' : 'Aluminium';
    currentFilteredEndplates = endplateData.filter(plate => plate.Material.toLowerCase() === selectedMaterial.toLowerCase()).sort((a, b) => a.Size - b.Size);
    const select = dom.endplateSelector;
    select.innerHTML = '';

    if (currentFilteredEndplates.length === 0) {
        select.innerHTML = `<option value="">-- No ${selectedMaterial} plates --</option>`;
        updateSelectedEndplateInfo(); return;
    }
    let recommendedPlateIndex = -1;
    currentFilteredEndplates.forEach((plate, index) => {
        const option = document.createElement('option');
        option.value = index; option.textContent = `${plate.Name} (${plate.Size} mm)`;
        if (plate.Size >= effectiveCoilDiameter) {
            option.classList.add('option-pass');
            if (recommendedPlateIndex === -1) { recommendedPlateIndex = index; }
        } else {
            option.classList.add('option-fail'); option.disabled = true;
        }
        select.appendChild(option);
    });

    if (recommendedPlateIndex !== -1) { select.value = recommendedPlateIndex; } else {
            const noPlateOption = document.createElement('option');
        noPlateOption.value = ""; noPlateOption.textContent = "-- Coil too large for available plates --";
        noPlateOption.selected = true; noPlateOption.disabled = true;
        select.prepend(noPlateOption); drawEndplateGraphic(null, 0, null, null, 0); 
    }
    updateSelectedEndplateInfo();
}

function calculateMaxFloorToAxleHeight(endplateSize, lath, bottomLath, axle) {
    if (!lath || !axle || !bottomLath || !endplateSize || endplateSize <= 0) return 0;
    const collarSize = parseFloat(dom.collarSize.value) || 0;
    const axleCoilDiameter = getEffectiveCoilDiameter(axle);
    const effectiveStartDiameter = Math.max(axleCoilDiameter, collarSize);
    const axleRadius = effectiveStartDiameter / 2;

    const lathThickness = parseFloat(lath['Thickness']);
    const lathCompressedHeight = parseFloat(lath['Compressed lath height']);
    const uncompressedLathHeight = parseFloat(lath['uncompressed lath height']) || lathCompressedHeight;
    const bottomLathHeight = parseFloat(bottomLath['BLath height']) || 0;

    if (lathThickness <= 0 || effectiveStartDiameter <= 0 || endplateSize <= effectiveStartDiameter || uncompressedLathHeight <= 0) return 0;
    const maxRevolutions = (endplateSize - effectiveStartDiameter) / (2 * lathThickness);
    if (maxRevolutions <= 0) return 0;
    const maxCurtainLength = Math.PI * lathThickness * Math.pow(maxRevolutions, 2) + Math.PI * effectiveStartDiameter * maxRevolutions;
    const numLaths = (maxCurtainLength - bottomLathHeight) / uncompressedLathHeight;
    const heightToCoverByLaths = numLaths * lathCompressedHeight;
    const maxFloorToAxleHeight = heightToCoverByLaths + bottomLathHeight - axleRadius;
    return maxFloorToAxleHeight > 0 ? maxFloorToAxleHeight : 0;
}

function updateSelectedEndplateInfo() {
    const selectedIndex = parseInt(dom.endplateSelector.value, 10);
    const selectedLath = lathData.length > 0 ? lathData[dom.lathType.value] : null;
    const selectedAxle = axleData.length > 0 ? axleData[dom.axleType.value] : null;
    const selectedBottomLath = bottomLathData.length > 0 ? bottomLathData[dom.bottomLathType.value] : null;
    const numLaths = parseInt(dom['lath-count'].textContent) || 0;

    if (isNaN(selectedIndex) || !currentFilteredEndplates[selectedIndex]) {
        ['endplate-name', 'endplate-size', 'endplate-material'].forEach(id => { dom[id].textContent = 'N/A'; });
        ['prev-endplate-name', 'prev-endplate-height', 'next-endplate-name', 'next-endplate-height'].forEach(id => { dom[id].textContent = 'N/A'; });
        drawEndplateGraphic(null, 0, null, null, 0); calculateEndplateForces(null);
        return;
    }

    const plate = currentFilteredEndplates[selectedIndex];
    dom['endplate-name'].textContent = plate.Name;
    dom['endplate-size'].textContent = plate.Size;
    dom['endplate-material'].textContent = plate.Material;

    drawEndplateGraphic(plate, maxCoilDiameter, selectedAxle, selectedLath, numLaths);
    calculateEndplateForces(plate);
    
    const prevPlate = selectedIndex > 0 ? currentFilteredEndplates[selectedIndex - 1] : null;
    if (prevPlate && selectedLath && selectedAxle && selectedBottomLath) {
        dom['prev-endplate-name'].textContent = `${prevPlate.Name} (${prevPlate.Size}mm)`;
        const maxHeight = calculateMaxFloorToAxleHeight(prevPlate.Size, selectedLath, selectedBottomLath, selectedAxle);
        dom['prev-endplate-height'].textContent = maxHeight > 0 ? maxHeight.toFixed(0) : 'Too small';
    } else { dom['prev-endplate-name'].textContent = 'N/A'; dom['prev-endplate-height'].textContent = 'N/A'; }
    
    const nextPlate = selectedIndex < currentFilteredEndplates.length - 1 ? currentFilteredEndplates[selectedIndex + 1] : null;
    if (nextPlate && selectedLath && selectedAxle && selectedBottomLath) {
        dom['next-endplate-name'].textContent = `${nextPlate.Name} (${nextPlate.Size}mm)`;
            const maxHeight = calculateMaxFloorToAxleHeight(nextPlate.Size, selectedLath, selectedBottomLath, selectedAxle);
        dom['next-endplate-height'].textContent = maxHeight > 0 ? maxHeight.toFixed(0) : 'N/A';
    } else { dom['next-endplate-name'].textContent = 'N/A'; dom['next-endplate-height'].textContent = 'N/A'; }
}

function calculateEndplateForces(selectedPlate) {
    if (!selectedPlate) {
        dom['endplate-downward-force'].textContent = '0'; dom['endplate-pullout-force'].textContent = '0';
        drawEndplateForceDiagram(0, 0, 0, 0, 0); return;
    }
    const fixingHolesKey = Object.keys(selectedPlate).find(k => k.toLowerCase().trim() === 'fixing holes');
    const fixingHoleSeparation = fixingHolesKey ? parseFloat(selectedPlate[fixingHolesKey]) : 0;
    const fixingHoleSeparationM = fixingHoleSeparation / 1000;
    const curtainWeightKgs = parseFloat(dom['weight-kg'].textContent) || 0;
    const axleWeightKgs = parseFloat(dom['axle-weight'].textContent) || 0;
    const totalStaticWeightKgs = curtainWeightKgs + axleWeightKgs;
    const totalStaticWeightN = totalStaticWeightKgs * 9.81;
    const offsetDistanceM = (parseFloat(selectedPlate.Size) / 2) / 1000;
    const staticWeightOnPlateN = totalStaticWeightN / 2;
    const totalDownwardForceOnPlate = staticWeightOnPlateN;
    const moment = staticWeightOnPlateN * offsetDistanceM;
    let pulloutForce = 0;
    if (fixingHoleSeparationM > 0) { pulloutForce = moment / fixingHoleSeparationM; }
    const safetyFactor = 1.20;
    const finalDownwardForce = totalDownwardForceOnPlate * safetyFactor;
    const finalPulloutForce = pulloutForce * safetyFactor;
    dom['endplate-downward-force'].textContent = finalDownwardForce.toFixed(0);
    dom['endplate-pullout-force'].textContent = finalPulloutForce.toFixed(0);
    drawEndplateForceDiagram(finalDownwardForce, finalPulloutForce, offsetDistanceM, fixingHoleSeparation, parseFloat(selectedPlate.Size));
}

function calculateSafetyBrakeSelection() {
    const motorMaxTorqueText = dom['max-torque'].textContent;
    const motorMaxTorque = parseFloat(motorMaxTorqueText) || 0;
    
    if (safetyBrakeData.length === 0 || motorMaxTorque === 0) {
        dom['safety-brake-name'].textContent = 'N/A';
        dom['safety-brake-motor-torque'].textContent = 'N/A';
        dom['safety-brake-capacity'].textContent = 'N/A';
        dom['safety-brake-driveshaft'].textContent = 'N/A';
        return;
    }

    // 1. Filter and Sort Brakes
    const suitableBrakes = safetyBrakeData.filter(brake => {
        const opTorqueKey = Object.keys(brake).find(k => k.toLowerCase().includes('operating torque'));
        const opTorque = parseFloat(brake[opTorqueKey]) || 0;
        return opTorque >= motorMaxTorque;
    }).sort((a,b) => {
        const opTorqueKey = Object.keys(a).find(k => k.toLowerCase().includes('operating torque'));
        return (parseFloat(a[opTorqueKey]) || 0) - (parseFloat(b[opTorqueKey]) || 0);
    });

    const select = dom.safetyBrakeSelector;
    
    // Store current user selection if valid
    const currentSelection = select.value;
    
    select.innerHTML = '';
    
    // 2. Populate Dropdown
    if (suitableBrakes.length === 0) {
        const option = document.createElement('option');
        option.textContent = "-- No Suitable Safety Brake Found --";
        select.appendChild(option);
        dom['safety-brake-name'].textContent = 'NO SUITABLE BRAKE FOUND';
        dom['safety-brake-name'].classList.add('warning-text');
    } else {
        suitableBrakes.forEach((brake, idx) => {
            // Find the original index in the main data array
            const originalIndex = safetyBrakeData.indexOf(brake);
            const option = document.createElement('option');
            const opTorqueKey = Object.keys(brake).find(k => k.toLowerCase().includes('operating torque'));
            const opTorque = parseFloat(brake[opTorqueKey]) || 0;
            option.value = originalIndex;
            option.textContent = `${brake.Name} (Op Torque: ${opTorque} Nm)`;
            select.appendChild(option);
        });
        
        // 3. Select the best brake (or keep user selection if valid within filtered list)
        // Note: For calculation automation, we usually default to the first (smallest suitable)
        // unless the user manually changed it. 
        let selectedIndex = select.options[0].value;
        
        // Check if previously selected brake is still in the suitable list
        const optionsArray = Array.from(select.options);
        if (currentSelection !== "" && optionsArray.some(opt => opt.value === currentSelection)) {
             select.value = currentSelection;
             selectedIndex = currentSelection;
        } else {
             select.value = selectedIndex;
        }
        
        const selectedBrake = safetyBrakeData[selectedIndex];
        
        // 4. Update UI Text
        dom['safety-brake-name'].textContent = selectedBrake.Name;
        dom['safety-brake-name'].classList.remove('warning-text');
        dom['safety-brake-motor-torque'].textContent = motorMaxTorque.toFixed(1);
        
        const opTorqueKey = Object.keys(selectedBrake).find(k => k.toLowerCase().includes('operating torque'));
        dom['safety-brake-capacity'].textContent = parseFloat(selectedBrake[opTorqueKey]) || 0;
        
        const dsKey = Object.keys(selectedBrake).find(k => k.toLowerCase().includes('driveshaft diameter mm'));
        dom['safety-brake-driveshaft'].textContent = selectedBrake[dsKey] || 'N/A';
        
        const brakeName = selectedBrake.Name;
        const imageContainer = dom['safety-brake-image-container'];
        const imageDisplay = dom['safetyBrakeImageDisplay'];
        if (safetyBrakeImageMap.has(brakeName)) {
            imageDisplay.src = safetyBrakeImageMap.get(brakeName); imageContainer.style.display = 'block';
        } else { imageContainer.style.display = 'none'; }
    }

    // 5. CRITICAL FIX: Re-draw the Axle Graphic
    // Since the brake shaft size is now known/updated, we must refresh the axle diagram
    // to ensure the Right Hand Shaft (for chain/tubular) matches this new value.
    const currentAxleIndex = dom.axleType.value;
    if (currentAxleIndex !== "" && axleData[currentAxleIndex]) {
        const collarSize = parseFloat(dom.collarSize.value) || 0;
        drawAxleCrossSection(axleData[currentAxleIndex], collarSize);
    }


function calculateMotorRecommendation(totalWeightKgs, lath, axle, travelHeight, curtainWidth) {
    if (!lath || !axle || !travelHeight || travelHeight <= 0 || totalWeightKgs <= 0) {
        ['max-torque', 'total-revolutions', 'max-torque-inputs'].forEach(id => { dom[id].textContent = '0.0'; });
        lastTorqueProfile = []; maxCoilDiameter = 0; drawTorqueGraph(lastTorqueProfile, dom['torque-graph-container']);
        dom.motorSelector.innerHTML = '<option>-- First select a mounting type --</option>';
        dom.motorSelector.disabled = true; updateSelectedMotorInfo(); return;
    }
    
    const collarSize = parseFloat(dom.collarSize.value) || 0;
    const axleCoilDiameter = getEffectiveCoilDiameter(axle);
    const effectiveStartDiameter = Math.max(axleCoilDiameter, collarSize);
    calculatedRotations = calculateTotalRevolutions(travelHeight, effectiveStartDiameter, parseFloat(lath['Thickness']));
    dom['total-revolutions'].textContent = calculatedRotations.toFixed(1);
    
    const { profileData, finalCoilDiameter } = getTorqueProfile(totalWeightKgs, lath, travelHeight, effectiveStartDiameter, curtainWidth);
    maxCoilDiameter = finalCoilDiameter;

    let baselineFriction = parseFloat(dom.friction.value) || 0;
    let additionalFriction = 0;
    
    if (parseFloat(dom.height.value) >= 7000) {
        additionalFriction += 5;
    }

    let isHighPerformance = false;
    const usageFilterValue = dom.motorUsageFilter.value.toLowerCase();
    
    if (usageFilterValue.includes('high') || usageFilterValue.includes('hi ') || usageFilterValue.includes('speed')) {
        isHighPerformance = true;
    }
    
    if (isHighPerformance) {
        additionalFriction += 5;
    }
    
    const totalAppliedFriction = baselineFriction + additionalFriction;
    dom['total-applied-friction'].textContent = totalAppliedFriction;
    const frictionMultiplier = 1 + (totalAppliedFriction / 100);

    lastTorqueProfile = profileData.map(item => ({...item, torque: item.torque * frictionMultiplier}));
    drawTorqueGraph(lastTorqueProfile, dom['torque-graph-container']);
    
    const requiredTorque = lastTorqueProfile.length > 0 ? Math.max(...lastTorqueProfile.map(p => p.torque)) : 0;
    dom['max-torque'].textContent = requiredTorque.toFixed(1);
    dom['max-torque-inputs'].textContent = requiredTorque.toFixed(1);

    const selectedMountType = dom.motorMountingType.value;
    const selectedVoltage = dom.motorVoltageFilter.value;
    const selectedManufacturer = dom.motorManufacturerFilter.value;
    const selectedUsage = dom.motorUsageFilter.value;
    const selectedMO = dom.motorManualOverrideFilter.value;

    let voltageKey = '', manufacturerKey = '', usageKey = '', moKey = '';
    if (motorData.length > 0) {
        voltageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'voltage');
        manufacturerKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manufacturer');
        usageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'usage type');
        moKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manual override');
    }
    currentFilteredMotors = motorData.filter(motor => {
        const mountMatch = !selectedMountType || motor['Mounting type'] === selectedMountType;
        const motorVoltages = String(motor[voltageKey] || '').split('/').map(v => v.trim());
        const voltageMatch = !selectedVoltage || !voltageKey || motorVoltages.includes(selectedVoltage);
        const manufacturerMatch = !selectedManufacturer || !manufacturerKey || motor[manufacturerKey] === selectedManufacturer;
        const usageMatch = !selectedUsage || !usageKey || motor[usageKey] === selectedUsage;
        const moMatch = !selectedMO || !moKey || String(motor[moKey]).trim().toLowerCase() === String(selectedMO).trim().toLowerCase();
        return mountMatch && voltageMatch && manufacturerMatch && usageMatch && moMatch;
    });
    
    const select = dom.motorSelector; 
    const previousValue = select.value;
    
    select.innerHTML = ''; select.disabled = false;
    if (currentFilteredMotors.length === 0) {
        select.innerHTML = '<option value="">-- No motors for this type --</option>';
        updateSelectedMotorInfo(); return;
    }
    
    let recommendedMotorIndexInFilteredList = -1;
    currentFilteredMotors.forEach((motor, index) => {
        const option = document.createElement('option');
        option.value = index;
        const motorTorqueMin = parseFloat(motor['Torque (Nm) min']);
        const motorTorqueMax = parseFloat(motor['Torque (Nm) max']);
        option.textContent = `${motor['Name']} (${motorTorqueMin}-${motorTorqueMax} Nm)`;
        const passesTest = requiredTorque >= motorTorqueMin && requiredTorque <= motorTorqueMax;
        if (passesTest) {
            option.classList.add('option-pass');
            if (recommendedMotorIndexInFilteredList === -1) { recommendedMotorIndexInFilteredList = index; }
        } else {
            option.classList.add('option-fail'); 
        }
        select.appendChild(option);
    });

    if (previousValue !== "" && currentFilteredMotors[previousValue]) {
        select.value = previousValue;
    } else if (recommendedMotorIndexInFilteredList !== -1) { 
        select.value = recommendedMotorIndexInFilteredList; 
    } else {
        const noMotorOption = document.createElement('option');
        noMotorOption.value = ""; noMotorOption.textContent = "-- No suitable motor found --";
        noMotorOption.selected = true; noMotorOption.disabled = true;
        select.prepend(noMotorOption);
    }
    updateSelectedMotorInfo();
}

function updateSelectedSafetyBrakeInfo() {
    calculateSafetyBrakeSelection();
    updateSelectedMotorInfo();
}

function updateSelectedMotorInfo() {
    const selectedMotorIndex = dom.motorSelector.value;
    const resetChainInfo = () => {
            dom.motorTeeth.value = "";
            dom.barrelTeeth.value = "";
            dom.sprocketDiameter.value = "";
            dom.plateWheelDiameter.value = "";
            dom.chainSizeDisplay.value = "";
            dom.chainSizeDisplay.dataset.breakingStrain = 0;
    };

    if (selectedMotorIndex === "" || !currentFilteredMotors[selectedMotorIndex]) {
            ['motor-name','motor-torque','motor-rpm','motor-driveshaft-dia','motor-cycles-per-hour','opening-time', 'power-consumed', 'motor-name-inputs', 'motor-torque-inputs'].forEach(id => { dom[id].textContent = 'N/A'; });
            dom['motor-torque-line'].classList.remove('warning-text'); dom['motor-torque-line-inputs'].classList.remove('warning-text'); 
            dom['motor-image-container'].style.display = 'none';
            dom.motorImageDisplay.src = '';
            dom['motor-limit-turns'].textContent = 'N/A';
            dom['motor-limit-warning'].style.display = 'none';
            resetChainInfo();
            updateChainCalculations();
            return;
    }

    const selectedMotor = currentFilteredMotors[selectedMotorIndex];
    const motorTorqueMin = parseFloat(selectedMotor['Torque (Nm) min']);
    const motorTorqueMax = parseFloat(selectedMotor['Torque (Nm) max']);
    const motorRPM = parseFloat(selectedMotor['RPM']);
    const motorWattage = parseFloat(selectedMotor['Wattage']);
    
    const dsKey = Object.keys(selectedMotor).find(k => k.toLowerCase().trim() === 'driveshaft diameter mm');
    const cyclesKey = Object.keys(selectedMotor).find(k => k.toLowerCase().trim() === 'cycles per hour');

    dom['motor-name'].textContent = selectedMotor['Name'];
    dom['motor-torque'].textContent = `${motorTorqueMin} - ${motorTorqueMax}`; 
    dom['motor-rpm'].textContent = (motorRPM || 0).toFixed(2);
    
    let displayShaft = dsKey ? selectedMotor[dsKey] : 'N/A';
    const selectedBrakeIndex = dom.safetyBrakeSelector.value;
    
    if (selectedBrakeIndex !== "" && safetyBrakeData[selectedBrakeIndex]) {
        const selectedBrake = safetyBrakeData[selectedBrakeIndex];
        const brakeShaftKey = Object.keys(selectedBrake).find(k => k.toLowerCase().includes('driveshaft diameter'));
        
        if (brakeShaftKey) {
            const brakeShaft = String(selectedBrake[brakeShaftKey]).trim();
            const motorOptions = String(displayShaft).split('/').map(s => s.trim());
            
            if (motorOptions.includes(brakeShaft)) {
                displayShaft = `${brakeShaft} mm (Matched to Brake)`;
            }
        }
    }
    dom['motor-driveshaft-dia'].textContent = displayShaft;

    dom['motor-name-inputs'].textContent = selectedMotor['Name'];
    dom['motor-torque-inputs'].textContent = `${motorTorqueMin} - ${motorTorqueMax}`;
    
    const motorName = selectedMotor['Name'];
    const motorImgContainer = dom['motor-image-container'];
    const motorImgDisplay = dom['motorImageDisplay'];

    if (motorImageMap.has(motorName)) {
        motorImgDisplay.src = motorImageMap.get(motorName);
        motorImgContainer.style.display = 'block';
    } else {
        motorImgDisplay.src = '';
        motorImgContainer.style.display = 'none';
    }

    let openingTimeSec = 0;
    if (motorRPM > 0 && calculatedRotations > 0) {
        openingTimeSec = (calculatedRotations / motorRPM) * 60;
        const usageType = (selectedMotor['Usage type'] || '').toLowerCase();
        if (usageType.includes('high') || usageType.includes('hi ') || usageType.includes('speed')) {
            openingTimeSec += 2;
        }
        dom['opening-time'].textContent = openingTimeSec.toFixed(1);
    } else { dom['opening-time'].textContent = '0'; }
    
    if (motorWattage > 0 && openingTimeSec > 0) {
        const cycleTimeSec = openingTimeSec * 2;
        const wattHours = (motorWattage * cycleTimeSec) / 3600;
        const kiloWattHours = wattHours / 1000;
        dom['power-consumed'].textContent = `${kiloWattHours.toFixed(4)} kWh`;
    } else { dom['power-consumed'].textContent = 'N/A'; }
    
    const requiredTorque = parseFloat(dom['max-torque'].textContent);
    if (requiredTorque < motorTorqueMin || requiredTorque > motorTorqueMax) {
        dom['motor-torque-line'].classList.add('warning-text'); dom['motor-torque-line-inputs'].classList.add('warning-text');
    } else {
        dom['motor-torque-line'].classList.remove('warning-text'); dom['motor-torque-line-inputs'].classList.remove('warning-text');
    }
    
    const limitTurnKey = Object.keys(selectedMotor).find(k => k.toLowerCase().trim() === 'limit turn');
    const limitTurnVal = limitTurnKey ? parseFloat(selectedMotor[limitTurnKey]) : 0;
    const limitTurnEl = dom['motor-limit-turns'];
    const limitWarnEl = dom['motor-limit-warning'];

    if (limitTurnVal > 0) {
        const neededTurns = calculatedRotations;
        const percentUsed = (neededTurns / limitTurnVal) * 100;
        limitTurnEl.textContent = `${limitTurnVal.toFixed(2)} (${percentUsed.toFixed(0)}% used)`;
        
        if (neededTurns > limitTurnVal) {
            limitWarnEl.style.display = 'block';
            limitTurnEl.classList.add('warning-text');
        } else {
            limitWarnEl.style.display = 'none';
            limitTurnEl.classList.remove('warning-text');
        }
    } else {
        limitTurnEl.textContent = 'N/A';
        limitWarnEl.style.display = 'none';
        limitTurnEl.classList.remove('warning-text');
    }

    const standardCPH = cyclesKey ? parseFloat(selectedMotor[cyclesKey]) : 0;
    let cphDisplayText = standardCPH > 0 ? standardCPH.toString() : 'N/A';

    if (standardCPH > 0 && limitTurnVal > 0 && calculatedRotations > 0) {
        const adjustedCPH = standardCPH * (limitTurnVal / calculatedRotations);
        if (adjustedCPH !== standardCPH && isFinite(adjustedCPH)) {
            cphDisplayText = `${standardCPH} (Calc: ${adjustedCPH.toFixed(1)})`;
        }
    }
    dom['motor-cycles-per-hour'].textContent = cphDisplayText;

    if (selectedMotor['Mounting type'] === 'Chain drive' && chainDriveData.length > 0) {
        let motorNameClean = selectedMotor['Name'];
        motorNameClean = motorNameClean.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();

        const chainSpecs = chainDriveData.find(row => {
            const rowDesc = row['Motor Description'];
            if (!rowDesc) return false;
            const descClean = rowDesc.toString().trim().toLowerCase();
            return descClean.includes(motorNameClean) || motorNameClean.includes(descClean);
        });

        if (chainSpecs) {
            dom.motorTeeth.value = chainSpecs['Sprocket teeth'] || "";
            dom.barrelTeeth.value = chainSpecs['Plate wheel'] || ""; 
            dom.sprocketDiameter.value = chainSpecs['Sprocket diameter'] || "";
            dom.plateWheelDiameter.value = chainSpecs['Platewheel Diameter'] || "";
            const chainSizeKey = Object.keys(chainSpecs).find(k => k.toLowerCase().includes('chain size'));
            dom.chainSizeDisplay.value = chainSizeKey ? chainSpecs[chainSizeKey] : "Unknown";
            dom.chainSizeDisplay.dataset.breakingStrain = parseFloat(chainSpecs['Chain Breaking Strain in newtons']) || 0;
        } else {
            resetChainInfo();
            dom.chainSizeDisplay.value = "Specs not found in data";
        }
    } else {
        resetChainInfo();
    }
    updateChainCalculations();
}

function updateSelectedWicketInfo() {
    const selectedIndex = dom.wicketDoorSelector.value;
    if (selectedIndex !== "" && wicketData[selectedIndex]) {
        const selectedDoor = wicketData[selectedIndex];
        dom['wicket-door-name'].textContent = selectedDoor.Name || 'N/A';
        dom['wicket-door-height'].textContent = selectedDoor.Height || '0';
        dom['wicket-door-width'].textContent = selectedDoor.Width || '0';
    } else {
        dom['wicket-door-name'].textContent = 'N/A'; dom['wicket-door-height'].textContent = '0'; dom['wicket-door-width'].textContent = '0';
    }
    const curtainWidth = parseFloat(dom['calculated-curtain-width'].textContent) || 0;
    updateWicketCalculationsAndGraphic({cast:0, wind:0}, curtainWidth);
}

function updateWicketCalculationsAndGraphic(endlockOffsets = {cast: 0, wind: 0}, curtainWidth) {
    const selectedWicketIndex = dom.wicketDoorSelector.value;
    const selectedLathIndex = dom.lathType.value;
    const selectedBottomLathIndex = dom.bottomLathType.value;
    const selectedWicket = (wicketData && selectedWicketIndex !== "") ? wicketData[selectedWicketIndex] : null;
    const selectedLath = (lathData && selectedLathIndex !== "") ? lathData[selectedLathIndex] : null;
    const selectedBottomLath = (bottomLathData && selectedBottomLathIndex !== "") ? bottomLathData[selectedBottomLathIndex] : null;
    const selectedAxle = (axleData && dom.axleType.value !== "") ? axleData[dom.axleType.value] : null;
    let lathsAtWicket = 0, wicketLathHeight = 0;
    if (selectedWicket && selectedLath && selectedBottomLath) {
        const wicketHeight = parseFloat(selectedWicket.Height) || 0;
        const bottomLathHeight = parseFloat(selectedBottomLath['BLath height']) || 0;
        const lathCompressedHeight = parseFloat(selectedLath['Compressed lath height']) || 0;
        if (lathCompressedHeight > 0 && wicketHeight > 0) {
            const wicketGap = 10; 
            const heightCoveredByWicketZone = wicketHeight + wicketGap;
            const lathsInZone = Math.ceil(heightCoveredByWicketZone / lathCompressedHeight);
            lathsAtWicket = lathsInZone;
            wicketLathHeight = bottomLathHeight + (lathsInZone * lathCompressedHeight);
        }
    }
    dom['laths-at-wicket'].textContent = lathsAtWicket;
    dom['wicket-lath-height'].textContent = wicketLathHeight.toFixed(0);
    const selectedEndplateIndex = dom.endplateSelector.value;
    const selectedEndplate = (selectedEndplateIndex !== "" && currentFilteredEndplates[selectedEndplateIndex]) ? currentFilteredEndplates[selectedEndplateIndex] : null;
    drawWicketGraphic(curtainWidth, parseFloat(dom.additionalLength.value), parseInt(dom['lath-count'].textContent), selectedLath, selectedBottomLath, selectedAxle, selectedEndplate, selectedWicket, wicketLathHeight, endlockOffsets);
    calculateWicketTorque(curtainWidth);
}

function calculateWicketTorque(curtainWidth) {
    const selectedLath = lathData.length > 0 ? lathData[dom.lathType.value] : null;
    const selectedAxle = axleData.length > 0 ? axleData[dom.axleType.value] : null;
    const selectedWicket = wicketData.length > 0 ? wicketData[dom.wicketDoorSelector.value] : null;
    const totalWeightKgs = parseFloat(dom['torque-weight-kg'].textContent) || 0;
    if (!selectedLath || !selectedAxle || !selectedWicket || totalWeightKgs <= 0) {
        dom['wicket-max-torque'].textContent = '0.0'; drawTorqueGraph([], dom['wicket-torque-graph-container']); return;
    }
    const floorToAxleCenter = parseFloat(dom.height.value) || 0;
    const bottomLathHeight = bottomLathData.length > 0 ? (parseFloat(bottomLathData[dom.bottomLathType.value]['BLath height']) || 0) : 0;
    const travelHeight = floorToAxleCenter - bottomLathHeight;
    const collarSize = parseFloat(dom.collarSize.value) || 0;
    const axleCoilDiameter = getEffectiveCoilDiameter(selectedAxle);
    const effectiveStartDiameter = Math.max(axleCoilDiameter, collarSize);
    const { profileData } = getTorqueProfileWithWicket(totalWeightKgs, selectedLath, travelHeight, selectedWicket, effectiveStartDiameter, curtainWidth);
    
    const frictionText = dom['total-applied-friction'].textContent;
    const frictionMultiplier = 1 + (parseFloat(frictionText) || 0) / 100;
    
    const adjustedProfile = profileData.map(item => ({...item, torque: item.torque * frictionMultiplier}));
    const requiredTorque = adjustedProfile.length > 0 ? Math.max(...adjustedProfile.map(p => p.torque)) : 0;
    dom['wicket-max-torque'].textContent = requiredTorque.toFixed(1);
    drawTorqueGraph(adjustedProfile, dom['wicket-torque-graph-container']);
}

function getTorqueProfileWithWicket(totalWeightKgs, lath, travelHeight, wicket, effectiveStartDiameter, curtainWidth) {
    const profileData = []; 
    let heightLifted = 0; 
    let currentRollDiameter = effectiveStartDiameter;
    const lathThickness = parseFloat(lath['Thickness']);
    if (travelHeight <= 0 || totalWeightKgs <= 0) return { profileData: [], finalCoilDiameter: currentRollDiameter };
    const selectedBottomLath = bottomLathData[dom.bottomLathType.value];
    const widthM = (curtainWidth || 0) / 1000;
    const bottomLathHeight = parseFloat(selectedBottomLath['BLath height']) || 0;
    const bottomLathWeight = widthM * (parseFloat(selectedBottomLath['BLath weight / m length']) || 0);
    const lathsWeight = totalWeightKgs - bottomLathWeight;
    const wicketWidthM = (parseFloat(wicket.Width) || 0) / 1000;
    const wicketHeightM = (parseFloat(wicket.Height) || 0) / 1000;
    let lathKgsPerM2 = parseFloat(lath['Kgs/ m2']) || 0;
    if (dom.powderCoated.checked) lathKgsPerM2 += 0.5;
    const wicketWeightReduction = wicketWidthM * wicketHeightM * lathKgsPerM2;
    const wicketStartHeightFromBottomM = (bottomLathHeight / 1000) + (10 / 1000);
    const wicketEndHeightFromBottomM = wicketStartHeightFromBottomM + wicketHeightM;

    while (heightLifted < travelHeight) {
        const percentLifted = heightLifted / travelHeight;
        const remainingLathWeight = lathsWeight * (1 - percentLifted);
        let remainingTotalWeight = remainingLathWeight + bottomLathWeight;
        const curtainHangingHeightM = (travelHeight - heightLifted) / 1000;
        let reduction = 0;
        if (curtainHangingHeightM >= wicketEndHeightFromBottomM) {
            reduction = wicketWeightReduction;
        } else if (curtainHangingHeightM > wicketStartHeightFromBottomM) {
            const hangingPortionHeight = curtainHangingHeightM - wicketStartHeightFromBottomM;
            reduction = wicketWeightReduction * (hangingPortionHeight / wicketHeightM);
        }
        remainingTotalWeight -= reduction;
        remainingTotalWeight = Math.max(0, remainingTotalWeight);
        const force = remainingTotalWeight * 9.81; 
        const radiusM = ((currentRollDiameter + lathThickness) / 2) / 1000;
        profileData.push({ torque: force * radiusM, diameter: currentRollDiameter, heightLifted: heightLifted });
        const circumference = Math.PI * currentRollDiameter; 
        heightLifted += circumference / 2; 
        currentRollDiameter += lathThickness;
    } 
    return { profileData, finalCoilDiameter: currentRollDiameter };
};

function calculateTotalRevolutions(travelHeight, initialDiameter, lathThickness) {
    if (travelHeight <= 0 || initialDiameter <= 0 || lathThickness <= 0) return 0;
    const a = Math.PI * lathThickness;
    const b = Math.PI * initialDiameter;
    const c = -travelHeight;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    return (-b + Math.sqrt(discriminant)) / (2 * a);
}

function getTorqueProfile(totalWeightKgs, lath, travelHeight, effectiveStartDiameter, curtainWidth) {
    const profileData = []; 
    let heightLifted = 0; 
    let currentRollDiameter = effectiveStartDiameter;
    const lathThickness = parseFloat(lath['Thickness']);
    if (travelHeight <= 0 || totalWeightKgs <= 0) return { profileData: [], finalCoilDiameter: currentRollDiameter };
    const selectedBottomLath = bottomLathData[dom.bottomLathType.value];
    const widthM = (curtainWidth || 0) / 1000;
    const bottomLathHeight = parseFloat(selectedBottomLath['BLath height']) || 0;
    const bottomLathWeight = widthM * (parseFloat(selectedBottomLath['BLath weight / m length']) || 0);
    const lathsWeight = totalWeightKgs - bottomLathWeight;
    while (heightLifted < travelHeight) {
        const percentLifted = heightLifted / travelHeight;
        const remainingLathWeight = lathsWeight * (1 - percentLifted);
        const remainingTotalWeight = remainingLathWeight + bottomLathWeight;
        const force = remainingTotalWeight * 9.81; 
        const radiusM = ((currentRollDiameter + lathThickness) / 2) / 1000;
        profileData.push({ torque: force * radiusM, diameter: currentRollDiameter, heightLifted: heightLifted });
        const circumference = Math.PI * currentRollDiameter; 
        heightLifted += circumference / 2; 
        currentRollDiameter += lathThickness;
    } 
    return { profileData, finalCoilDiameter: currentRollDiameter };
};

function populateDropdown(selectElement, dataArray, nameField) {
    selectElement.innerHTML = `<option value="">-- Select an option --</option>`;
    dataArray.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        const header = Object.keys(item).find(k => k.toLowerCase().trim() === nameField.toLowerCase().trim());
        option.textContent = item[header];
        selectElement.appendChild(option);
    });
};

function calculateCurtainProperties(lath, bottomLath, axle, curtainWidth) {
    const visionEnabled = dom.addVision.checked;
    if (visionEnabled) { return calculateVisionCurtainProperties(lath, bottomLath, axle, curtainWidth); }
    const floorToAxleCenter = parseFloat(dom.height.value) || 0;
    if (!lath || !bottomLath || floorToAxleCenter <= 0) {
        dom['lath-count'].textContent = '0'; dom['laths-to-lift'].textContent = '0';
        dom['weight-kg'].textContent = '0.00'; dom['torque-weight-kg'].textContent = '0.00';
        dom['curtain-height-extended'].textContent = '0'; dom['curtain-height-compressed'].textContent = '0';
        dom['curtain-area'].textContent = '0.00'; dom['lifted-curtain-area'].textContent = '0.00';
        dom['vision-percentage-para'].style.display = 'none'; dom['vision-area-m2-para'].style.display = 'none';
        dom['endlock-weight'].textContent = '0.00';
        return { totalWeight: 0, torqueWeight: 0, travelHeight: 0, fullCurtainLength: 0, visionData: null, endlockOffsets: { cast: 0, wind: 0 } };
    }
    const lathCompressedHeight = parseFloat(lath['Compressed lath height']);
    const uncompressedLathHeight = parseFloat(lath['uncompressed lath height']);
    const bottomLathHeight = parseFloat(bottomLath['BLath height']) || 0;
    let axleRadius = 0;
    if (axle) {
            const axleCoilDiameter = getEffectiveCoilDiameter(axle); axleRadius = axleCoilDiameter / 2;
    } else if (axleData.length > 0) { axleRadius = (getEffectiveCoilDiameter(axleData[0])) / 2; }
    const heightToCoverByLaths = (floorToAxleCenter - bottomLathHeight) + axleRadius;
    let numLaths = 0;
    if (lathCompressedHeight > 0 && heightToCoverByLaths > 0) { numLaths = Math.ceil(heightToCoverByLaths / lathCompressedHeight) + 2; }
    dom['lath-count'].textContent = numLaths;
    const numLathsToLift = numLaths >= 3 ? numLaths - 3 : 0;
    dom['laths-to-lift'].textContent = numLathsToLift;
    const compressedCurtainHeight = (numLaths * lathCompressedHeight) + bottomLathHeight;
    const fullCurtainLength = (numLaths * uncompressedLathHeight) + bottomLathHeight;
    dom['curtain-height-extended'].textContent = fullCurtainLength.toFixed(0);
    dom['curtain-height-compressed'].textContent = compressedCurtainHeight.toFixed(0);
    const widthM = (curtainWidth || 0) / 1000;
    let kgsPerM2 = parseFloat(lath['Kgs/ m2']) || 0;
    if (dom.powderCoated.checked) { kgsPerM2 += 0.5; }
    const totalMaterialAreaM2 = widthM * (fullCurtainLength / 1000);
    dom['curtain-area'].textContent = totalMaterialAreaM2.toFixed(2);
    const liftedLathCoverageLength = (numLathsToLift * lathCompressedHeight);
    const liftedCoverageAreaM2 = widthM * (liftedLathCoverageLength / 1000);
    dom['lifted-curtain-area'].textContent = liftedCoverageAreaM2.toFixed(2);
    const lathWeightBasedOnCoverage = widthM * (numLaths * lathCompressedHeight / 1000) * kgsPerM2;
    const bottomLathWeight = widthM * (parseFloat(bottomLath['BLath weight / m length']) || 0);
    let totalEndlockWeight = 0;
    const lathName = (lath['Name'] || '').toLowerCase();
    const isWindLath = lathName.includes('wind');
    let endlockOffsets = { cast: 0, wind: 0 };
    if (numLaths > 0 && endlockData.length > 0) {
        const selectedCastEndlockIndex = dom.endlockType.value;
        let castEndlockWeightG = 0;
        if (selectedCastEndlockIndex !== "" && endlockData[selectedCastEndlockIndex]) {
            const selectedEndlock = endlockData[selectedCastEndlockIndex];
            const weightKey = Object.keys(selectedEndlock).find(k => k.toLowerCase().trim() === 'weight in grams');
            castEndlockWeightG = weightKey ? parseFloat(selectedEndlock[weightKey]) : 0;
            const offsetKey = Object.keys(selectedEndlock).find(k => k.toLowerCase().trim() === 'end lock offset');
            endlockOffsets.cast = offsetKey ? parseFloat(selectedEndlock[offsetKey]) : 0;
        }
        if (isWindLath) {
            let windEndlockWeightG = 0;
            const windEndlock = endlockData.find(el => (el['Description'] || '').toLowerCase().includes('75mm wind'));
            if (windEndlock) {
                const weightKey = Object.keys(windEndlock).find(k => k.toLowerCase().trim() === 'weight in grams');
                windEndlockWeightG = weightKey ? parseFloat(windEndlock[weightKey]) : 0;
                const offsetKey = Object.keys(windEndlock).find(k => k.toLowerCase().trim() === 'end lock offset');
                endlockOffsets.wind = offsetKey ? parseFloat(windEndlock[offsetKey]) : 0;
            }
            for (let i = 1; i <= numLaths; i++) {
                if (i % 2 !== 0 && castEndlockWeightG > 0) { totalEndlockWeight += 2 * (castEndlockWeightG / 1000); }
                const isWindLathPosition = (i === 2 || i === 4 || i === 6 || i === 8) || (i > 8 && i % 8 === 0);
                if (isWindLathPosition && windEndlockWeightG > 0) { totalEndlockWeight += 2 * (windEndlockWeightG / 1000); }
            }
        } else {
            if (castEndlockWeightG > 0) {
                    const numEndlockPairs = Math.ceil(numLaths / 2); totalEndlockWeight = numEndlockPairs * 2 * (castEndlockWeightG / 1000);
            }
        }
    }
    dom['endlock-weight'].textContent = totalEndlockWeight.toFixed(2);
    const totalWeight = lathWeightBasedOnCoverage + bottomLathWeight + totalEndlockWeight;
    dom['weight-kg'].textContent = totalWeight.toFixed(2);
    
    let torqueWeight;
    const customTorqueWeightValue = parseFloat(dom.customTorqueWeight.value);
    if (dom.useCustomLath.checked && !isNaN(customTorqueWeightValue) && customTorqueWeightValue > 0) {
        torqueWeight = customTorqueWeightValue;
    } else {
        torqueWeight = totalWeight;
        if (numLaths >= 3) {
            const bufferLathWeight = 3 * (lathCompressedHeight / 1000) * widthM * kgsPerM2;
            let bufferEndlockWeight = 0;
            const selectedCastEndlockIndex = dom.endlockType.value;
            if (selectedCastEndlockIndex !== "" && endlockData[selectedCastEndlockIndex]) {
                const weightKey = Object.keys(endlockData[selectedCastEndlockIndex]).find(k => k.toLowerCase().trim() === 'weight in grams');
                const castEndlockWeightG = weightKey ? parseFloat(endlockData[selectedCastEndlockIndex][weightKey]) : 0;
                if (castEndlockWeightG > 0) { bufferEndlockWeight = 4 * (castEndlockWeightG / 1000); }
            }
            torqueWeight = totalWeight - bufferLathWeight - bufferEndlockWeight;
        }
    }
    dom['torque-weight-kg'].textContent = torqueWeight.toFixed(2);
    const travelHeight = floorToAxleCenter - bottomLathHeight;
    const mainLathVisionKey = Object.keys(lath).find(k => k.toLowerCase().trim() === 'vision percentage');
    const mainLathVisionPercent = mainLathVisionKey ? (parseFloat(lath[mainLathVisionKey]) || 0) : 0;

    if (mainLathVisionPercent > 0) {
        const visionArea = totalMaterialAreaM2 * (mainLathVisionPercent / 100);
        dom['vision-area-m2'].textContent = visionArea.toFixed(2);
        dom['vision-percentage'].textContent = mainLathVisionPercent.toFixed(2);
        dom['vision-percentage-para'].style.display = 'block'; dom['vision-area-m2-para'].style.display = 'block';
    } else {
        dom['vision-percentage-para'].style.display = 'none'; dom['vision-area-m2-para'].style.display = 'none';
    }
    return { totalWeight, torqueWeight, travelHeight, fullCurtainLength, visionData: null, endlockOffsets };
};

function calculateVisionCurtainProperties(mainLath, bottomLath, axle, curtainWidth) {
    const visionLath = lathData[dom.visionLathType.value];
    const widthM = (curtainWidth || 0) / 1000;
    const floorToAxleCenter = parseFloat(dom.height.value) || 0;
    const desiredVisionStart = parseFloat(dom.visionStartHeight.value) || 0;
    const desiredVisionPanelHeight = parseFloat(dom.visionPanelHeight.value) || 0;
    let endlockOffsets = { cast: 0, wind: 0 };
    const resetAndReturn = () => {
        dom['lath-count'].textContent = '0'; dom['laths-to-lift'].textContent = '0';
        dom['weight-kg'].textContent = '0.00'; dom['torque-weight-kg'].textContent = '0.00';
        dom['curtain-height-extended'].textContent = '0'; dom['curtain-height-compressed'].textContent = '0';
        dom['curtain-area'].textContent = '0.00'; dom['lifted-curtain-area'].textContent = '0.00';
        dom['vision-percentage-para'].style.display = 'none'; dom['vision-area-m2-para'].style.display = 'none';
        dom['endlock-weight'].textContent = '0.00';
        return { totalWeight: 0, torqueWeight: 0, travelHeight: 0, fullCurtainLength: 0, visionData: null, endlockOffsets };
    };

    if (!mainLath || !bottomLath || !visionLath || !axle || floorToAxleCenter <= 0 || widthM <= 0) { return resetAndReturn(); }
    const mainLathCompressed = parseFloat(mainLath['Compressed lath height']);
    const mainLathUncompressed = parseFloat(mainLath['uncompressed lath height']) || mainLathCompressed;
    let mainLathKgsM2 = parseFloat(mainLath['Kgs/ m2']);
    if (dom.powderCoated.checked) { mainLathKgsM2 += 0.5; }
    const visionLathCompressed = parseFloat(visionLath['Compressed lath height']);
    const visionLathUncompressed = parseFloat(visionLath['uncompressed lath height']) || visionLathCompressed;
    let visionLathKgsM2 = parseFloat(visionLath['Kgs/ m2']);
    if (dom.powderCoated.checked) { visionLathKgsM2 += 0.5; }

    if (isNaN(mainLathCompressed) || isNaN(visionLathCompressed) || mainLathCompressed <= 0 || visionLathCompressed <= 0) { return resetAndReturn(); }

    const bottomLathHeight = parseFloat(bottomLath['BLath height']) || 0;
    const bottomLathWeightPerM = parseFloat(bottomLath['BLath weight / m length']) || 0;
    const axleRadius = getEffectiveCoilDiameter(axle) / 2;
    
    let numLathsBelow = 0;
    if (desiredVisionStart > bottomLathHeight) { numLathsBelow = Math.round((desiredVisionStart - bottomLathHeight) / mainLathCompressed); }
    let numLathsVision = 0;
    if (desiredVisionPanelHeight > 0) { numLathsVision = Math.round(desiredVisionPanelHeight / visionLathCompressed); }
    const heightCoveredSoFar_compressed = bottomLathHeight + (numLathsBelow * mainLathCompressed) + (numLathsVision * visionLathCompressed);
    const remainingHeightToCover = (floorToAxleCenter + axleRadius) - heightCoveredSoFar_compressed;
    let numLathsAbove = 0;
    if (remainingHeightToCover > 0) { numLathsAbove = Math.ceil(remainingHeightToCover / mainLathCompressed) + 2; }

    const totalNumLaths = numLathsBelow + numLathsVision + numLathsAbove;
    dom['lath-count'].textContent = totalNumLaths;
    const numLathsToLift = totalNumLaths >= 3 ? totalNumLaths - 3 : 0;
    dom['laths-to-lift'].textContent = numLathsToLift;
    const weightBelow = numLathsBelow * (mainLathCompressed / 1000) * widthM * mainLathKgsM2;
    const weightVision = numLathsVision * (visionLathCompressed / 1000) * widthM * visionLathKgsM2;
    const weightAbove = numLathsAbove * (mainLathCompressed / 1000) * widthM * mainLathKgsM2;
    const bottomLathWeight = widthM * bottomLathWeightPerM;
    let totalEndlockWeight = 0;
    const lathName = (mainLath['Name'] || '').toLowerCase();
    const isWindLath = lathName.includes('wind');

    if (totalNumLaths > 0 && endlockData.length > 0) {
        const selectedCastEndlockIndex = dom.endlockType.value;
        let castEndlockWeightG = 0;
        if (selectedCastEndlockIndex !== "" && endlockData[selectedCastEndlockIndex]) {
            const selectedEndlock = endlockData[selectedCastEndlockIndex];
            const weightKey = Object.keys(selectedEndlock).find(k => k.toLowerCase().trim() === 'weight in grams');
            castEndlockWeightG = weightKey ? parseFloat(selectedEndlock[weightKey]) : 0;
            const offsetKey = Object.keys(selectedEndlock).find(k => k.toLowerCase().trim() === 'end lock offset');
            endlockOffsets.cast = offsetKey ? parseFloat(selectedEndlock[offsetKey]) : 0;
        }
        if (isWindLath) {
            let windEndlockWeightG = 0;
            const windEndlock = endlockData.find(el => (el['Description'] || '').toLowerCase().includes('75mm wind'));
            if (windEndlock) {
                const weightKey = Object.keys(windEndlock).find(k => k.toLowerCase().trim() === 'weight in grams');
                windEndlockWeightG = weightKey ? parseFloat(windEndlock[weightKey]) : 0;
                const offsetKey = Object.keys(windEndlock).find(k => k.toLowerCase().trim() === 'end lock offset');
                endlockOffsets.wind = offsetKey ? parseFloat(windEndlock[offsetKey]) : 0;
            }
            for (let i = 1; i <= totalNumLaths; i++) {
                if (i % 2 !== 0 && castEndlockWeightG > 0) { totalEndlockWeight += 2 * (castEndlockWeightG / 1000); }
                const isWindLathPosition = (i === 2 || i === 4 || i === 6 || i === 8) || (i > 8 && i % 8 === 0);
                if (isWindLathPosition && windEndlockWeightG > 0) { totalEndlockWeight += 2 * (windEndlockWeightG / 1000); }
            }
        } else {
            if (castEndlockWeightG > 0) { const numEndlockPairs = Math.ceil(totalNumLaths / 2); totalEndlockWeight = numEndlockPairs * 2 * (castEndlockWeightG / 1000); }
        }
    }
    dom['endlock-weight'].textContent = totalEndlockWeight.toFixed(2);
    const totalWeight = weightBelow + weightVision + weightAbove + bottomLathWeight + totalEndlockWeight;
    dom['weight-kg'].textContent = totalWeight.toFixed(2);

    let torqueWeight;
    const customTorqueWeightValue = parseFloat(dom.customTorqueWeight.value);
    if (dom.useCustomLath.checked && !isNaN(customTorqueWeightValue) && customTorqueWeightValue > 0) {
        torqueWeight = customTorqueWeightValue;
    } else {
        torqueWeight = totalWeight;
        if (numLathsAbove >= 3) {
            const bufferLathWeight = 3 * (mainLathCompressed / 1000) * widthM * mainLathKgsM2;
            let bufferEndlockWeight = 0;
            const selectedCastEndlockIndex = dom.endlockType.value;
                if (selectedCastEndlockIndex !== "" && endlockData[selectedCastEndlockIndex]) {
                const weightKey = Object.keys(endlockData[selectedCastEndlockIndex]).find(k => k.toLowerCase().trim() === 'weight in grams');
                const castEndlockWeightG = weightKey ? parseFloat(endlockData[selectedCastEndlockIndex][weightKey]) : 0;
                if (castEndlockWeightG > 0) { bufferEndlockWeight = 4 * (castEndlockWeightG / 1000); }
            }
            torqueWeight = totalWeight - bufferLathWeight - bufferEndlockWeight;
        }
    }
    dom['torque-weight-kg'].textContent = torqueWeight.toFixed(2);
    const compressedCurtainHeight = bottomLathHeight + (numLathsBelow * mainLathCompressed) + (numLathsVision * visionLathCompressed) + (numLathsAbove * mainLathCompressed);
    const fullCurtainLength = bottomLathHeight + (numLathsBelow * mainLathUncompressed) + (numLathsVision * visionLathUncompressed) + (numLathsAbove * mainLathUncompressed);
    const areaBelowMaterial = numLathsBelow * (mainLathUncompressed / 1000) * widthM;
    const areaVisionMaterial = numLathsVision * (visionLathUncompressed / 1000) * widthM;
    const areaAboveMaterial = numLathsAbove * (mainLathUncompressed / 1000) * widthM;
    const totalMaterialArea = areaBelowMaterial + areaVisionMaterial + areaAboveMaterial;
    dom['curtain-area'].textContent = totalMaterialArea.toFixed(2);
    const areaBelowCoverage = numLathsBelow * (mainLathCompressed / 1000) * widthM;
    const areaVisionCoverage = numLathsVision * (visionLathCompressed / 1000) * widthM;
    const numLiftedLathsAbove = Math.max(0, numLathsAbove - 3);
    const liftedAreaAboveCoverage = numLiftedLathsAbove * (mainLathCompressed / 1000) * widthM;
    const liftedCoverageArea = areaBelowCoverage + areaVisionCoverage + liftedAreaAboveCoverage;
    dom['lifted-curtain-area'].textContent = liftedCoverageArea.toFixed(2);
    dom['curtain-height-extended'].textContent = fullCurtainLength.toFixed(0);
    dom['curtain-height-compressed'].textContent = compressedCurtainHeight.toFixed(0);
    const travelHeight = floorToAxleCenter - bottomLathHeight;
    const actualVisionStartHeight = bottomLathHeight + (numLathsBelow * mainLathCompressed);
    const actualVisionPanelHeight = numLathsVision * visionLathCompressed;
    const mainLathVisionKey = Object.keys(mainLath).find(k => k.toLowerCase().trim() === 'vision percentage');
    const mainLathVisionPercent = mainLathVisionKey ? (parseFloat(mainLath[mainLathVisionKey]) || 0) : 0;
    const visionLathVisionKey = Object.keys(visionLath).find(k => k.toLowerCase().trim() === 'vision percentage');
    const visionLathVisionPercent = visionLathVisionKey ? (parseFloat(visionLath[visionLathVisionKey]) || 0) : 0;
    const visionAreaFromMain = (areaBelowMaterial + areaAboveMaterial) * (mainLathVisionPercent / 100);
    const visionAreaFromVisionPanel = areaVisionMaterial * (visionLathVisionPercent / 100);
    const totalActualVisionArea = visionAreaFromMain + visionAreaFromVisionPanel;
    const overallVisionPercentage = (totalMaterialArea > 0) ? (totalActualVisionArea / totalMaterialArea) * 100 : 0;
    dom['vision-area-m2'].textContent = totalActualVisionArea.toFixed(2);
    dom['vision-percentage'].textContent = overallVisionPercentage.toFixed(2);
    dom['vision-percentage-para'].style.display = 'block'; dom['vision-area-m2-para'].style.display = 'block';
    const visionData = { visionLath, numLathsBelow, numLathsVision, numLathsAbove, actualVisionStartHeight, actualVisionPanelHeight };
    return { totalWeight, torqueWeight, travelHeight, fullCurtainLength, visionData, endlockOffsets };
}

function drawTorqueGraph(profileData, container) {
    container.innerHTML = '';
    if (!profileData || profileData.length === 0) return;
    const svgNS = "http://www.w3.org/2000/svg", svg = document.createElementNS(svgNS, "svg");
    let svgWidth = container.clientWidth; if (svgWidth === 0) svgWidth = 550; 
    let svgHeight = container.clientHeight; if (svgHeight === 0) svgHeight = 280;
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const padding = { top: 30, right: 20, bottom: 60, left: 40 }; 
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;
    const maxTorque = Math.max(...profileData.map(p => p.torque)) * 1.1 || 10;
    const yAxis = document.createElementNS(svgNS, 'line');
    yAxis.setAttribute('x1', padding.left); yAxis.setAttribute('y1', padding.top);
    yAxis.setAttribute('x2', padding.left); yAxis.setAttribute('y2', padding.top + graphHeight);
    yAxis.setAttribute('class', 'axis-line');
    svg.appendChild(yAxis);
    const xLabel = document.createElementNS(svgNS, 'text');
    xLabel.setAttribute('class', 'graph-text');
    xLabel.setAttribute('transform', `translate(${svgWidth/2}, ${svgHeight - 15})`);
    xLabel.textContent = 'Coil Diameter (mm) / Revolutions';
    svg.appendChild(xLabel);
    const barWidth = Math.max(5, graphWidth / profileData.length * 0.8);
    const barSpacing = Math.max(1, graphWidth / profileData.length * 0.2);
    profileData.forEach((item, index) => {
        const barHeight = (item.torque / maxTorque) * graphHeight;
        const x = padding.left + index * (barWidth + barSpacing);
        const y = padding.top + graphHeight - barHeight;
        const revs = (index + 1) * 0.5;
        const bar = document.createElementNS(svgNS, 'rect');
        bar.setAttribute('x', x); bar.setAttribute('y', y); bar.setAttribute('width', barWidth); bar.setAttribute('height', barHeight); bar.setAttribute('class', 'torque-bar');
        const title = document.createElementNS(svgNS, 'title');
        title.textContent = `Rev ${revs.toFixed(1)}: ${item.torque.toFixed(1)} Nm | Dia: ${item.diameter.toFixed(0)} mm`;
        bar.appendChild(title); svg.appendChild(bar);
        const textX = x + barWidth / 2;
        if (barHeight > 15) {
            const torqueText = document.createElementNS(svgNS, 'text');
            torqueText.setAttribute('x', textX); torqueText.setAttribute('y', y - 5); torqueText.setAttribute('class', 'graph-data-label'); 
            torqueText.textContent = `${item.torque.toFixed(1)} Nm`; svg.appendChild(torqueText);
        }
        const showAxisLabel = profileData.length < 15 || index % Math.ceil(profileData.length / 15) === 0;
        if (showAxisLabel) {
            const diaText = document.createElementNS(svgNS, 'text');
            diaText.setAttribute('x', textX); diaText.setAttribute('y', padding.top + graphHeight + 15); diaText.setAttribute('class', 'graph-data-label');
            diaText.textContent = `Ø${item.diameter.toFixed(0)}`; svg.appendChild(diaText);
            const revText = document.createElementNS(svgNS, 'text');
            revText.setAttribute('x', textX); revText.setAttribute('y', padding.top + graphHeight + 28); revText.setAttribute('class', 'graph-data-label');
            revText.textContent = `(${revs.toFixed(1)}r)`; svg.appendChild(revText);
        }
    });
    container.appendChild(svg);
}

function drawDeflectionGraphic(length, deflection, isWarning = false) {
    const container = dom['deflection-graphic-container']; container.innerHTML = '';
    const svgNS = "http://www.w3.org/2000/svg", svg = document.createElementNS(svgNS, "svg");
    let svgWidth = container.clientWidth; if (svgWidth === 0) svgWidth = 550;
    let svgHeight = container.clientHeight; if (svgHeight === 0) svgHeight = 150;
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const padding = 30, beamY = svgHeight / 2 + 10;
    const maxVisualDeflection = svgHeight * 0.3;
    const numericDeflection = parseFloat(deflection) || 0;
    const visualDeflection = Math.min(maxVisualDeflection, numericDeflection * (maxVisualDeflection / 17));
    const startX = padding, endX = svgWidth - padding;
    const refPath = document.createElementNS(svgNS, 'path');
    refPath.setAttribute('d', `M ${startX} ${beamY} H ${endX}`); refPath.setAttribute('class', 'beam-path');
    svg.appendChild(refPath);
    const deflectedPath = document.createElementNS(svgNS, 'path');
    const controlX = svgWidth / 2, controlY = beamY + visualDeflection;
    deflectedPath.setAttribute('d', `M ${startX},${beamY} Q ${controlX},${controlY} ${endX},${beamY}`); deflectedPath.setAttribute('class', 'deflected-path');
    
    let curtainWidth = parseFloat(dom['calculated-curtain-width'].textContent) || 0;
    let requiredRatio = 400;
    if (curtainWidth > 10000) requiredRatio = 800;
    else if (curtainWidth > 8000) requiredRatio = 600;

    const ratio = (numericDeflection > 0) ? length / numericDeflection : Infinity;
    if (isWarning || numericDeflection > 17 || ratio < requiredRatio) { deflectedPath.classList.add('warning'); }
    svg.appendChild(deflectedPath);
    const supportSize = 10;
    const leftSupport = document.createElementNS(svgNS, 'path');
    leftSupport.setAttribute('d', `M ${startX} ${beamY} l -${supportSize/2} ${supportSize} h ${supportSize} z`); leftSupport.setAttribute('class', 'support-symbol');
    svg.appendChild(leftSupport);
    const rightSupport = document.createElementNS(svgNS, 'path');
    rightSupport.setAttribute('d', `M ${endX} ${beamY} l -${supportSize/2} ${supportSize} h ${supportSize} z`); rightSupport.setAttribute('class', 'support-symbol');
    svg.appendChild(rightSupport);
    if (numericDeflection > 0.1) {
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', controlX); text.setAttribute('y', controlY + 15); text.setAttribute('class', 'graph-text');
        text.textContent = `${numericDeflection.toFixed(2)} mm`; svg.appendChild(text);
    }
    container.appendChild(svg);
}

function drawEndplateForceDiagram(downwardForce, pulloutForce, offsetM, fixingSeparation, endplateSize) {
    const container = dom['endplate-force-diagram-container']; container.innerHTML = '';
    if (downwardForce <= 0 && pulloutForce <= 0) return;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const svgWidth = 450; const svgHeight = 250;
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const defs = document.createElementNS(svgNS, 'defs');
    const createMarker = (id, color) => {
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', id); marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '5'); marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '5'); marker.setAttribute('markerHeight', '5');
        marker.setAttribute('orient', 'auto-start-reverse');
        const arrowPath = document.createElementNS(svgNS, 'path');
        arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', color);
        marker.appendChild(arrowPath); return marker;
    };
    defs.appendChild(createMarker('arrow-force-red', '#d93025'));
    defs.appendChild(createMarker('arrow-force-blue', '#007bff'));
    defs.appendChild(createMarker('arrow-dim', '#343a40'));
    svg.appendChild(defs);
    const createElem = (type, attrs) => {
        const el = document.createElementNS(svgNS, type);
        for (const key in attrs) el.setAttribute(key, attrs[key]); return el;
    };
    const wallX = 120; const plateWidth = 20; const plateHeight = 160;
    const plateY = (svgHeight - plateHeight) / 2; const plateCenterX = wallX + plateWidth / 2; const plateCenterY = plateY + plateHeight / 2;
    svg.appendChild(createElem('line', { x1: wallX, y1: 20, x2: wallX, y2: svgHeight - 40, stroke: '#343a40', 'stroke-width': '4' }));
    svg.appendChild(createElem('rect', { x: wallX, y: plateY, width: plateWidth, height: plateHeight, fill: '#adb5bd', stroke: '#495057'}));
    const scaledFixingSep = Math.min(plateHeight * 0.7, fixingSeparation * 0.5); 
    const topFixingY = plateCenterY - scaledFixingSep / 2; const bottomFixingY = plateCenterY + scaledFixingSep / 2;
    svg.appendChild(createElem('circle', { cx: plateCenterX, cy: topFixingY, r: 4, fill: '#495057' }));
    svg.appendChild(createElem('circle', { cx: plateCenterX, cy: bottomFixingY, r: 4, fill: '#495057' }));
    const coilCenterX = wallX + plateWidth + (offsetM * 1000 * 0.5);
    svg.appendChild(createElem('circle', { cx: coilCenterX, cy: plateCenterY, r: 40, fill: '#e9ecef', stroke: '#adb5bd', 'stroke-dasharray': '4,2' }));
    svg.appendChild(createElem('circle', { cx: coilCenterX, cy: plateCenterY, r: 5, fill: '#6c757d' }));
    const arrowStyleRed = { stroke: '#d93025', 'stroke-width': '2', 'marker-end': 'url(#arrow-force-red)' };
    const arrowStyleBlue = { stroke: '#007bff', 'stroke-width': '2', 'marker-start': 'url(#arrow-force-blue)' };
    svg.appendChild(createElem('line', { x1: coilCenterX, y1: plateCenterY + 40, x2: coilCenterX, y2: plateCenterY + 80, ...arrowStyleRed }));
    const mainForceText = createElem('text', { x: coilCenterX, y: plateCenterY + 95, class: 'force-text red' });
    mainForceText.textContent = `Total Shear: ${downwardForce.toFixed(0)} N`;
    svg.appendChild(mainForceText);
    svg.appendChild(createElem('line', { x1: wallX, y1: topFixingY, x2: wallX - 40, y2: topFixingY, ...arrowStyleRed }));
    svg.appendChild(createElem('line', { x1: wallX - 40, y1: bottomFixingY, x2: wallX, y2: bottomFixingY, ...arrowStyleBlue }));
    const pulloutText = createElem('text', { x: wallX - 45, y: topFixingY, class: 'force-text red', 'text-anchor': 'end', 'dominant-baseline': 'middle' });
    pulloutText.textContent = `${pulloutForce.toFixed(0)} N`; svg.appendChild(pulloutText);
    const compText = createElem('text', { x: wallX - 45, y: bottomFixingY, class: 'force-text blue', 'text-anchor': 'end', 'dominant-baseline': 'middle' });
    compText.textContent = `${pulloutForce.toFixed(0)} N`; svg.appendChild(compText);
    const shearForcePerBolt = downwardForce / 2;
    svg.appendChild(createElem('line', { x1: plateCenterX, y1: topFixingY, x2: plateCenterX, y2: topFixingY + 30, ...arrowStyleRed }));
    svg.appendChild(createElem('line', { x1: plateCenterX, y1: bottomFixingY, x2: plateCenterX, y2: bottomFixingY + 30, ...arrowStyleRed }));
    const shearText = createElem('text', { x: plateCenterX + 5, y: bottomFixingY + 45, class: 'force-text red', 'text-anchor': 'start' });
    shearText.textContent = `Shear: ${shearForcePerBolt.toFixed(0)} N (each)`; svg.appendChild(shearText);
    const dimStyle = { class: 'dimension-line', 'marker-start': 'url(#arrow-dim)', 'marker-end': 'url(#arrow-dim)' };
    const fixDimX = wallX + plateWidth + 20;
    svg.appendChild(createElem('line', { x1: fixDimX, y1: topFixingY, x2: fixDimX, y2: bottomFixingY, ...dimStyle }));
    svg.appendChild(createElem('line', { x1: plateCenterX, y1: topFixingY, x2: fixDimX, y2: topFixingY, class: 'leader-line'}));
    svg.appendChild(createElem('line', { x1: plateCenterX, y1: bottomFixingY, x2: fixDimX, y2: bottomFixingY, class: 'leader-line'}));
    const fixText = createElem('text', { x: fixDimX + 4, y: plateCenterY, class: 'dim-text-force-diagram', 'text-anchor':'start', 'dominant-baseline':'middle', transform:`rotate(-90, ${fixDimX+4}, ${plateCenterY})`});
    fixText.textContent = `${fixingSeparation.toFixed(0)} mm`; svg.appendChild(fixText);
    const offsetDimY = 20;
    svg.appendChild(createElem('line', { x1: wallX, y1: offsetDimY, x2: coilCenterX, y2: offsetDimY, ...dimStyle }));
    const offsetText = createElem('text', { x: wallX + (coilCenterX - wallX)/2, y: offsetDimY - 4, class: 'dim-text-force-diagram' });
    offsetText.textContent = `Offset: ${(offsetM * 1000).toFixed(0)} mm`; svg.appendChild(offsetText);
    container.appendChild(svg);
}

function drawEndplateGraphic(endplate, coilDiameter, axle, lath, numLaths) {
    const container = dom['endplate-graphic-container']; container.innerHTML = '';
    if (!endplate || !coilDiameter || !axle || !lath || !numLaths || coilDiameter <= 0) { return; }
    const endplateSize = parseFloat(endplate.Size);
    const lathThickness = parseFloat(lath['Thickness']);
    if (isNaN(endplateSize) || isNaN(lathThickness) || endplateSize <= 0) return;
    const svgNS = "http://www.w3.org/2000/svg"; const svg = document.createElementNS(svgNS, "svg");
    const svgWidth = 550; const svgHeight = 250;
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker'); marker.setAttribute('id', 'arrow-endplate'); marker.setAttribute('viewBox', '0 0 10 10'); marker.setAttribute('refX', '1'); marker.setAttribute('refY', '5'); marker.setAttribute('markerWidth', '5'); marker.setAttribute('markerHeight', '5'); marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path'); arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', '#343a40');
    marker.appendChild(arrowPath); defs.appendChild(marker); svg.appendChild(defs);
    const padding = { top: 20, right: 120, bottom: 40, left: 20 };
    const graphHeight = svgHeight - padding.top - padding.bottom;
    const scale = graphHeight / endplateSize;
    const scaledBoxSize = endplateSize * scale;
    const boxX = padding.left; const boxY = padding.top + (graphHeight - scaledBoxSize) / 2;
    const centerX = boxX + scaledBoxSize / 2; const centerY = boxY + scaledBoxSize / 2;
    const createElem = (type, attrs) => {
        const el = document.createElementNS(svgNS, type); for (const key in attrs) el.setAttribute(key, attrs[key]); return el;
    };
    svg.appendChild(createElem('rect', { x: boxX, y: boxY, width: scaledBoxSize, height: scaledBoxSize, fill: '#f8f9fa', stroke: '#ced4da', 'stroke-width': '1' }));
    const axleDiameter = getEffectiveCoilDiameter(axle); const scaledAxleRadius = (axleDiameter / 2) * scale;
    svg.appendChild(createElem('circle', { cx: centerX, cy: centerY, r: scaledAxleRadius, class: 'shutter-axle-graphic' }));
    for (let i = 1; i <= numLaths; i++) {
        const currentRadius = (axleDiameter / 2) + (i * lathThickness);
        if (currentRadius * 2 > coilDiameter) break; 
        svg.appendChild(createElem('circle', { cx: centerX, cy: centerY, r: currentRadius * scale, class: 'coil-wrap-graphic' }));
    }
    const scaledCoilRadius = (coilDiameter / 2) * scale;
    svg.appendChild(createElem('circle', { cx: centerX, cy: centerY, r: scaledCoilRadius, fill: 'none', stroke: '#007bff', 'stroke-width': '2' }));
    const dimLineX = boxX + scaledBoxSize + 25;
    svg.appendChild(createElem('line', { x1: boxX, y1: boxY, x2: dimLineX, y2: boxY, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
    svg.appendChild(createElem('line', { x1: boxX, y1: boxY + scaledBoxSize, x2: dimLineX, y2: boxY + scaledBoxSize, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
    svg.appendChild(createElem('line', { x1: dimLineX, y1: boxY, x2: dimLineX, y2: boxY + scaledBoxSize, class: 'dimension-line', 'marker-start': 'url(#arrow-endplate)', 'marker-end': 'url(#arrow-endplate)' }));
    const boxSizeTextX = dimLineX + 12;
    const boxSizeText = createElem('text', { x: boxSizeTextX, y: centerY, class: 'large-dimension-text', 'text-anchor': 'middle', transform: `rotate(-90, ${boxSizeTextX}, ${centerY})` });
    boxSizeText.textContent = `${endplateSize.toFixed(0)} mm`; svg.appendChild(boxSizeText);
    const coilDimY = boxY + scaledBoxSize + 20;
    svg.appendChild(createElem('line', { x1: centerX - scaledCoilRadius, y1: centerY, x2: centerX - scaledCoilRadius, y2: coilDimY, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
    svg.appendChild(createElem('line', { x1: centerX + scaledCoilRadius, y1: centerY, x2: centerX + scaledCoilRadius, y2: coilDimY, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
    svg.appendChild(createElem('line', { x1: centerX - scaledCoilRadius, y1: coilDimY, x2: centerX + scaledCoilRadius, y2: coilDimY, class: 'dimension-line', 'marker-start': 'url(#arrow-endplate)', 'marker-end': 'url(#arrow-endplate)' }));
    const coilDimText = createElem('text', { x: centerX, y: coilDimY + 15, class: 'large-dimension-text' });
    coilDimText.textContent = `Ø ${coilDiameter.toFixed(1)} mm`; svg.appendChild(coilDimText);
    const clearance = (endplateSize - coilDiameter) / 2;
    if (clearance > 1) {
        const clearanceDimX = dimLineX + 40; const topY = boxY; const coilTopY = centerY - scaledCoilRadius;
        svg.appendChild(createElem('line', { x1: centerX, y1: topY, x2: clearanceDimX, y2: topY, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
        svg.appendChild(createElem('line', { x1: centerX, y1: coilTopY, x2: clearanceDimX, y2: coilTopY, class: 'dimension-line', 'stroke-dasharray': '2,2' }));
        svg.appendChild(createElem('line', { x1: clearanceDimX, y1: topY, x2: clearanceDimX, y2: coilTopY, class: 'dimension-line', 'marker-start': 'url(#arrow-endplate)', 'marker-end': 'url(#arrow-endplate)' }));
        const clearanceTextX = clearanceDimX + 12;
        const clearanceText = createElem('text', { x: clearanceTextX, y: topY + (coilTopY - topY) / 2, class: 'large-dimension-text', 'text-anchor': 'middle', transform: `rotate(-90, ${clearanceTextX}, ${topY + (coilTopY - topY) / 2})` });
        clearanceText.textContent = `${clearance.toFixed(1)} mm`; svg.appendChild(clearanceText);
    }
    container.appendChild(svg);
}

function drawAxleCrossSection(axle, collarSize = 0) {
    const container = dom['axle-cross-section-container']; 
    container.innerHTML = '';
    if (!axle) return;

    const outerDia = parseFloat(axle['Diameter']); 
    const wallThick = parseFloat(axle['Wall Thickness']); 
    const shape = (axle['Shape'] || 'circular').toLowerCase();
    
    if (isNaN(outerDia) || isNaN(wallThick) || outerDia <= 0 || wallThick <= 0) return;

    const innerDia = outerDia - (2 * wallThick);

    // --- 1. GATHER DYNAMIC DATA & APPLY LOGIC ---
    const mountType = (dom.motorMountingType.value || '').toLowerCase();
    const isTubular = mountType.includes('tubular');
    const isChainDrive = mountType.includes('chain');

    // A. Get Motor Shaft Size
    let motorShaftRaw = parseFloat(dom['motor-driveshaft-dia'].textContent);
    if (isNaN(motorShaftRaw)) motorShaftRaw = 40; 
    
    // B. Get Safety Brake Shaft Size (Directly from Data)
    let brakeShaftValue = 0;
    const sbIndex = dom.safetyBrakeSelector.value;
    
    if (sbIndex !== "" && safetyBrakeData[sbIndex]) {
        const sb = safetyBrakeData[sbIndex];
        const dsKey = Object.keys(sb).find(k => k.toLowerCase().includes('driveshaft diameter'));
        if (dsKey) brakeShaftValue = parseFloat(sb[dsKey]);
    }
    // Fallback
    if (!brakeShaftValue || isNaN(brakeShaftValue)) {
        brakeShaftValue = parseFloat(dom['safety-brake-driveshaft'].textContent);
    }
    if (isNaN(brakeShaftValue) || brakeShaftValue === 0) brakeShaftValue = 40;

    // C. Determine Shaft Configuration
    let leftShaftDia = 40;
    let rightShaftDia = 40;
    let leftLabel = "Motor Shaft";
    let rightLabel = "Bearing Shaft";
    let showLeftShaft = true;

    if (isTubular) {
        // --- TUBULAR MOTOR ---
        showLeftShaft = false; 
        
        // Right Side: Safety Brake (Use EXACT brake size)
        rightShaftDia = brakeShaftValue;
        rightLabel = "Safety Brake Shaft";

    } else if (isChainDrive) {
        // --- CHAIN DRIVE ---
        
        // Right Side: Safety Brake (Use EXACT brake size)
        rightShaftDia = brakeShaftValue;
        rightLabel = "Safety Brake Shaft";

        // Left Side: Bearing Shaft (Matches brake size, but MINIMUM 30mm)
        leftShaftDia = (brakeShaftValue < 30) ? 30 : brakeShaftValue;
        leftLabel = "Bearing Shaft";

    } else {
        // --- DIRECT DRIVE ---
        
        // Left Side: Motor Shaft (Use EXACT motor size)
        leftShaftDia = motorShaftRaw;
        leftLabel = "Motor Shaft";

        // Right Side: Bearing Shaft (Matches motor, but MINIMUM 30mm)
        rightShaftDia = (motorShaftRaw < 30) ? 30 : motorShaftRaw;
        rightLabel = "Bearing Shaft";
    }

    // --- 2. SETUP SVG ---
    const svgNS = "http://www.w3.org/2000/svg"; 
    const svg = document.createElementNS(svgNS, "svg");
    const svgWidth = 900; 
    const svgHeight = 350; 
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    // Scaling
    const maxRefDia = Math.max(outerDia, collarSize, 120); 
    const scale = 140 / maxRefDia; 

    // Standardized Font Settings
    const stdFont = { 'font-family': 'Arial, sans-serif', 'font-size': '14px', 'fill': '#212529', 'font-weight': '500' };
    const stdFontBold = { ...stdFont, 'font-weight': 'bold' };

    // Helper
    const createElem = (type, attrs) => { 
        const el = document.createElementNS(svgNS, type); 
        for (const key in attrs) el.setAttribute(key, attrs[key]); return el; 
    };

    // Definitions (Markers)
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker'); 
    marker.setAttribute('id', 'axle-arrow'); marker.setAttribute('viewBox', '0 0 10 10'); 
    marker.setAttribute('refX', '0'); marker.setAttribute('refY', '5'); 
    marker.setAttribute('markerWidth', '6'); marker.setAttribute('markerHeight', '6'); marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path'); 
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', '#343a40'); 
    marker.appendChild(arrowPath); defs.appendChild(marker); svg.appendChild(defs);

    // --- 3. LEFT SIDE: CROSS SECTION ---
    const cx = 150; 
    const cy = 175; 

    // Draw Body
    if (shape === 'octagonal') {
        const createOctagon = (flatToFlat, style) => {
            const circumRadius = (flatToFlat / 2) / Math.cos(Math.PI / 8);
            const points = [];
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 8) + i * (Math.PI / 4);
                points.push(`${cx + (circumRadius * scale) * Math.cos(angle)},${cy - (circumRadius * scale) * Math.sin(angle)}`);
            }
            return createElem('polygon', { points: points.join(' '), ...style });
        };
        svg.appendChild(createOctagon(outerDia, { stroke: '#343a40', 'stroke-width': '2', fill: '#adb5bd' }));
        svg.appendChild(createOctagon(innerDia, { stroke: '#343a40', 'stroke-width': '1.5', fill: '#f8f9fa' }));
    } else { 
        svg.appendChild(createElem('circle', { cx: cx, cy: cy, r: (outerDia/2)*scale, stroke: '#343a40', 'stroke-width': '2', fill: '#adb5bd' }));
        svg.appendChild(createElem('circle', { cx: cx, cy: cy, r: (innerDia/2)*scale, stroke: '#343a40', 'stroke-width': '1.5', fill: '#f8f9fa' }));
    }

    // Collar Ghost
    if (collarSize > outerDia) {
        svg.appendChild(createElem('circle', { cx: cx, cy: cy, r: (collarSize/2)*scale, stroke: '#555', 'stroke-width': '1', 'stroke-dasharray': '4,2', fill: 'none' }));
        const txtCollar = createElem('text', { x: cx, y: cy - (collarSize/2)*scale - 10, 'text-anchor': 'middle', ...stdFont });
        txtCollar.textContent = `Collar: Ø${collarSize}`; svg.appendChild(txtCollar);
    }

    // Dimensions: OD (Top)
    const odRadius = (outerDia/2) * scale;
    const dimLineY = cy - odRadius - 25;
    svg.appendChild(createElem('line', { x1: cx - odRadius, y1: cy - odRadius, x2: cx - odRadius, y2: dimLineY, stroke: '#adb5bd', 'stroke-dasharray':'2,2' }));
    svg.appendChild(createElem('line', { x1: cx + odRadius, y1: cy - odRadius, x2: cx + odRadius, y2: dimLineY, stroke: '#adb5bd', 'stroke-dasharray':'2,2' }));
    svg.appendChild(createElem('line', { x1: cx - odRadius, y1: dimLineY + 10, x2: cx + odRadius, y2: dimLineY + 10, stroke: '#212529', 'marker-start': 'url(#axle-arrow)', 'marker-end': 'url(#axle-arrow)' }));
    const textOD = createElem('text', { x: cx, y: dimLineY, 'text-anchor': 'middle', ...stdFontBold });
    textOD.textContent = `Ø${outerDia.toFixed(1)} OD`; svg.appendChild(textOD);

    // Dimensions: ID (Bottom)
    if (innerDia > 40) {
        const idRadius = (innerDia/2) * scale;
        const dimIDY = cy + odRadius + 25;
        svg.appendChild(createElem('line', { x1: cx - idRadius, y1: cy + (innerDia/2)*scale, x2: cx - idRadius, y2: dimIDY, stroke: '#adb5bd', 'stroke-dasharray':'2,2' }));
        svg.appendChild(createElem('line', { x1: cx + idRadius, y1: cy + (innerDia/2)*scale, x2: cx + idRadius, y2: dimIDY, stroke: '#adb5bd', 'stroke-dasharray':'2,2' }));
        svg.appendChild(createElem('line', { x1: cx - idRadius, y1: dimIDY - 10, x2: cx + idRadius, y2: dimIDY - 10, stroke: '#212529', 'marker-start': 'url(#axle-arrow)', 'marker-end': 'url(#axle-arrow)' }));
        const textID = createElem('text', { x: cx, y: dimIDY + 5, 'text-anchor': 'middle', ...stdFont });
        textID.textContent = `Ø${innerDia.toFixed(1)} ID`; svg.appendChild(textID);
    }

    // Dimensions: Wall Thickness (Rotated 45 degrees NE)
    const angle45 = -Math.PI / 4; 
    const distOuter = odRadius + 60;
    const distInner = odRadius - (wallThick * scale) / 2;
    
    const startX = cx + distOuter * Math.cos(angle45);
    const startY = cy + distOuter * Math.sin(angle45);
    const endX = cx + distInner * Math.cos(angle45);
    const endY = cy + distInner * Math.sin(angle45);

    svg.appendChild(createElem('line', { x1: startX, y1: startY, x2: endX, y2: endY, stroke: '#212529', 'marker-end': 'url(#axle-arrow)' }));
    const textWall = createElem('text', { x: startX + 5, y: startY - 5, 'text-anchor': 'start', ...stdFont });
    textWall.textContent = `${wallThick.toFixed(1)}mm Wall`; svg.appendChild(textWall);


    // --- 4. RIGHT SIDE: FRONT VIEW ---
    const fvX = 500; 
    const fvW = 250; 
    const axleH = outerDia * scale;
    const fvY = cy - (axleH / 2);

    const leftShaftH = leftShaftDia * scale;
    const rightShaftH = rightShaftDia * scale;
    const shaftW = 50; 

    // Axle Body Rect
    svg.appendChild(createElem('rect', { x: fvX, y: fvY, width: fvW, height: axleH, fill: '#adb5bd', stroke: '#343a40', 'stroke-width': '2' }));
    
    // Wall Thickness Dotted Lines (Front View)
    const scaledWall = wallThick * scale;
    const topWallY = fvY + scaledWall;
    const bottomWallY = fvY + axleH - scaledWall;
    svg.appendChild(createElem('line', { x1: fvX, y1: topWallY, x2: fvX + fvW, y2: topWallY, stroke: '#495057', 'stroke-width': '1', 'stroke-dasharray': '5,3' }));
    svg.appendChild(createElem('line', { x1: fvX, y1: bottomWallY, x2: fvX + fvW, y2: bottomWallY, stroke: '#495057', 'stroke-width': '1', 'stroke-dasharray': '5,3' }));

    // Label: Axle Front View
    const textFV = createElem('text', { x: fvX + fvW/2, y: cy + (outerDia/2)*scale + 30, 'text-anchor': 'middle', ...stdFontBold });
    textFV.textContent = "Axle Front View"; svg.appendChild(textFV);

    // --- LEFT SHAFT ---
    if (showLeftShaft) {
        // Shaft
        svg.appendChild(createElem('rect', { x: fvX - shaftW, y: cy - (leftShaftH / 2), width: shaftW, height: leftShaftH, fill: '#6c757d', stroke: '#343a40', 'stroke-width': '1' }));
        
        // Dimension
        const lDimX = fvX - shaftW - 15;
        svg.appendChild(createElem('line', { x1: lDimX, y1: cy - leftShaftH/2, x2: lDimX, y2: cy + leftShaftH/2, stroke: '#212529', 'marker-start': 'url(#axle-arrow)', 'marker-end': 'url(#axle-arrow)' }));
        svg.appendChild(createElem('line', { x1: lDimX, y1: cy - leftShaftH/2, x2: fvX - shaftW, y2: cy - leftShaftH/2, stroke: '#ccc', 'stroke-dasharray':'2,2' }));
        svg.appendChild(createElem('line', { x1: lDimX, y1: cy + leftShaftH/2, x2: fvX - shaftW, y2: cy + leftShaftH/2, stroke: '#ccc', 'stroke-dasharray':'2,2' }));
        
        const txtL = createElem('text', { x: lDimX - 5, y: cy, 'text-anchor': 'end', 'dominant-baseline':'middle', ...stdFontBold });
        txtL.textContent = `Ø${leftShaftDia.toFixed(1)}`; svg.appendChild(txtL);

        // Label (Moved further left)
        const lblL = createElem('text', { x: fvX - shaftW - 20, y: cy - (leftShaftH/2) - 15, 'text-anchor': 'end', ...stdFont });
        lblL.textContent = leftLabel; svg.appendChild(lblL);
    } else {
        // Tubular Internal Line
        svg.appendChild(createElem('line', { x1: fvX, y1: fvY, x2: fvX, y2: fvY+axleH, stroke:'#343a40', 'stroke-width': '4' }));
        const txtTub = createElem('text', { x: fvX + 10, y: cy, 'text-anchor': 'start', 'dominant-baseline': 'middle', 'fill': '#fff', 'font-family': 'Arial', 'font-size':'14px' });
        txtTub.textContent = "Tubular Motor"; svg.appendChild(txtTub);
    }

    // --- RIGHT SHAFT ---
    // Shaft
    svg.appendChild(createElem('rect', { x: fvX + fvW, y: cy - (rightShaftH / 2), width: shaftW, height: rightShaftH, fill: '#6c757d', stroke: '#343a40', 'stroke-width': '1' }));

    // Dimension
    const rDimX = fvX + fvW + shaftW + 15;
    svg.appendChild(createElem('line', { x1: rDimX, y1: cy - rightShaftH/2, x2: rDimX, y2: cy + rightShaftH/2, stroke: '#212529', 'marker-start': 'url(#axle-arrow)', 'marker-end': 'url(#axle-arrow)' }));
    svg.appendChild(createElem('line', { x1: fvX + fvW + shaftW, y1: cy - rightShaftH/2, x2: rDimX, y2: cy - rightShaftH/2, stroke: '#ccc', 'stroke-dasharray':'2,2' }));
    svg.appendChild(createElem('line', { x1: fvX + fvW + shaftW, y1: cy + rightShaftH/2, x2: rDimX, y2: cy + rightShaftH/2, stroke: '#ccc', 'stroke-dasharray':'2,2' }));

    const txtR = createElem('text', { x: rDimX + 5, y: cy, 'text-anchor': 'start', 'dominant-baseline':'middle', ...stdFontBold });
    txtR.textContent = `Ø${rightShaftDia.toFixed(1)}`; svg.appendChild(txtR);

    // Label (Moved further right)
    const lblR = createElem('text', { x: fvX + fvW + shaftW + 20, y: cy - (rightShaftH/2) - 15, 'text-anchor': 'start', ...stdFont });
    lblR.textContent = rightLabel; svg.appendChild(lblR);

    container.appendChild(svg);
}

function drawShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, visionData = null, endlockOffsets = {cast: 0, wind: 0}) {
    const container = dom['shutter-graphic-container']; container.innerHTML = '';
    const graphic = createBaseShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, { visionOptions: visionData, endlockOffsets: endlockOffsets }, 'shutter');
    if(graphic) container.appendChild(graphic);
}

function drawWicketGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, wicket, wicketLathHeight, endlockOffsets = {cast: 0, wind: 0}) {
    const container = dom['wicket-graphic-container']; container.innerHTML = '';
    const graphic = createBaseShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, { wicket: wicket, endlockOffsets: endlockOffsets }, 'wicket');
    if(graphic) container.appendChild(graphic);
}

function drawTopDownWidthGraphic(calculatedWidths, guide) {
    const container = dom['width-graphic-container']; container.innerHTML = '';
    const { curtainWidth, clearOpening, overallWidth } = calculatedWidths;
    if (!guide || !overallWidth || overallWidth <= 0) { return; }
    const penetrationKey = Object.keys(guide).find(k => k.toLowerCase().trim() === 'penetration');
    const guideWidthKey = Object.keys(guide).find(k => k.toLowerCase().trim() === 'width');
    const guidePenetration = parseFloat(guide[penetrationKey]) || 0;
    const guideWidth = parseFloat(guide[guideWidthKey]) || 0;
    const svgNS = "http://www.w3.org/2000/svg"; const svg = document.createElementNS(svgNS, "svg");
    const svgWidth = 600; const svgHeight = 180; 
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker'); marker.setAttribute('id', 'dim-arrow-width-graphic'); marker.setAttribute('viewBox', '0 0 10 10'); marker.setAttribute('refX', '5'); marker.setAttribute('refY', '5'); marker.setAttribute('markerWidth', '4'); marker.setAttribute('markerHeight', '4'); marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path'); arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', '#343a40'); marker.appendChild(arrowPath); defs.appendChild(marker); svg.appendChild(defs);
    const padding = { x: 50, y: 30 }; const graphicWidth = svgWidth - 2 * padding.x; const scale = graphicWidth / overallWidth;
    const curtainHeight = 20; const guideDepth = 30; const graphicTopY = padding.y;
    const scaledGuideWidth = guideWidth * scale; const scaledCurtainWidth = curtainWidth * scale; const scaledClearOpening = clearOpening * scale; const scaledPenetration = guidePenetration * scale;
    const overallStartX = padding.x;
    const guideStyle = { fill: 'none', stroke: '#6c757d', 'stroke-width': '2' };
    const leftGuideX = overallStartX; const leftGuideY = graphicTopY - (guideDepth - curtainHeight) / 2;
    const leftGuidePath = document.createElementNS(svgNS, 'path'); leftGuidePath.setAttribute('d', `M ${leftGuideX + scaledGuideWidth},${leftGuideY} L ${leftGuideX},${leftGuideY} L ${leftGuideX},${leftGuideY + guideDepth} L ${leftGuideX + scaledGuideWidth},${leftGuideY + guideDepth}`); Object.keys(guideStyle).forEach(key => leftGuidePath.setAttribute(key, guideStyle[key])); svg.appendChild(leftGuidePath);
    const rightGuideX = overallStartX + graphicWidth - scaledGuideWidth; const rightGuideY = graphicTopY - (guideDepth - curtainHeight) / 2;
    const rightGuidePath = document.createElementNS(svgNS, 'path'); rightGuidePath.setAttribute('d', `M ${rightGuideX},${rightGuideY} L ${rightGuideX + scaledGuideWidth},${rightGuideY} L ${rightGuideX + scaledGuideWidth},${rightGuideY + guideDepth} L ${rightGuideX},${rightGuideY + guideDepth}`); Object.keys(guideStyle).forEach(key => rightGuidePath.setAttribute(key, guideStyle[key])); svg.appendChild(rightGuidePath);
    const curtainX = overallStartX + scaledGuideWidth - scaledPenetration;
    const curtain = document.createElementNS(svgNS, 'rect'); curtain.setAttribute('x', curtainX); curtain.setAttribute('y', graphicTopY); curtain.setAttribute('width', scaledCurtainWidth); curtain.setAttribute('height', curtainHeight); curtain.setAttribute('class', 'shutter-bottomlath-graphic'); svg.appendChild(curtain);
    const endCapWidth = 5; const leftEndCap = document.createElementNS(svgNS, 'rect'); leftEndCap.setAttribute('x', curtainX); leftEndCap.setAttribute('y', graphicTopY); leftEndCap.setAttribute('width', endCapWidth); leftEndCap.setAttribute('height', curtainHeight); leftEndCap.setAttribute('fill', 'black'); svg.appendChild(leftEndCap);
    const rightEndCap = document.createElementNS(svgNS, 'rect'); rightEndCap.setAttribute('x', curtainX + scaledCurtainWidth - endCapWidth); rightEndCap.setAttribute('y', graphicTopY); rightEndCap.setAttribute('width', endCapWidth); rightEndCap.setAttribute('height', curtainHeight); rightEndCap.setAttribute('fill', 'black'); svg.appendChild(rightEndCap);
    const drawDim = (yOffset, startX, endX, label, value) => {
        const lineY = graphicTopY + guideDepth + yOffset; const tickHeight = 8; const textGap = 5;
        const line = document.createElementNS(svgNS, 'line'); line.setAttribute('x1', startX); line.setAttribute('y1', lineY); line.setAttribute('x2', endX); line.setAttribute('y2', lineY); line.setAttribute('class', 'dimension-line'); line.setAttribute('marker-start', 'url(#dim-arrow-width-graphic)'); line.setAttribute('marker-end', 'url(#dim-arrow-width-graphic)'); svg.appendChild(line);
        const tick1 = document.createElementNS(svgNS, 'line'); tick1.setAttribute('x1', startX); tick1.setAttribute('y1', lineY); tick1.setAttribute('x2', startX); tick1.setAttribute('y2', lineY - tickHeight); tick1.setAttribute('class', 'dimension-tick'); svg.appendChild(tick1);
        const tick2 = document.createElementNS(svgNS, 'line'); tick2.setAttribute('x1', endX); tick2.setAttribute('y1', lineY); tick2.setAttribute('x2', endX); tick2.setAttribute('y2', lineY - tickHeight); tick2.setAttribute('class', 'dimension-tick'); svg.appendChild(tick2);
        const labelText = document.createElementNS(svgNS, 'text'); labelText.textContent = label; labelText.setAttribute('class', 'width-graphic-label'); labelText.setAttribute('x', startX + (endX - startX) / 2); labelText.setAttribute('y', lineY - textGap); svg.appendChild(labelText);
        const valueText = document.createElementNS(svgNS, 'text'); valueText.textContent = `(${value.toFixed(0)} mm)`; valueText.setAttribute('class', 'width-graphic-value'); valueText.setAttribute('x', startX + (endX - startX) / 2); valueText.setAttribute('y', lineY + textGap + 10); svg.appendChild(valueText);
    };
    const clearOpeningStartX = overallStartX + scaledGuideWidth; const clearOpeningEndX = clearOpeningStartX + scaledClearOpening;
    drawDim(30, clearOpeningStartX, clearOpeningEndX, 'Clear Opening', clearOpening);
    const curtainEndX = curtainX + scaledCurtainWidth;
    drawDim(65, curtainX, curtainEndX, 'Curtain width', curtainWidth);
    const overallEndX = overallStartX + graphicWidth;
    drawDim(100, overallStartX, overallEndX, 'Overall width', overallWidth);
    container.appendChild(svg);
}

function createBaseShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, options = {}, idSuffix = 'default') {
    const svgNS = "http://www.w3.org/2000/svg";
    if (!realWidth || !lath || !bottomLath || !axle) { return null; }
    const { wicket = null, visionOptions = null, endlockOffsets = { cast: 0, wind: 0 } } = options;
    const selectedEndlockIndex = dom.endlockType.value; const endlocksSelected = selectedEndlockIndex !== "" && endlockData[selectedEndlockIndex];
    const svg = document.createElementNS(svgNS, "svg");
    const basePadding = { top: 25, right: 120, bottom: 60, left: 120 };
    const topDimClearance = 35; const totalTopPadding = basePadding.top + topDimClearance;
    const svgWidth = 600; const mainLathHeight = parseFloat(lath['Compressed lath height']);
    const bottomLathHeight = parseFloat(bottomLath['BLath height'] || mainLathHeight);
    const axleDiameter = parseFloat(axle['Diameter']);
    let totalRealCompressedHeight = parseFloat(dom['curtain-height-compressed'].textContent) + axleDiameter;
    const totalRealAxleWidth = realWidth + (additionalLength || 0);
    if (totalRealCompressedHeight <= 0 || totalRealAxleWidth <= 0) return null;
    const graphWidth = svgWidth - basePadding.left - basePadding.right; const scale = graphWidth / totalRealAxleWidth;
    const graphHeight = totalRealCompressedHeight * scale; const svgHeight = graphHeight + totalTopPadding + basePadding.bottom;
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker'); marker.setAttribute('id', `dim-arrow-${idSuffix}`); marker.setAttribute('viewBox', '0 0 10 10'); marker.setAttribute('refX', '5'); marker.setAttribute('refY', '5'); marker.setAttribute('markerWidth', '5'); marker.setAttribute('markerHeight', '5'); marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path'); arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); arrowPath.setAttribute('fill', '#343a40'); marker.appendChild(arrowPath); defs.appendChild(marker); svg.appendChild(defs);
    const scaledTotalAxleWidth = totalRealAxleWidth * scale; const scaledShutterWidth = realWidth * scale;
    const startX = basePadding.left; const lathStartX = startX + (scaledTotalAxleWidth - scaledShutterWidth) / 2;
    const scaledCastOffset = endlockOffsets.cast * scale; const scaledWindOffset = endlockOffsets.wind * scale;
    const createLeaderLine = (x1, y1, x2, y2) => {
        const line = document.createElementNS(svgNS, 'line'); line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2); line.setAttribute('class', 'leader-line'); svg.appendChild(line);
    };
    const drawDimensionLine = (x1, y1, x2, y2, label, orientation = 'horizontal', textSide = 'right') => {
        const line = document.createElementNS(svgNS, 'line'); line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2); line.setAttribute('class', 'dimension-line'); line.setAttribute('marker-start', `url(#dim-arrow-${idSuffix})`); line.setAttribute('marker-end', `url(#dim-arrow-${idSuffix})`); svg.appendChild(line);
        const text = document.createElementNS(svgNS, 'text'); text.textContent = label; text.setAttribute('class', 'dimension-text');
        if (orientation === 'horizontal') { text.setAttribute('x', x1 + (x2 - x1) / 2); text.setAttribute('y', y1 - 4); } else {
            const textY = y1 + (y2 - y1) / 2; let textX; if (textSide === 'left') { textX = x1 - 4; text.setAttribute('text-anchor', 'end'); } else { textX = x1 + 4; text.setAttribute('text-anchor', 'start'); }
            text.setAttribute('x', textX); text.setAttribute('y', textY); text.setAttribute('dominant-baseline', 'middle'); text.setAttribute('transform', `rotate(-90, ${textX}, ${textY})`);
        } svg.appendChild(text);
    };
    const drawAnnotation = (startY, endY, label) => {
        const lineX = basePadding.left - 55; const textX = lineX - 8;
        const line = document.createElementNS(svgNS, 'line'); line.setAttribute('x1', lineX); line.setAttribute('y1', startY); line.setAttribute('x2', lineX); line.setAttribute('y2', endY); line.setAttribute('class', 'dimension-line'); line.setAttribute('marker-start', `url(#dim-arrow-${idSuffix})`); line.setAttribute('marker-end', `url(#dim-arrow-${idSuffix})`); svg.appendChild(line);
        const text = document.createElementNS(svgNS, 'text'); text.setAttribute('x', textX); text.setAttribute('class', 'dimension-text'); text.setAttribute('text-anchor', 'end');
        const charLimit = 14; const words = label.split(' '); let currentLine = '';
        words.forEach(word => {
            if ((currentLine + ' ' + word).length > charLimit && currentLine.length > 0) {
                const tspan = document.createElementNS(svgNS, 'tspan'); tspan.setAttribute('x', textX); tspan.setAttribute('dy', '1.2em'); tspan.textContent = word; text.appendChild(tspan); currentLine = word;
            } else {
                if (currentLine.length > 0) currentLine += ' '; currentLine += word; if (text.childElementCount === 0) { text.textContent = currentLine; } else { text.lastChild.textContent = currentLine; }
            }
        });
        const numLines = 1 + text.querySelectorAll('tspan').length; const middleY = startY + (endY - startY) / 2; const lineHeight = 6; 
        const startYForBlock = middleY - ((numLines - 1) * lineHeight / 2); text.setAttribute('y', startYForBlock); svg.appendChild(text);
    };
    const scaledAxleHeight = axleDiameter * scale; const axleY = totalTopPadding; const axleCenterlineY = axleY + scaledAxleHeight / 2; const bottomY = totalTopPadding + graphHeight; let currentY = bottomY;
    let endplateTopY = axleY; 
    if (selectedEndplate) { const endplateSize = parseFloat(selectedEndplate.Size) || 0; if (endplateSize > 0) { const scaledEndplateHeight = endplateSize * scale; endplateTopY = axleCenterlineY - (scaledEndplateHeight / 2); } }
    const scaledBottomLathHeight = bottomLathHeight * scale; currentY -= scaledBottomLathHeight;
    const bottomLathRect = document.createElementNS(svgNS, 'rect'); bottomLathRect.setAttribute('x', lathStartX); bottomLathRect.setAttribute('y', currentY); bottomLathRect.setAttribute('width', scaledShutterWidth); bottomLathRect.setAttribute('height', scaledBottomLathHeight); bottomLathRect.setAttribute('class', 'shutter-bottomlath-graphic'); svg.appendChild(bottomLathRect);
    const bottomLathTopY = currentY;
    const drawEndlocks = (lathY, lathH, leftOffset = 0) => {
        const endlockSide = lathH * 0.8; const endlockY = lathY + (lathH - endlockSide) / 2;
        const leftEndlock = document.createElementNS(svgNS, 'rect'); leftEndlock.setAttribute('x', lathStartX + leftOffset - scaledCastOffset); leftEndlock.setAttribute('y', endlockY); leftEndlock.setAttribute('width', endlockSide); leftEndlock.setAttribute('height', endlockSide); leftEndlock.setAttribute('class', 'endlock-graphic'); svg.appendChild(leftEndlock);
        const rightEndlock = document.createElementNS(svgNS, 'rect'); const curtainRightEdge = lathStartX + scaledShutterWidth; rightEndlock.setAttribute('x', curtainRightEdge + scaledCastOffset - endlockSide); rightEndlock.setAttribute('y', endlockY); rightEndlock.setAttribute('width', endlockSide); rightEndlock.setAttribute('height', endlockSide); rightEndlock.setAttribute('class', 'endlock-graphic'); svg.appendChild(rightEndlock);
    };
    const drawWindEndlocks = (lathY, lathH, leftOffset = 0) => {
        const endlockHeight = lathH * 0.8; const endlockWidth = endlockHeight * 2.5; const endlockY = lathY + (lathH - endlockHeight) / 2;
        const leftEndlock = document.createElementNS(svgNS, 'rect'); leftEndlock.setAttribute('x', lathStartX + leftOffset - scaledWindOffset); leftEndlock.setAttribute('y', endlockY); leftEndlock.setAttribute('width', endlockWidth); leftEndlock.setAttribute('height', endlockHeight); leftEndlock.setAttribute('class', 'wind-endlock-graphic'); svg.appendChild(leftEndlock);
        const rightEndlock = document.createElementNS(svgNS, 'rect'); const curtainRightEdge = lathStartX + scaledShutterWidth; rightEndlock.setAttribute('x', curtainRightEdge + scaledWindOffset - endlockWidth); rightEndlock.setAttribute('y', endlockY); rightEndlock.setAttribute('width', endlockWidth); rightEndlock.setAttribute('height', endlockHeight); rightEndlock.setAttribute('class', 'wind-endlock-graphic'); svg.appendChild(rightEndlock);
    };
    let lathVisualCounter = 1; const isWindLath = (lath['Name'] || '').toLowerCase().includes('wind');
    const wicketRealHeight = wicket ? (parseFloat(wicket.Height) || 0) : 0; const scaledWicketHeight = wicketRealHeight * scale;
    const wicketGap = 10; const scaledWicketGap = wicketGap * scale; const wicketTopY = bottomLathTopY - scaledWicketGap - scaledWicketHeight; const scaledWicketWidth = wicket ? (parseFloat(wicket.Width) || 0) * scale : 0;
    if (visionOptions && visionOptions.visionLath) {
            const vo = visionOptions; const visionLathCompHeight = parseFloat(vo.visionLath['Compressed lath height']); const scaledMainLathHeight = mainLathHeight * scale; const scaledVisionLathHeight = visionLathCompHeight * scale;
        let sectionBottomY = currentY;
        for (let i = 0; i < vo.numLathsBelow; i++) {
            currentY -= scaledMainLathHeight; const lathRect = document.createElementNS(svgNS, 'rect'); lathRect.setAttribute('x', lathStartX); lathRect.setAttribute('y', currentY); lathRect.setAttribute('width', scaledShutterWidth); lathRect.setAttribute('height', scaledMainLathHeight); lathRect.setAttribute('class', 'shutter-lath-graphic'); svg.appendChild(lathRect);
            if (isWindLath) {
                if (lathVisualCounter % 2 !== 0) drawEndlocks(currentY, scaledMainLathHeight);
                const isWindPos = (lathVisualCounter === 2 || lathVisualCounter === 4 || lathVisualCounter === 6 || lathVisualCounter === 8) || (lathVisualCounter > 8 && lathVisualCounter % 8 === 0);
                if (isWindPos) drawWindEndlocks(currentY, scaledMainLathHeight);
            } else if (endlocksSelected && lathVisualCounter % 2 !== 0) { drawEndlocks(currentY, scaledMainLathHeight); }
            lathVisualCounter++;
        }
        if (vo.numLathsBelow > 0) drawAnnotation(currentY, sectionBottomY, `${lath['Name']} (x${vo.numLathsBelow})`);
        sectionBottomY = currentY;
        for (let i = 0; i < vo.numLathsVision; i++) {
            currentY -= scaledVisionLathHeight; const lathRect = document.createElementNS(svgNS, 'rect'); lathRect.setAttribute('x', lathStartX); lathRect.setAttribute('y', currentY); lathRect.setAttribute('width', scaledShutterWidth); lathRect.setAttribute('height', scaledVisionLathHeight); lathRect.setAttribute('class', 'shutter-vision-lath-graphic'); svg.appendChild(lathRect);
            if (isWindLath) {
                if (lathVisualCounter % 2 !== 0) drawEndlocks(currentY, scaledVisionLathHeight);
                const isWindPos = (lathVisualCounter === 2 || lathVisualCounter === 4 || lathVisualCounter === 6 || lathVisualCounter === 8) || (lathVisualCounter > 8 && lathVisualCounter % 8 === 0);
                if (isWindPos) drawWindEndlocks(currentY, scaledVisionLathHeight);
            } else if (endlocksSelected && lathVisualCounter % 2 !== 0) { drawEndlocks(currentY, scaledVisionLathHeight); }
            lathVisualCounter++;
        }
        if (vo.numLathsVision > 0) drawAnnotation(currentY, sectionBottomY, `${vo.visionLath['Name']} (x${vo.numLathsVision})`);
        sectionBottomY = currentY;
        for (let i = 0; i < vo.numLathsAbove; i++) {
            currentY -= scaledMainLathHeight; const lathRect = document.createElementNS(svgNS, 'rect'); lathRect.setAttribute('x', lathStartX); lathRect.setAttribute('y', currentY); lathRect.setAttribute('width', scaledShutterWidth); lathRect.setAttribute('height', scaledMainLathHeight); lathRect.setAttribute('class', 'shutter-lath-graphic'); svg.appendChild(lathRect);
            if (isWindLath) {
                if (lathVisualCounter % 2 !== 0) drawEndlocks(currentY, scaledMainLathHeight);
                const isWindPos = (lathVisualCounter === 2 || lathVisualCounter === 4 || lathVisualCounter === 6 || lathVisualCounter === 8) || (lathVisualCounter > 8 && lathVisualCounter % 8 === 0);
                if (isWindPos) drawWindEndlocks(currentY, scaledMainLathHeight);
            } else if (endlocksSelected && lathVisualCounter % 2 !== 0) { drawEndlocks(currentY, scaledMainLathHeight); }
            lathVisualCounter++;
        }
        if (vo.numLathsAbove > 0) drawAnnotation(currentY, sectionBottomY, `${lath['Name']} (x${vo.numLathsAbove})`);
    } else if (numLaths > 0) {
            const scaledLathHeight = mainLathHeight * scale;
            for (let i = 0; i < numLaths; i++) {
            currentY -= scaledLathHeight; const lathNumber = i + 1; const lathBottomEdgeY = currentY + scaledLathHeight;
            const lathRect = document.createElementNS(svgNS, 'rect'); lathRect.setAttribute('x', lathStartX); lathRect.setAttribute('y', currentY); lathRect.setAttribute('width', scaledShutterWidth); lathRect.setAttribute('height', scaledLathHeight); lathRect.setAttribute('class', 'shutter-lath-graphic'); svg.appendChild(lathRect);
            const leftOffset = (wicket && lathBottomEdgeY > wicketTopY) ? scaledWicketWidth : 0;
            if (isWindLath) {
                if (lathNumber % 2 !== 0) { drawEndlocks(currentY, scaledLathHeight, leftOffset); }
                const isWindLathPosition = (lathNumber === 2 || lathNumber === 4 || lathNumber === 6 || lathNumber === 8) || (lathNumber > 8 && lathNumber % 8 === 0);
                if (isWindLathPosition) { drawWindEndlocks(currentY, scaledLathHeight, leftOffset); }
            } else if (endlocksSelected && lathNumber % 2 !== 0) { drawEndlocks(currentY, scaledLathHeight, leftOffset); }
        }
        drawAnnotation(currentY, bottomLathTopY, `${lath['Name']} (x${numLaths})`);
    }
    if (selectedEndplate) {
        const endplateSize = parseFloat(selectedEndplate.Size) || 0;
        if (endplateSize > 0) {
            const scaledEndplateHeight = endplateSize * scale;
            const endplateBox = document.createElementNS(svgNS, 'rect'); endplateBox.setAttribute('x', startX); endplateBox.setAttribute('y', endplateTopY); endplateBox.setAttribute('width', scaledTotalAxleWidth); endplateBox.setAttribute('height', scaledEndplateHeight); endplateBox.setAttribute('class', 'endplate-box-graphic'); svg.appendChild(endplateBox);
        }
    }
    const axleRect = document.createElementNS(svgNS, 'rect'); axleRect.setAttribute('x', startX); axleRect.setAttribute('y', axleY); axleRect.setAttribute('width', scaledTotalAxleWidth); axleRect.setAttribute('height', scaledAxleHeight); axleRect.setAttribute('class', 'shutter-axle-graphic'); svg.appendChild(axleRect);
    const centerline = document.createElementNS(svgNS, 'line'); centerline.setAttribute('x1', startX); centerline.setAttribute('y1', axleCenterlineY); centerline.setAttribute('x2', startX + scaledTotalAxleWidth); centerline.setAttribute('y2', axleCenterlineY); centerline.setAttribute('class', 'axle-centerline-graphic'); svg.appendChild(centerline);
    if (wicket) {
        const wicketRect = document.createElementNS(svgNS, 'rect'); wicketRect.setAttribute('x', lathStartX); wicketRect.setAttribute('y', wicketTopY); wicketRect.setAttribute('width', scaledWicketWidth); wicketRect.setAttribute('height', scaledWicketHeight); wicketRect.setAttribute('class', 'wicket-door-graphic'); svg.appendChild(wicketRect);
    }
    const totalWidthDimY = basePadding.top;
    drawDimensionLine(startX, totalWidthDimY, startX + scaledTotalAxleWidth, totalWidthDimY, `${totalRealAxleWidth.toFixed(0)} mm Axle Width`, 'horizontal');
    createLeaderLine(startX, totalWidthDimY, startX, axleY); createLeaderLine(startX + scaledTotalAxleWidth, totalWidthDimY, startX + scaledTotalAxleWidth, axleY);
    const widthDimLineY = bottomY + 15;
    drawDimensionLine(lathStartX, widthDimLineY, lathStartX + scaledShutterWidth, widthDimLineY, `${realWidth.toFixed(0)} mm Cut Curtain Width`, 'horizontal');
    createLeaderLine(lathStartX, widthDimLineY, lathStartX, bottomY); createLeaderLine(lathStartX + scaledShutterWidth, widthDimLineY, lathStartX + scaledShutterWidth, bottomY);
    const maxOffset = Math.max(endlockOffsets.cast, endlockOffsets.wind);
    if (maxOffset > 0) {
        const scaledMaxOffset = maxOffset * scale; const endlockWidthDimY = bottomY + 28; const overallWidth = realWidth + (2 * maxOffset); const overallStartX = lathStartX - scaledMaxOffset; const overallEndX = lathStartX + scaledShutterWidth + scaledMaxOffset;
        drawDimensionLine(overallStartX, endlockWidthDimY, overallEndX, endlockWidthDimY, `${overallWidth.toFixed(0)} mm Overall Endlock Width`, 'horizontal');
        createLeaderLine(overallStartX, endlockWidthDimY, overallStartX, bottomY - (scaledBottomLathHeight/2)); createLeaderLine(overallEndX, endlockWidthDimY, overallEndX, bottomY - (scaledBottomLathHeight/2));
    }
    const rightDimX_Inner = startX + scaledTotalAxleWidth + 40; const rightDimX_Outer = rightDimX_Inner - 15;
    if (selectedEndplate) {
        const endplateSize = parseFloat(selectedEndplate.Size) || 0;
        if(endplateSize > 0) {
            const endplateBottomY = endplateTopY + (endplateSize * scale); const heightToUnderside = parseFloat(dom.height.value) - (endplateSize / 2);
            drawDimensionLine(rightDimX_Inner, endplateBottomY, rightDimX_Inner, bottomY, `${heightToUnderside.toFixed(0)} mm to underside of box`, 'vertical', 'left');
            createLeaderLine(rightDimX_Inner, endplateBottomY, startX + scaledTotalAxleWidth, endplateBottomY); createLeaderLine(rightDimX_Inner, bottomY, startX + scaledTotalAxleWidth, bottomY);
        }
    }
    drawDimensionLine(rightDimX_Outer, axleCenterlineY, rightDimX_Outer, bottomY, `${parseFloat(dom.height.value).toFixed(0)} mm to Centre of Axle`, 'vertical', 'left');
    createLeaderLine(rightDimX_Outer, axleCenterlineY, startX + scaledTotalAxleWidth, axleCenterlineY); createLeaderLine(rightDimX_Outer, bottomY, startX + scaledTotalAxleWidth, bottomY);
    const leftDimX_Inner = basePadding.left - 15; const leftDimX_Outer = basePadding.left - 55;
    if (selectedEndplate) {
            const endplateSize = parseFloat(selectedEndplate.Size) || 0;
            if (endplateSize > 0) {
            const scaledEndplateHeight = endplateSize * scale; const endplateBottomY = endplateTopY + scaledEndplateHeight;
            drawDimensionLine(leftDimX_Inner, endplateTopY, leftDimX_Inner, endplateBottomY, `${endplateSize.toFixed(0)} mm Endplate`, 'vertical', 'left');
            createLeaderLine(leftDimX_Inner, endplateTopY, startX, endplateTopY); createLeaderLine(leftDimX_Inner, endplateBottomY, startX, endplateBottomY);
            }
    }
    if (bottomLathHeight > 0) {
        drawDimensionLine(leftDimX_Outer, bottomLathTopY, leftDimX_Outer, bottomY, `${bottomLathHeight.toFixed(0)} mm`, 'vertical', 'left');
        createLeaderLine(leftDimX_Outer, bottomLathTopY, lathStartX, bottomLathTopY); createLeaderLine(leftDimX_Outer, bottomY, lathStartX, bottomY);
    }
    return svg;
}

function switchTab(targetTabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(targetTabId).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${targetTabId}"]`).classList.add('active');
    
    if (targetTabId === 'axle-content') {
        const length = parseFloat(dom['total-axle-length'].textContent) || 0;
        const deflection = parseFloat(dom['axle-deflection'].textContent) || 0;
        drawDeflectionGraphic(length, deflection);
        const selectedAxleIndex = dom.axleType.value;
        if(selectedAxleIndex !== "" && axleData[selectedAxleIndex]) {
            const collarSize = parseFloat(dom.collarSize.value) || 0;
            drawAxleCrossSection(axleData[selectedAxleIndex], collarSize);
        } else { drawAxleCrossSection(null); }
    } else if (targetTabId === 'motor-content') { drawTorqueGraph(lastTorqueProfile, dom['torque-graph-container']);
    } else if(targetTabId === 'wicket-content') {
            const curtainWidth = parseFloat(dom['calculated-curtain-width'].textContent) || 0; updateWicketCalculationsAndGraphic({cast:0, wind:0}, curtainWidth);
    } else if (targetTabId === 'endplate-content') {
        const selectedIndex = parseInt(dom.endplateSelector.value, 10);
        const selectedLath = lathData.length > 0 ? lathData[dom.lathType.value] : null;
        const selectedAxle = axleData.length > 0 ? axleData[dom.axleType.value] : null;
        const numLaths = parseInt(dom['lath-count'].textContent) || 0;
        if (!isNaN(selectedIndex) && currentFilteredEndplates[selectedIndex]) {
            const plate = currentFilteredEndplates[selectedIndex]; drawEndplateGraphic(plate, maxCoilDiameter, selectedAxle, selectedLath, numLaths); calculateEndplateForces(plate);
        } else { drawEndplateGraphic(null, 0, null, null, 0); calculateEndplateForces(null); }
    } else if (targetTabId === 'chain-content') {
        updateChainCalculations();
    } else if (targetTabId === 'safety-brake-content') {
        calculateSafetyBrakeSelection();
    }
};

function setupReportFilters() {
    const lathSelect = document.getElementById('reportLathType');
    populateDropdown(lathSelect, lathData, 'Name');

    const lathSelect2 = document.getElementById('reportLathType2');
    lathSelect2.innerHTML = `<option value="">-- None (Use Primary) --</option>`;
    lathData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.Name;
        lathSelect2.appendChild(option);
    });

    const endlockSelect = document.getElementById('reportEndlockType');
    populateDropdown(endlockSelect, endlockData, 'Description');
    const bottomLathSelect = document.getElementById('reportBottomLathType');
    populateDropdown(bottomLathSelect, bottomLathData, 'Bottom lath name');
    let manufacturerKey = '', voltageKey = '', mountingKey = '', usageKey = '';
    if (motorData.length > 0) {
        const firstMotor = motorData[0];
        manufacturerKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'manufacturer');
        voltageKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'voltage');
        mountingKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'mounting type');
        usageKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'usage type');
    }
    const setupFilterGroup = (containerId, key, data, className) => {
        const container = document.getElementById(containerId); container.innerHTML = '';
        if (key) {
            const uniqueValues = [...new Set(data.map(item => item[key]).filter(val => val))];
            uniqueValues.sort().forEach(value => {
                const controlItem = document.createElement('div'); controlItem.className = 'admin-control-item';
                controlItem.innerHTML = `<label><input type="checkbox" class="${className}" value="${value}" checked> ${value}</label>`;
                container.appendChild(controlItem);
            });
        } else { container.innerHTML = `<p><em>Column not found in data.</em></p>`; }
    };
    setupFilterGroup('report-motor-filter-container', manufacturerKey, motorData, 'report-motor-checkbox');
    setupFilterGroup('report-motor-voltage-filter-container', voltageKey, motorData, 'report-voltage-checkbox');
    setupFilterGroup('report-motor-mounting-filter-container', mountingKey, motorData, 'report-mounting-checkbox');
    setupFilterGroup('report-motor-usage-filter-container', usageKey, motorData, 'report-usage-checkbox');

    document.getElementById('reportMotorSelectAll').addEventListener('click', () => document.querySelectorAll('.report-motor-checkbox').forEach(cb => cb.checked = true));
    document.getElementById('reportMotorDeselectAll').addEventListener('click', () => document.querySelectorAll('.report-motor-checkbox').forEach(cb => cb.checked = false));
    document.getElementById('reportVoltageSelectAll').addEventListener('click', () => document.querySelectorAll('.report-voltage-checkbox').forEach(cb => cb.checked = true));
    document.getElementById('reportVoltageDeselectAll').addEventListener('click', () => document.querySelectorAll('.report-voltage-checkbox').forEach(cb => cb.checked = false));
    document.getElementById('reportMountingSelectAll').addEventListener('click', () => document.querySelectorAll('.report-mounting-checkbox').forEach(cb => cb.checked = true));
    document.getElementById('reportMountingDeselectAll').addEventListener('click', () => document.querySelectorAll('.report-mounting-checkbox').forEach(cb => cb.checked = false));
    document.getElementById('reportUsageSelectAll').addEventListener('click', () => document.querySelectorAll('.report-usage-checkbox').forEach(cb => cb.checked = true));
    document.getElementById('reportUsageDeselectAll').addEventListener('click', () => document.querySelectorAll('.report-usage-checkbox').forEach(cb => cb.checked = false));
    
    const genBtn = document.getElementById('generateCsvButton');
    const newBtn = genBtn.cloneNode(true);
    genBtn.parentNode.replaceChild(newBtn, genBtn);
    newBtn.addEventListener('click', generateCsvReport);
}

function calculateCurtainPropertiesHeadless(lath, bottomLath, endlock, width_mm, height_mm) {
    if (!lath || !bottomLath || height_mm <= 0) { return { totalWeight: 0, torqueWeight: 0, travelHeight: 0 }; }
    const axleRadius = 60; 
    const lathCompressedHeight = parseFloat(lath['Compressed lath height']);
    const bottomLathHeight = parseFloat(bottomLath['BLath height']) || 0;
    const heightToCoverByLaths = (height_mm - bottomLathHeight) + axleRadius;
    let numLaths = (lathCompressedHeight > 0 && heightToCoverByLaths > 0) ? Math.ceil(heightToCoverByLaths / lathCompressedHeight) + 2 : 0;
    const widthM = width_mm / 1000;
    let kgsPerM2 = parseFloat(lath['Kgs/ m2']) || 0;
    const lathWeightBasedOnCoverage = widthM * (numLaths * lathCompressedHeight / 1000) * kgsPerM2;
    const bottomLathWeight = widthM * (parseFloat(bottomLath['BLath weight / m length']) || 0);
    let totalEndlockWeight = 0;
    let bufferEndlockWeight = 0; 
    const lathName = (lath['Name'] || '').toLowerCase();
    const isWindLath = lathName.includes('wind');
    if (isWindLath) {
        const castEndlockObj = endlockData.find(el => (el['Description'] || '').toLowerCase().includes('75mm cast'));
        let castWeightG = 0;
        if (castEndlockObj) {
            const wKey = Object.keys(castEndlockObj).find(k => k.toLowerCase().trim() === 'weight in grams');
            castWeightG = wKey ? parseFloat(castEndlockObj[wKey]) : 0;
        }
        const windEndlockObj = endlockData.find(el => (el['Description'] || '').toLowerCase().includes('75mm wind'));
        let windWeightG = 0;
        if (windEndlockObj) {
            const wKey = Object.keys(windEndlockObj).find(k => k.toLowerCase().trim() === 'weight in grams');
            windWeightG = wKey ? parseFloat(windEndlockObj[wKey]) : 0;
        }
        for (let i = 1; i <= numLaths; i++) {
            if (i % 2 !== 0 && castWeightG > 0) { totalEndlockWeight += 2 * (castWeightG / 1000); }
            const isWindLathPosition = (i === 2 || i === 4 || i === 6 || i === 8) || (i > 8 && i % 8 === 0);
            if (isWindLathPosition && windWeightG > 0) { totalEndlockWeight += 2 * (windWeightG / 1000); }
        }
        if (castWeightG > 0) { bufferEndlockWeight = 4 * (castWeightG / 1000); }
    } else {
        let endlockWeightG = 0;
        if (endlock) {
            const weightKey = Object.keys(endlock).find(k => k.toLowerCase().trim() === 'weight in grams');
            endlockWeightG = weightKey ? parseFloat(endlock[weightKey]) : 0;
            if (endlockWeightG > 0 && numLaths > 0) {
                const numEndlockPairs = Math.ceil(numLaths / 2); 
                totalEndlockWeight = numEndlockPairs * 2 * (endlockWeightG / 1000);
            }
        }
        if (endlockWeightG > 0) { bufferEndlockWeight = 4 * (endlockWeightG / 1000); }
    }
    const totalWeight = lathWeightBasedOnCoverage + bottomLathWeight + totalEndlockWeight;
    let torqueWeight = totalWeight;
    if (numLaths >= 3) {
        const bufferLathWeight = 3 * (lathCompressedHeight / 1000) * widthM * kgsPerM2;
        torqueWeight = totalWeight - bufferLathWeight - bufferEndlockWeight;
    }
    const travelHeight = height_mm - bottomLathHeight;
    return { totalWeight, torqueWeight, travelHeight };
}

function findBestAxleHeadless(totalWeightKgs, totalLength, lath, width_mm) {
        if (totalLength <= 0 || axleData.length === 0) { return { name: 'null', deflection: 0, axleObj: null }; }
    const axlesForShape = axleData.filter(axle => (axle.Shape || 'circular').toLowerCase().trim() === 'circular');
    if (axlesForShape.length === 0) return { name: 'null', deflection: 0, axleObj: null };
    let bestAxle = null;
    let bestDeflection = 0;
    let requiredRatio = 400;
    if (width_mm > 10000) requiredRatio = 800;
    else if (width_mm > 8000) requiredRatio = 600;
    for (const axle of axlesForShape) {
        const perf = performDeflectionCalc(totalWeightKgs, axle, totalLength, width_mm);
        if (perf.ratio >= requiredRatio && perf.deflection <= 17) { 
            bestAxle = axle; 
            bestDeflection = perf.deflection;
            break; 
        }
    }
    if (bestAxle) { 
        return { name: bestAxle.Name, deflection: bestDeflection, axleObj: bestAxle }; 
    } else { 
        let bestFailAxle = axlesForShape[0];
        let minDeflection = Infinity;
        axlesForShape.forEach(axle => {
                const perf = performDeflectionCalc(totalWeightKgs, axle, totalLength, width_mm);
                if(perf.deflection < minDeflection) {
                    minDeflection = perf.deflection;
                    bestFailAxle = axle;
                }
        });
        return { name: bestFailAxle.Name, deflection: minDeflection, axleObj: bestFailAxle }; 
    }
}

function calculateTorqueHeadless(torqueWeight, lath, travelHeight, axle, width_mm, bottomLath, baseline_friction, matchAxleDia, overrideCollarDia, height_mm, motorObj) {
    if (!lath || !axle || !bottomLath || travelHeight <= 0 || torqueWeight <= 0) return 0;
    const lathThickness = parseFloat(lath['Thickness']) || 0;
    let effectiveStartDiameter = getEffectiveCoilDiameter(axle);
    if (matchAxleDia > 0 && overrideCollarDia > 0) {
        const currentAxleDia = parseFloat(axle['Diameter']) || 0;
        if (Math.abs(currentAxleDia - matchAxleDia) < 2.0) {
            effectiveStartDiameter = Math.max(effectiveStartDiameter, overrideCollarDia);
        }
    }
    const bottomLathWeightActual = (width_mm / 1000) * (parseFloat(bottomLath['BLath weight / m length']) || 0);
    const lathsWeight = torqueWeight - bottomLathWeightActual;
    let heightLifted = 0;
    let currentRollDiameter = effectiveStartDiameter;
    let maxTorqueFound = 0;
    while (heightLifted < travelHeight) {
        const force = ( (lathsWeight * (1 - heightLifted/travelHeight)) + bottomLathWeightActual) * 9.81;
        const radiusM = ((currentRollDiameter + lathThickness) / 2) / 1000
        maxTorqueFound = Math.max(maxTorqueFound, force * radiusM);
        heightLifted += (Math.PI * currentRollDiameter) / 2; 
        currentRollDiameter += lathThickness;
    }
    let totalFriction = baseline_friction;
    if (height_mm >= 7000) totalFriction += 5;
    if (motorObj) {
        const usageKey = Object.keys(motorObj).find(k => k.toLowerCase().trim() === 'usage type');
        const usage = usageKey ? (motorObj[usageKey] || '').toLowerCase() : '';
        if (usage.includes('high') || usage.includes('hi ') || usage.includes('speed')) {
            totalFriction += 5;
        }
    }
    return maxTorqueFound * (1 + totalFriction / 100);
}

async function generateCsvReport() {
    const statusDiv = document.getElementById('csv-generation-status');
    statusDiv.textContent = 'Starting report generation...'; statusDiv.style.color = 'blue';
    await new Promise(resolve => setTimeout(resolve, 50));
    const minWidth = parseInt(document.getElementById('reportMinWidth').value);
    const maxWidth = parseInt(document.getElementById('reportMaxWidth').value);
    const minHeight = parseInt(document.getElementById('reportMinHeight').value);
    const maxHeight = parseInt(document.getElementById('reportMaxHeight').value);
    const interval = parseInt(document.getElementById('reportInterval').value);
    const reportAxleMatch = parseFloat(document.getElementById('reportAxleMatch').value) || 0;
    const reportCollarOverride = parseFloat(document.getElementById('reportCollarOverride').value) || 0;
    const lathIndex1 = document.getElementById('reportLathType').value;
    const lathIndex2 = document.getElementById('reportLathType2').value;
    const switchLimit = document.getElementById('reportLathLimit').value ? parseInt(document.getElementById('reportLathLimit').value) : Infinity; 
    const endlockIndex = document.getElementById('reportEndlockType').value;
    const bottomLathIndex = document.getElementById('reportBottomLathType').value;
    if (lathIndex1 === "" || endlockIndex === "" || bottomLathIndex === "") {
        statusDiv.textContent = 'Error: Missing selections.'; statusDiv.style.color = 'red'; return;
    }
    const primaryLath = lathData[lathIndex1];
    const secondaryLath = (lathIndex2 !== "") ? lathData[lathIndex2] : primaryLath; 
    const selectedEndlock = endlockData[endlockIndex];
    const selectedBottomLath = bottomLathData[bottomLathIndex];
    const getSelectedValues = (className) => Array.from(document.querySelectorAll(`.${className}:checked`)).map(cb => cb.value);
    const selectedManufacturers = getSelectedValues('report-motor-checkbox');
    const selectedVoltages = getSelectedValues('report-voltage-checkbox');
    const selectedMountings = getSelectedValues('report-mounting-checkbox');
    const selectedUsageTypes = getSelectedValues('report-usage-checkbox');
    let manufacturerKey = '', voltageKey = '', mountingKey = '', usageKey = '';
    if (motorData.length > 0) {
        const firstMotor = motorData[0];
        manufacturerKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'manufacturer');
        voltageKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'voltage');
        mountingKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'mounting type');
        usageKey = Object.keys(firstMotor).find(k => k.toLowerCase().trim() === 'usage type');
    }
    const calculationCache = {};
    const defaultAdditionalLength = 20; 
    let calculationCount = 0;
    for (let width = minWidth; width <= maxWidth; width += interval) {
        calculationCache[width] = {};
        const currentLath = (width > switchLimit) ? secondaryLath : primaryLath;
        for (let height = minHeight; height <= maxHeight; height += interval) {
            calculationCount++;
            const props = calculateCurtainPropertiesHeadless(currentLath, selectedBottomLath, selectedEndlock, width, height);
            const axleResult = findBestAxleHeadless(props.totalWeight, width + defaultAdditionalLength, currentLath, width);
            const defaultFriction = parseFloat(currentLath['Friction %']) || 10;
            const result = {
                'Lath Type Used': currentLath.Name, 
                'Total Weight (kg)': props.totalWeight.toFixed(2),
                'Required Axle Name': axleResult.name,'Axle Deflection (mm)': axleResult.deflection.toFixed(2)
            };

            for (const usage of selectedUsageTypes) {
                for (const man of selectedManufacturers) {
                    for (const vol of selectedVoltages) {
                        for (const mou of selectedMountings) {
                            const scenarioName = `${usage} - ${man} (${vol}, ${mou})`;
                            
                            // Find sample motor to determine if High Speed friction logic applies
                            const sampleMotor = motorData.find(m => {
                                const motorVoltages = String(m[voltageKey] || '').split('/').map(v => v.trim());
                                const volMatch = motorVoltages.includes(String(vol));
                                return m[usageKey] == usage && 
                                        m[manufacturerKey] == man && 
                                        volMatch && 
                                        m[mountingKey] == mou;
                            });
                            
                            const reqTorque = calculateTorqueHeadless(props.torqueWeight, currentLath, props.travelHeight, axleResult.axleObj, width, selectedBottomLath, defaultFriction, reportAxleMatch, reportCollarOverride, height, sampleMotor);

                            const suitableMotors = motorData.filter(m => {
                                const motorVoltages = String(m[voltageKey] || '').split('/').map(v => v.trim());
                                const volMatch = motorVoltages.includes(String(vol));

                                return m[usageKey] == usage && 
                                        m[manufacturerKey] == man && 
                                        volMatch && 
                                        m[mountingKey] == mou && 
                                        reqTorque > 0 && 
                                        reqTorque >= parseFloat(m['Torque (Nm) min']) && 
                                        reqTorque <= parseFloat(m['Torque (Nm) max']);
                            }).sort((a,b) => parseFloat(a['Torque (Nm) max']) - parseFloat(b['Torque (Nm) max']));
                            
                            result[`Motor: ${scenarioName}`] = suitableMotors.length > 0 ? suitableMotors[0].Name : 'null';
                        }
                    }
                }
            }
            calculationCache[width][height] = result;
        }
    }

    // 4. Assemble CSV Tables
    const csvData = [];
    const widthHeaders = ['Height \\ Width'];
    for (let w = minWidth; w <= maxWidth; w += interval) { widthHeaders.push(w); }
    
    const tableTypes = Object.keys(calculationCache[minWidth][minHeight]);
    
    for (const tableType of tableTypes) {
        csvData.push([`Data: ${tableType}`]);
        csvData.push(widthHeaders);
        for (let height = minHeight; height <= maxHeight; height += interval) {
            const row = [height];
            for (let width = minWidth; width <= maxWidth; width += interval) {
                row.push(calculationCache[width]?.[height]?.[tableType] || 'N/A');
            }
            csvData.push(row);
        }
        csvData.push([]); // Spacer row
    }

    downloadCsv(csvData);
    statusDiv.textContent = 'Report generated and downloaded.'; 
    statusDiv.style.color = 'green';
}

function downloadCsv(data) {
    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(rowArray) {
        let row = rowArray.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",");
        csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shutter_report.csv");
    document.body.appendChild(link);
    link.click();
}

