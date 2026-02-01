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
        }

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