/**
 * Renderers Module
 * Handles all SVG and graphical drawing logic.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

// Helper to create SVG elements with attributes
function createSVG(type, attrs = {}) {
    const el = document.createElementNS(SVG_NS, type);
    for (const key in attrs) {
        if (key === 'textContent') {
            el.textContent = attrs[key];
        } else {
            el.setAttribute(key, attrs[key]);
        }
    }
    return el;
}

/**
 * Draws the Torque Bar Chart
 */
export function drawTorqueGraph(container, profileData) {
    container.innerHTML = '';
    if (!profileData || profileData.length === 0) return;

    const svgWidth = container.clientWidth || 550;
    const svgHeight = container.clientHeight || 280;
    const svg = createSVG('svg', { viewBox: `0 0 ${svgWidth} ${svgHeight}` });

    const padding = { top: 30, right: 20, bottom: 60, left: 45 };
    const graphWidth = svgWidth - padding.left - padding.right;
    const graphHeight = svgHeight - padding.top - padding.bottom;
    
    const maxTorque = Math.max(...profileData.map(p => p.torque)) * 1.1 || 10;

    // Draw Axis
    svg.appendChild(createSVG('line', { x1: padding.left, y1: padding.top, x2: padding.left, y2: padding.top + graphHeight, class: 'axis-line' }));
    svg.appendChild(createSVG('line', { x1: padding.left, y1: padding.top + graphHeight, x2: padding.left + graphWidth, y2: padding.top + graphHeight, class: 'axis-line' }));

    const barWidth = (graphWidth / profileData.length) * 0.8;

    profileData.forEach((item, index) => {
        const barHeight = (item.torque / maxTorque) * graphHeight;
        const x = padding.left + index * (graphWidth / profileData.length);
        const y = padding.top + graphHeight - barHeight;

        const bar = createSVG('rect', {
            x, y, width: barWidth, height: barHeight, class: 'torque-bar'
        });
        
        const title = createSVG('title', { textContent: `${item.torque.toFixed(1)} Nm` });
        bar.appendChild(title);
        svg.appendChild(bar);

        // Labels every few bars
        if (index % Math.ceil(profileData.length / 10) === 0) {
            svg.appendChild(createSVG('text', {
                x: x + barWidth / 2, y: padding.top + graphHeight + 15,
                class: 'graph-data-label', textContent: `Ø${item.diameter.toFixed(0)}`
            }));
        }
    });

    container.appendChild(svg);
}

/**
 * Draws Axle Deflection Curve
 */
export function drawDeflectionGraphic(container, length, deflection) {
    container.innerHTML = '';
    const svgWidth = container.clientWidth || 550;
    const svgHeight = 150;
    const svg = createSVG('svg', { viewBox: `0 0 ${svgWidth} ${svgHeight}` });

    const padding = 30;
    const beamY = svgHeight / 2;
    const startX = padding;
    const endX = svgWidth - padding;
    
    // Scale deflection for visual impact (limit to 40px)
    const visualDeflection = Math.min(40, deflection * 2);

    // Reference Line
    svg.appendChild(createSVG('path', { d: `M ${startX} ${beamY} H ${endX}`, class: 'beam-path' }));

    // Deflected Path (Quadratic Curve)
    const midX = svgWidth / 2;
    const midY = beamY + visualDeflection;
    const dAttr = `M ${startX},${beamY} Q ${midX},${midY} ${endX},${beamY}`;
    
    const path = createSVG('path', { d: dAttr, class: `deflected-path ${deflection > 17 ? 'warning' : ''}` });
    svg.appendChild(path);

    // Labels
    svg.appendChild(createSVG('text', { x: midX, y: midY + 20, class: 'graph-text', textContent: `${deflection.toFixed(2)} mm` }));

    container.appendChild(svg);
}

/**
 * Draws Axle Cross Section and Front View
 */
export function drawAxleCrossSection(container, axle, collarSize) {
    container.innerHTML = '';
    if (!axle) return;

    const outerDia = parseFloat(axle['Diameter']);
    const wall = parseFloat(axle['Wall Thickness']);
    const scale = 120 / (Math.max(outerDia, collarSize) || outerDia);

    const svg = createSVG('svg', { viewBox: "0 0 800 300" });
    const cx = 150, cy = 150;

    // Draw Cross Section
    svg.appendChild(createSVG('circle', { cx, cy, r: (outerDia / 2) * scale, fill: '#adb5bd', stroke: '#333' }));
    svg.appendChild(createSVG('circle', { cx, cy, r: ((outerDia - wall * 2) / 2) * scale, fill: '#fff', stroke: '#333' }));

    if (collarSize > outerDia) {
        svg.appendChild(createSVG('circle', { cx, cy, r: (collarSize / 2) * scale, fill: 'none', stroke: '#666', 'stroke-dasharray': '4,2' }));
    }

    // Draw Side View
    const fvX = 400, fvY = 100, fvW = 300, fvH = outerDia * scale;
    svg.appendChild(createSVG('rect', { x: fvX, y: cy - fvH / 2, width: fvW, height: fvH, fill: '#adb5bd', stroke: '#333' }));

    container.appendChild(svg);
}

/**
 * Draws the Chain/Sprocket System
 */
export function drawChainGraphic(container, motorTeeth, barrelTeeth, pitch) {
    container.innerHTML = '';
    const svg = createSVG('svg', { viewBox: "0 0 550 300" });
    
    // Simplistic representation of two sprockets and a path
    const r1 = motorTeeth * 1.5;
    const r2 = barrelTeeth * 1.5;
    
    svg.appendChild(createSVG('circle', { cx: 150, cy: 150, r: r1, fill: '#e9ecef', stroke: '#333' }));
    svg.appendChild(createSVG('circle', { cx: 400, cy: 150, r: r2, fill: '#e9ecef', stroke: '#333' }));
    
    // Chain line
    svg.appendChild(createSVG('path', { 
        d: `M 150,${150-r1} L 400,${150-r2} M 150,${150+r1} L 400,${150+r2}`, 
        stroke: '#333', 'stroke-width': '4', 'stroke-dasharray': '5,5' 
    }));

    container.appendChild(svg);
}

/**
 * Shutter Front View (Helper)
 */
export function drawShutterGraphic(container, params) {
    container.innerHTML = '';
    const { width, height, numLaths, axleDia } = params;
    
    const svg = createSVG('svg', { viewBox: "0 0 600 400" });
    const scale = 500 / width;
    
    // Draw Axle
    svg.appendChild(createSVG('rect', { 
        x: 50, y: 50, width: 500, height: axleDia * scale, fill: '#6c757d' 
    }));
    
    // Draw Curtain
    const lathH = (height * scale) / numLaths;
    for(let i=0; i < Math.min(numLaths, 20); i++) {
        svg.appendChild(createSVG('rect', {
            x: 70, y: 50 + (axleDia * scale) + (i * lathH),
            width: 460, height: lathH,
            class: 'shutter-lath-graphic'
        }));
    }
    
    container.appendChild(svg);
}