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

function updateSelectedSafetyBrakeInfo() {
            calculateSafetyBrakeSelection();
            updateSelectedMotorInfo();
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