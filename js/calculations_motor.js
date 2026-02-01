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
        }