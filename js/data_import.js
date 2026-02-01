function processExcelFile(fileData) {
            userSelectedAxleIndex = null; 
            try {
                const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
                const required = {
                    'Lath': ['Name', 'Kgs/ m2', 'Thickness', 'Compressed lath height', 'uncompressed lath height', 'Friction %', 'Max Width', 'Lath image', 'Moment of inertia iy', 'Allowable Bending Stress (MPa)', 'vision percentage', 'min axle diameter'],
                    'Bottom lath': ['Bottom lath name', 'BLath weight / m length', 'BLath height'],
                    'Axles': ['Name', 'Diameter', 'Wall Thickness', 'Material grade', "Density (kg/m3)", 'Shape'],
                    'Motors': ['Name', 'Torque (Nm) min', 'Torque (Nm) max', 'RPM', 'Mounting type', 'Wattage', 'Voltage', 'Manufacturer', 'Usage type', 'Manual override', 'Motor image', 'Limit turn', 'Driveshaft diameter mm'],
                    'SafetyB': ['Name', 'Max Safety Torque (Nm)', 'Operating Torque (Nm)', 'Driveshaft diameter mm', 'Stop distance', 'SB image'],
                    'Endplate': ['Name', 'Size', 'Material', 'Fixing holes'],
                    'Wicket doors': ['Name', 'Height', 'Width'],
                    'Endlock': ['Description', 'Weight in grams', 'end lock offset'],
                    'Guides': ['Name', 'Width', 'Penetration'],
                    'Chaindrive': ['Motor Description', 'Sprocket teeth', 'Plate wheel', 'Chain size', 'Chain Breaking Strain in newtons', 'Sprocket diameter', 'Platewheel Diameter']
                };

                for (const sheetName in required) {
                    if (!workbook.Sheets[sheetName]) {
                        if (sheetName === 'Wicket doors' || sheetName === 'Endlock') {
                            if(sheetName === 'Wicket doors') wicketData = [];
                            if(sheetName === 'Endlock') endlockData = [];
                            continue;
                        }
                        throw new Error(`Required sheet "${sheetName}" not found or is empty in the Excel file.`);
                    }
                    const objectData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    switch (sheetName) {
                        case 'Lath': lathData = objectData; break;
                        case 'Bottom lath': bottomLathData = objectData; break;
                        case 'Axles': axleData = objectData; break;
                        case 'Motors': motorData = objectData; break;
                        case 'SafetyB': safetyBrakeData = objectData; break;
                        case 'Endplate': endplateData = objectData; break;
                        case 'Wicket doors': wicketData = objectData; break;
                        case 'Endlock': endlockData = objectData; break;
                        case 'Guides': guideData = objectData; break;
                        case 'Chaindrive': chainDriveData = objectData; break;
                    }
                }

                lathImageMap.clear(); safetyBrakeImageMap.clear(); motorImageMap.clear();
                const exceljsWorkbook = new ExcelJS.Workbook();
                await exceljsWorkbook.xlsx.load(fileData);

                const lathSheet = exceljsWorkbook.getWorksheet('Lath');
                if (lathSheet) await extractImagesFromSheet(exceljsWorkbook, lathSheet, 'name', 'lath image', lathImageMap);
                
                const safetyBrakeSheet = exceljsWorkbook.getWorksheet('SafetyB');
                if (safetyBrakeSheet) await extractImagesFromSheet(exceljsWorkbook, safetyBrakeSheet, 'name', 'sb image', safetyBrakeImageMap);
                
                const motorSheet = exceljsWorkbook.getWorksheet('Motors');
                if (motorSheet) await extractImagesFromSheet(exceljsWorkbook, motorSheet, 'name', 'motor image', motorImageMap);

                populateDropdown(dom.lathType, lathData, 'Name');
                populateDropdown(dom.guideType, guideData, 'Name');
                const visionSelect = dom.visionLathType;
                visionSelect.innerHTML = `<option value="">-- Select a vision lath --</option>`;
                lathData.forEach((item, index) => {
                    const visionKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'vision percentage');
                    const visionValue = visionKey ? (parseFloat(item[visionKey]) || 0) : 0;
                    if (visionValue > 0) {
                        const option = document.createElement('option');
                        option.value = index;
                        const nameKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'name');
                        option.textContent = item[nameKey];
                        visionSelect.appendChild(option);
                    }
                });
                populateDropdown(dom.bottomLathType, bottomLathData, 'Bottom lath name');
                populateDropdown(dom.endlockType, endlockData, 'Description');
                populateMotorMountingTypes();
                populateMotorVoltageFilter();
                populateMotorManufacturerFilter();
                populateMotorUsageFilter();
                populateMotorManualOverrideFilter();
                populateDropdown(dom.wicketDoorSelector, wicketData, 'Name');

                ['lathType', 'guideType', 'bottomLathType', 'visionLathType', 'motorMountingType', 'motorVoltageFilter', 'motorManufacturerFilter', 'motorUsageFilter', 'motorManualOverrideFilter', 'safetyBrakeSelector', 'axleType', 'endplateSelector', 'wicketDoorSelector', 'endlockType'].forEach(id => {
                    if(dom[id]) dom[id].disabled = false;
                });

                updateSelectedWicketInfo(); 
                dom['import-status'].textContent = 'Successfully loaded data from repository.';
                dom['import-status'].style.color = 'green';
                updateAllCalculations();
                setupReportFilters();

            } catch (error) {
                dom['import-status'].textContent = `Error processing Excel file: ${error.message}`;
                dom['import-status'].style.color = 'red';
                alert(`Error Reading File: ${error.message}`);
                lathData = []; axleData = []; motorData = []; bottomLathData = []; safetyBrakeData = []; endplateData = []; wicketData = []; endlockData = []; guideData = []; chainDriveData = [];
            }
        }

function handleCsvImport() {
            const csvFileInput = document.getElementById('csvFileInput');
            const statusDiv = document.getElementById('import-status-admin');
            
            if (!csvFileInput.files || csvFileInput.files.length === 0) {
                statusDiv.textContent = 'Please select a CSV file first.';
                statusDiv.style.color = 'red';
                return;
            }
            const file = csvFileInput.files[0];
            statusDiv.textContent = 'Importing...';
            statusDiv.style.color = '#555';

            Papa.parse(file, {
                header: true, skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        statusDiv.textContent = `Error parsing CSV: ${results.errors[0].message}`;
                        statusDiv.style.color = 'red';
                        return;
                    }
                    if (results.data.length === 0) {
                        statusDiv.textContent = 'CSV file is empty or contains only headers.';
                        statusDiv.style.color = 'red';
                        return;
                    }
                    populateFieldsFromCsv(results.data[0]);
                    statusDiv.textContent = `Successfully imported data for "${results.data[0].Calculation_ID || 'N/A'}".`;
                    statusDiv.style.color = 'green';
                },
                error: function(err) {
                     statusDiv.textContent = `An error occurred: ${err}`;
                     statusDiv.style.color = 'red';
                }
            });
        }

function populateFieldsFromCsv(data) {
            const getVal = (key) => (data[key] || '').trim();
            const mappings = {
                'Curtain_Width_mm': { id: 'width', type: 'number' },
                'Curtain_Height_mm': { id: 'height', type: 'number' },
                'Additional_Axle_Width_mm': { id: 'additionalLength', type: 'number' },
                'Collar_Size_mm': { id: 'collarSize', type: 'number' },
                'Friction_Allowance_Percent': { id: 'friction', type: 'number' },
                'Vision_Start_Height_mm': { id: 'visionStartHeight', type: 'number' },
                'Vision_Panel_Height_mm': { id: 'visionPanelHeight', type: 'number' },
                'Is_Powder_Coated': { id: 'powderCoated', type: 'checkbox' },
                'Has_Vision_Slats': { id: 'addVision', type: 'checkbox' },
                'Include_Deflection_In_Sizing': { id: 'includeDeflectionInSizing', type: 'checkbox' },
                'Lath_Type_Name': { id: 'lathType', type: 'select' },
                'Endlock_Type_Name': { id: 'endlockType', type: 'select' },
                'Bottom_Lath_Name': { id: 'bottomLathType', type: 'select' },
                'Vision_Lath_Name': { id: 'visionLathType', type: 'select' },
                'Motor_Mounting_Type': { id: 'motorMountingType', type: 'select' },
                'Wicket_Door_Name': { id: 'wicketDoorSelector', type: 'select' },
                'Endplate_Material': { name: 'material', type: 'radio' },
            };

            for (const key in mappings) {
                const value = getVal(key);
                if (value === '') continue;
                const config = mappings[key];
                switch (config.type) {
                    case 'number':
                        const numEl = document.getElementById(config.id);
                        if (numEl) numEl.value = value;
                        break;
                    case 'checkbox':
                        const checkEl = document.getElementById(config.id);
                        if (checkEl) checkEl.checked = (value.toLowerCase() === 'true');
                        break;
                    case 'select':
                        const selectEl = document.getElementById(config.id);
                        if (selectEl) {
                            for (let i = 0; i < selectEl.options.length; i++) {
                                if (selectEl.options[i].text.trim() === value.trim()) {
                                    selectEl.value = selectEl.options[i].value;
                                    break;
                                }
                            }
                        }
                        break;
                    case 'radio':
                        const radioEl = document.querySelector(`input[name="${config.name}"][value="${value}"]`);
                        if (radioEl) radioEl.checked = true;
                        break;
                }
            }
            dom.addVision.dispatchEvent(new Event('change'));
            updateAllCalculations();
            switchTab('inputs-content');
        }

function extractImagesFromSheet(workbook, sheet, nameColHeader, imageColHeader, imageMap) {
            let nameCol = -1, imageCol = -1;
            const headerRow = sheet.getRow(1);
            headerRow.eachCell((cell, colNumber) => {
                const headerText = cell.value ? cell.value.toString().toLowerCase().trim() : '';
                if (headerText === nameColHeader) nameCol = colNumber;
                if (headerText === imageColHeader) imageCol = colNumber;
            });

            if (nameCol > 0 && imageCol > 0) {
                const images = sheet.getImages();
                images.forEach(image => {
                    const imageRowNumber = image.range.tl.row + 1;
                    const nameCell = sheet.getCell(imageRowNumber, nameCol);
                    if (nameCell && nameCell.value) {
                        const name = nameCell.value.toString();
                        const imgData = workbook.getImage(image.imageId);
                        const base64Image = btoa(new Uint8Array(imgData.buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                        const imageSrc = `data:image/${imgData.extension};base64,${base64Image}`;
                        imageMap.set(name, imageSrc);
                    }
                });
            }
        }