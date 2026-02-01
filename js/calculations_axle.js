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