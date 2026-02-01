function updateChainCalculations() {
            // Get inputs
            const motorTeeth = parseInt(dom.motorTeeth.value) || 0;
            const barrelTeeth = parseInt(dom.barrelTeeth.value) || 0;
            const chainPitch = parseFloat(dom.chainPitch.value) || 0;
            const maxTorqueRequired = parseFloat(dom['max-torque'].textContent) || 0;
            const plateWheelDia = parseFloat(dom.plateWheelDiameter.value) || 0;

            if (motorTeeth <= 0 || barrelTeeth <= 0 || maxTorqueRequired <= 0) {
                 ['chain-ratio', 'chain-torque-barrel', 'chain-torque-motor', 'chain-tension', 'chain-breaking-load', 'chain-safety-factor', 'chain-tension-n', 'chain-breaking-load-n'].forEach(id => { 
                     const el = dom[id]; if(el) el.textContent = '0.0'; 
                 });
                 dom['chain-safety-factor'].classList.remove('warning-text', 'option-pass');
                 drawChainGraphic(0, 0, 0, 0, 0, 0);
                 return;
            }

            const ratio = barrelTeeth / motorTeeth;
            dom['chain-ratio'].textContent = `1 : ${ratio.toFixed(2)}`;
            dom['chain-torque-barrel'].textContent = maxTorqueRequired.toFixed(1);
            const motorTorque = maxTorqueRequired / ratio;
            dom['chain-torque-motor'].textContent = motorTorque.toFixed(1);

            let tensionN = 0;
            if (plateWheelDia > 0) {
                const radiusM = (plateWheelDia / 2) / 1000;
                tensionN = maxTorqueRequired / radiusM;
            }
            
            const tensionKg = tensionN / 9.81;

            dom['chain-tension-n'].textContent = tensionN.toFixed(1);
            dom['chain-tension'].textContent = tensionKg.toFixed(1);

            let safetyFactor = 0;
            let breakStrainN = 0;
            if (dom.chainSizeDisplay.dataset.breakingStrain) {
                breakStrainN = parseFloat(dom.chainSizeDisplay.dataset.breakingStrain);
            }

            dom['chain-breaking-load-n'].textContent = breakStrainN > 0 ? breakStrainN.toFixed(0) : 'N/A';
            
            if (breakStrainN > 0 && tensionN > 0) {
                safetyFactor = breakStrainN / tensionN;
                dom['chain-safety-factor'].textContent = safetyFactor.toFixed(2);
                
                if (safetyFactor < 6.0) { 
                     dom['chain-safety-factor'].classList.add('warning-text');
                     dom['chain-safety-factor'].classList.remove('option-pass');
                     dom['chain-safety-factor'].textContent += " (FAIL < 6:1)";
                } else {
                     dom['chain-safety-factor'].classList.remove('warning-text');
                     dom['chain-safety-factor'].classList.add('option-pass');
                }
            } else {
                dom['chain-safety-factor'].textContent = 'N/A';
            }

            const motorDriveshaft = parseFloat(dom['motor-driveshaft-dia'].textContent) || 0;
            const sprocketDia = parseFloat(dom.sprocketDiameter.value) || 0;

            drawChainGraphic(motorTeeth, barrelTeeth, chainPitch, sprocketDia, plateWheelDia, motorDriveshaft);
        }