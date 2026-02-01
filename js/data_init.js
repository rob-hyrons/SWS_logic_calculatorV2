let lathData = [], axleData = [], motorData = [], bottomLathData = [], safetyBrakeData = [], endplateData = [], wicketData = [], endlockData = [], guideData = [], chainDriveData = [];
        let lathImageMap = new Map();
        let safetyBrakeImageMap = new Map();
        let motorImageMap = new Map();
        let currentFilteredMotors = [], currentFilteredEndplates = [];
        let calculatedRotations = 0, maxCoilDiameter = 0;
        let lastTorqueProfile = [];
        let userSelectedAxleIndex = null;
        let visionCalcs = null; 
        
        const dom = {};
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
         'motor-image-container', 'motorImageDisplay', 'motor-limit-turns', 'motor-limit-warning'
        ].forEach(id => dom[id] = document.getElementById(id));
        
        const tabButtons = document.querySelectorAll('.tab-button');
        
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

        dom.addVision.addEventListener('change', () => {
            dom['vision-slat-options'].style.display = dom.addVision.checked ? 'block' : 'none';
            updateAllCalculations();
        });

        ['shapeCircular', 'shapeOctagonal'].forEach(id => {
            if (dom[id]) dom[id].addEventListener('change', handleShapeChange);
        });

        dom.motorSelector.addEventListener('change', updateSelectedMotorInfo);
        dom.endplateSelector.addEventListener('change', updateSelectedEndplateInfo);
        tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
        dom.safetyBrakeSelector.addEventListener('input', updateSelectedSafetyBrakeInfo);
        dom.axleType.addEventListener('input', handleAxleOverride);
        dom.wicketDoorSelector.addEventListener('input', updateSelectedWicketInfo);
        dom.printButton.addEventListener('click', () => {
            window.print();
        });
        dom.importCsvButton.addEventListener('click', handleCsvImport);

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

const dom = {};