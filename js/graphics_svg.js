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

function drawShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, visionData = null, endlockOffsets = {cast: 0, wind: 0}

function drawWicketGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, wicket, wicketLathHeight, endlockOffsets = {cast: 0, wind: 0}

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

function createBaseShutterGraphic(realWidth, additionalLength, numLaths, lath, bottomLath, axle, selectedEndplate, options = {}