function calculateWicketTorque(curtainWidth) {
            const selectedLath = lathData.length > 0 ? lathData[dom.lathType.value] : null;
            const selectedAxle = axleData.length > 0 ? axleData[dom.axleType.value] : null;
            const selectedWicket = wicketData.length > 0 ? wicketData[dom.wicketDoorSelector.value] : null;
            const totalWeightKgs = parseFloat(dom['torque-weight-kg'].textContent) || 0;
            if (!selectedLath || !selectedAxle || !selectedWicket || totalWeightKgs <= 0) {
                dom['wicket-max-torque'].textContent = '0.0'; drawTorqueGraph([], dom['wicket-torque-graph-container']); return;
            }
            const floorToAxleCenter = parseFloat(dom.height.value) || 0;
            const bottomLathHeight = bottomLathData.length > 0 ? (parseFloat(bottomLathData[dom.bottomLathType.value]['BLath height']) || 0) : 0;
            const travelHeight = floorToAxleCenter - bottomLathHeight;
            const collarSize = parseFloat(dom.collarSize.value) || 0;
            const axleCoilDiameter = getEffectiveCoilDiameter(selectedAxle);
            const effectiveStartDiameter = Math.max(axleCoilDiameter, collarSize);
            const { profileData } = getTorqueProfileWithWicket(totalWeightKgs, selectedLath, travelHeight, selectedWicket, effectiveStartDiameter, curtainWidth);
            
            const frictionText = dom['total-applied-friction'].textContent;
            const frictionMultiplier = 1 + (parseFloat(frictionText) || 0) / 100;
            
            const adjustedProfile = profileData.map(item => ({...item, torque: item.torque * frictionMultiplier}));
            const requiredTorque = adjustedProfile.length > 0 ? Math.max(...adjustedProfile.map(p => p.torque)) : 0;
            dom['wicket-max-torque'].textContent = requiredTorque.toFixed(1);
            drawTorqueGraph(adjustedProfile, dom['wicket-torque-graph-container']);
        }

function updateWicketCalculationsAndGraphic(endlockOffsets = {cast: 0, wind: 0}