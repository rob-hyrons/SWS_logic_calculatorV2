/**
 * Calculators Module
 * Contains all mathematical logic for shutter engineering.
 */

const G = 9.81; // Gravity constant

/**
 * Calculates Curtain, Clear Opening, and Overall widths based on Guide data
 */
export function calculateWidths(inputWidth, widthType, selectedGuide) {
    let curtainWidth = 0, clearOpening = 0, overallWidth = 0;

    if (selectedGuide) {
        const penetrationKey = Object.keys(selectedGuide).find(k => k.toLowerCase().trim() === 'penetration');
        const widthKey = Object.keys(selectedGuide).find(k => k.toLowerCase().trim() === 'width');
        const guidePenetration = parseFloat(selectedGuide[penetrationKey]) || 0;
        const guideWidth = parseFloat(selectedGuide[widthKey]) || 0;

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
        curtainWidth = clearOpening = overallWidth = inputWidth;
    }

    return { curtainWidth, clearOpening, overallWidth };
}

/**
 * Calculates the total number of revolutions needed to open the shutter
 */
export function calculateTotalRevolutions(travelHeight, initialDiameter, lathThickness) {
    if (travelHeight <= 0 || initialDiameter <= 0 || lathThickness <= 0) return 0;
    const a = Math.PI * lathThickness;
    const b = Math.PI * initialDiameter;
    const c = -travelHeight;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    return (-b + Math.sqrt(discriminant)) / (2 * a);
}

/**
 * Calculates weights, areas, and counts for a standard curtain
 */
export function calculateCurtainProperties(params) {
    const { lath, bottomLath, height, curtainWidth, powderCoated, endlockData, selectedEndlockIndex } = params;
    
    const lathCompH = parseFloat(lath['Compressed lath height']);
    const lathUncompH = parseFloat(lath['uncompressed lath height']);
    const bottomH = parseFloat(bottomLath['BLath height']) || 0;
    const widthM = curtainWidth / 1000;
    
    // Calculate counts (Radius approx is 60 if axle not provided yet)
    const heightToCover = (height - bottomH) + 60; 
    let numLaths = (lathCompH > 0) ? Math.ceil(heightToCover / lathCompH) + 2 : 0;
    const numLathsToLift = Math.max(0, numLaths - 3);

    // Weights
    let kgsM2 = parseFloat(lath['Kgs/ m2']) || 0;
    if (powderCoated) kgsM2 += 0.5;

    const curtainWeight = widthM * (numLaths * lathCompH / 1000) * kgsM2;
    const bottomWeight = widthM * (parseFloat(bottomLath['BLath weight / m length']) || 0);
    
    // Endlock Logic
    let totalEndlockWeight = 0;
    if (numLaths > 0 && endlockData[selectedEndlockIndex]) {
        const weightG = parseFloat(endlockData[selectedEndlockIndex]['Weight in grams']) || 0;
        totalEndlockWeight = (Math.ceil(numLaths / 2) * 2 * weightG) / 1000;
    }

    const totalWeight = curtainWeight + bottomWeight + totalEndlockWeight;

    return {
        numLaths,
        numLathsToLift,
        totalWeight,
        torqueWeight: totalWeight * 0.9, // Simplified torque weight for this module
        fullCurtainLength: (numLaths * lathUncompH) + bottomH,
        totalArea: widthM * ((numLaths * lathUncompH + bottomH) / 1000)
    };
}

/**
 * Calculates Axle Deflection
 */
export function calculateDeflection(params) {
    const { totalWeight, axle, length, curtainWidth, fixityPercent } = params;
    
    const outerDia = parseFloat(axle['Diameter']);
    const wallThick = parseFloat(axle['Wall Thickness']);
    const E = parseFloat(axle['Material grade']) || 199000; // Young's Modulus
    const density = parseFloat(axle['Density (kg/m3)']) || 7850;
    
    // Moment of Inertia (I)
    const I = (Math.PI / 64) * (Math.pow(outerDia, 4) - Math.pow(outerDia - 2 * wallThick, 4));
    
    // Axle Weight
    const lengthM = length / 1000;
    const areaM2 = (Math.PI * (Math.pow(outerDia / 2000, 2) - Math.pow((outerDia - 2 * wallThick) / 2000, 2)));
    const axleWeight = areaM2 * lengthM * density;

    const totalForceN = (totalWeight + axleWeight) * G;
    
    // Fixity Coefficient (Interpolate between 5 and 1)
    const C = 5 - (4 * (fixityPercent / 100));

    const deflection = (C * totalForceN * Math.pow(length, 3)) / (384 * E * I);
    const ratio = length / deflection;

    return { deflection, ratio, axleWeight, I };
}

/**
 * Generates a Torque Profile (Nm required at every half-turn)
 */
export function getTorqueProfile(totalWeightKgs, lath, travelHeight, startDia) {
    const profile = [];
    let heightLifted = 0;
    let currentDia = startDia;
    const t = parseFloat(lath['Thickness']);
    
    // This simulates the curtain rolling up
    while (heightLifted < travelHeight) {
        const weightRemaining = totalWeightKgs * (1 - (heightLifted / travelHeight));
        const force = Math.max(0, weightRemaining) * G;
        const radiusM = ((currentDia + t) / 2) / 1000;
        
        profile.push({
            torque: force * radiusM,
            diameter: currentDia,
            heightLifted: heightLifted
        });

        heightLifted += (Math.PI * currentDia) / 2; // Half turn
        currentDia += t;
    }
    return profile;
}

/**
 * Chain Drive Metrics
 */
export function calculateChainMetrics(motorTeeth, barrelTeeth, maxTorque, plateWheelDia, breakingStrainN) {
    const ratio = barrelTeeth / motorTeeth;
    const motorTorque = maxTorque / ratio;
    
    let tensionN = 0;
    if (plateWheelDia > 0) {
        tensionN = maxTorque / ((plateWheelDia / 2) / 1000);
    }
    
    const safetyFactor = breakingStrainN / tensionN;

    return {
        ratio,
        motorTorque,
        tensionN,
        tensionKg: tensionN / G,
        safetyFactor
    };
}