function populateMotorMountingTypes() {
            const mountingTypes = [...new Set(motorData.map(motor => motor['Mounting type']))];
            const select = dom.motorMountingType;
            select.innerHTML = '<option value="">-- All Types --</option>';
            mountingTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type; option.textContent = type; select.appendChild(option);
            });
        }

function populateMotorVoltageFilter() {
            let voltageKey = '';
            if (motorData.length > 0) {
                voltageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'voltage');
            }
            if (!voltageKey) { dom.motorVoltageFilter.parentElement.style.display = 'none'; return; }
            
            const allVoltages = motorData.map(motor => String(motor[voltageKey] || ''))
                                         .join('/')
                                         .split('/')
                                         .map(v => v.trim())
                                         .filter(v => v);
            
            const uniqueVoltageTypes = [...new Set(allVoltages)];
            const select = dom.motorVoltageFilter;
            select.innerHTML = '<option value="">-- All Voltages --</option>';
            uniqueVoltageTypes.sort().forEach(type => {
                const option = document.createElement('option');
                option.value = type; option.textContent = type; select.appendChild(option);
            });
            dom.motorVoltageFilter.parentElement.style.display = 'block';
        }

function populateMotorManufacturerFilter() {
            let manufacturerKey = '';
            if (motorData.length > 0) {
                manufacturerKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manufacturer');
            }
            if (!manufacturerKey) { dom.motorManufacturerFilter.parentElement.style.display = 'none'; return; }
            const manufacturers = [...new Set(motorData.map(motor => motor[manufacturerKey]).filter(m => m))];
            const select = dom.motorManufacturerFilter;
            select.innerHTML = '<option value="">-- All Manufacturers --</option>';
            manufacturers.sort().forEach(type => {
                const option = document.createElement('option');
                option.value = type; option.textContent = type; select.appendChild(option);
            });
            dom.motorManufacturerFilter.parentElement.style.display = 'block';
        }

function populateMotorUsageFilter() {
            let usageKey = '';
            if (motorData.length > 0) {
                usageKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'usage type');
            }
            if (!usageKey) { dom.motorUsageFilter.parentElement.style.display = 'none'; return; }
            const usageTypes = [...new Set(motorData.map(motor => motor[usageKey]).filter(m => m))];
            const select = dom.motorUsageFilter;
            select.innerHTML = '<option value="">-- All Usage Types --</option>';
            usageTypes.sort().forEach(type => {
                const option = document.createElement('option');
                option.value = type; option.textContent = type; select.appendChild(option);
            });
            dom.motorUsageFilter.parentElement.style.display = 'block';
        }

function populateMotorManualOverrideFilter() {
            let moKey = '';
            if (motorData.length > 0) {
                moKey = Object.keys(motorData[0]).find(k => k.toLowerCase().trim() === 'manual override');
            }
            if (!moKey) { dom.motorManualOverrideFilter.parentElement.style.display = 'none'; return; }
            const moValues = [...new Set(motorData.map(motor => motor[moKey]).filter(v => v))];
            const select = dom.motorManualOverrideFilter;
            select.innerHTML = '<option value="">-- All --</option>';
            moValues.sort().forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });
            dom.motorManualOverrideFilter.parentElement.style.display = 'block';
        }

function populateDropdown(selectElement, dataArray, nameField) {
            selectElement.innerHTML = `<option value="">-- Select an option --</option>`;
            dataArray.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                const header = Object.keys(item).find(k => k.toLowerCase().trim() === nameField.toLowerCase().trim());
                option.textContent = item[header];
                selectElement.appendChild(option);
            });
        }