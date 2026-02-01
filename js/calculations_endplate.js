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

            const suitableBrakes = safetyBrakeData.filter(brake => {
                const opTorqueKey = Object.keys(brake).find(k => k.toLowerCase().includes('operating torque'));
                const opTorque = parseFloat(brake[opTorqueKey]) || 0;
                return opTorque >= motorMaxTorque;
            }).sort((a,b) => {
                const opTorqueKey = Object.keys(a).find(k => k.toLowerCase().includes('operating torque'));
                return (parseFloat(a[opTorqueKey]) || 0) - (parseFloat(b[opTorqueKey]) || 0);
            });

            const select = dom.safetyBrakeSelector;
            select.innerHTML = '';
            
            if (suitableBrakes.length === 0) {
                const option = document.createElement('option');
                option.textContent = "-- No Suitable Safety Brake Found --";
                select.appendChild(option);
                dom['safety-brake-name'].textContent = 'NO SUITABLE BRAKE FOUND';
                dom['safety-brake-name'].classList.add('warning-text');
            } else {
                suitableBrakes.forEach((brake, idx) => {
                    const option = document.createElement('option');
                    const opTorqueKey = Object.keys(brake).find(k => k.toLowerCase().includes('operating torque'));
                    const opTorque = parseFloat(brake[opTorqueKey]) || 0;
                    option.value = idx;
                    option.textContent = `${brake.Name} (Op Torque: ${opTorque} Nm)`;
                    select.appendChild(option);
                });
                
                const selectedBrake = suitableBrakes[0];
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
        }