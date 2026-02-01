function handleShapeChange() {
            const selectedShape = document.querySelector('input[name="axleShape"]:checked').value;
            const collarGroup = dom['collar-size-group'];
            
            collarGroup.style.display = 'block';
            
            userSelectedAxleIndex = null;
            updateAllCalculations();
        }

function handleAxleOverride() {
            if (dom.axleType.value !== "") {
                userSelectedAxleIndex = dom.axleType.value; 
                updateAllCalculations(); 
            }
        }