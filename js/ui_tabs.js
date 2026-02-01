function switchTab(targetTabId) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tabButtons.forEach(b => b.classList.remove('active'));
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
    }

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
                inputContainer.appendChild(controlItem);
                 controlItem.querySelector('input').addEventListener('change', (e) => {
                    inputGroup.style.display = e.target.checked ? '' : 'none';
                });
            });

            const setupBulkActions = (selectAllId, deselectAllId, containerId) => {
                document.getElementById(selectAllId).addEventListener('click', () => {
                    document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
                        if (!cb.checked) {
                            cb.checked = true;
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                });
                document.getElementById(deselectAllId).addEventListener('click', () => {
                    document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
                        if (cb.checked) {
                            cb.checked = false;
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                });
            };

            setupBulkActions('tabsSelectAll', 'tabsDeselectAll', 'tab-controls-container');
            setupBulkActions('inputsSelectAll', 'inputsDeselectAll', 'input-controls-container');
            updatePrintStyles();
        }