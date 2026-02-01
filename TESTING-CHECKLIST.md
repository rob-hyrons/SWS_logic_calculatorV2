# Migration & Testing Checklist

## 📋 Complete Testing Checklist

Use this checklist to verify that the modular version works identically to the original.

### ✅ Initial Setup

- [ ] All files downloaded to local system
- [ ] Folder structure intact (css/, js/, html-templates/)
- [ ] index.html opens in browser without errors
- [ ] Browser console shows no JavaScript errors on load
- [ ] All CSS files load (check Network tab)
- [ ] All JS files load (check Network tab)

---

### ✅ Data Import Testing

#### Excel Import
- [ ] Can select Excel file for Lath data
- [ ] Lath dropdown populates after import
- [ ] Can select Excel file for Endlock data
- [ ] Endlock dropdown populates after import
- [ ] Can select Excel file for Bottom Lath data
- [ ] Bottom Lath dropdown populates after import
- [ ] Can select Excel file for Axle data
- [ ] Axle dropdown populates after import
- [ ] Can select Excel file for Motor data
- [ ] Motor filters populate after import
- [ ] Can select Excel file for Endplate data
- [ ] Endplate options appear after import
- [ ] Can select Excel file for Chain data
- [ ] Chain options appear after import
- [ ] Logo image extracts and displays (if present in file)
- [ ] Images extract for motors (if present)
- [ ] Images extract for wicket doors (if present)

#### CSV Import
- [ ] Can import CSV file
- [ ] Fields auto-populate from CSV
- [ ] All mappings work correctly
- [ ] Calculations trigger after CSV import

---

### ✅ Tab 1: Shutter Weight & Inputs

#### Display
- [ ] Tab appears and is accessible
- [ ] All form fields visible
- [ ] Dropdowns are populated
- [ ] Input fields accept values

#### Functionality
- [ ] Can enter width and height
- [ ] Can select lath type
- [ ] Can select endlock type
- [ ] Can select bottom lath type
- [ ] Custom lath weight option works
- [ ] Vision panel checkbox works
- [ ] Vision panel fields appear when checked
- [ ] Vision lath type selector works
- [ ] Powder coating checkbox works
- [ ] Width validation warning appears for invalid widths
- [ ] Calculations update on input change

#### Results
- [ ] Total weight calculates correctly
- [ ] Lath weight displays
- [ ] Bottom lath weight displays
- [ ] Endlock weight displays
- [ ] Curtain area displays
- [ ] Lath count displays
- [ ] Uncompressed height displays
- [ ] Compressed height displays
- [ ] Vision area calculates (when enabled)
- [ ] Vision percentage calculates (when enabled)

#### Graphics
- [ ] Shutter graphic displays
- [ ] Laths render correctly
- [ ] Bottom lath renders
- [ ] Endlocks render
- [ ] Vision panels render (when enabled)
- [ ] Wicket door renders (when added)
- [ ] Dimensions show correctly
- [ ] Width graphic displays
- [ ] All measurements labeled

---

### ✅ Tab 2: Axle Analysis

#### Display
- [ ] Tab appears and is accessible
- [ ] Axle shape selector visible
- [ ] Axle type dropdown populated
- [ ] Collar size field appears for octagonal

#### Functionality
- [ ] Circular axle shape selectable
- [ ] Octagonal axle shape selectable
- [ ] Collar size input works (octagonal only)
- [ ] Axle auto-selects based on load
- [ ] Can manually override axle selection
- [ ] Deflection calculation updates
- [ ] Include deflection in sizing checkbox works

#### Results
- [ ] Total axle length displays
- [ ] Axle weight displays
- [ ] Total weight for deflection displays
- [ ] Material grade displays
- [ ] Moment of inertia displays
- [ ] Calculated deflection displays
- [ ] Deflection ratio displays
- [ ] Safety factor displays
- [ ] Recommendation box appears (when needed)
- [ ] Warning shows for high deflection

#### Graphics
- [ ] Deflection graphic displays
- [ ] Beam shape renders
- [ ] Deflection curve renders
- [ ] Support points show
- [ ] Deflection measurements labeled
- [ ] Warning color for high deflection
- [ ] Axle cross-section displays
- [ ] Circular cross-section draws correctly
- [ ] Octagonal cross-section draws correctly
- [ ] Collar renders (when applicable)
- [ ] Dimensions labeled

---

### ✅ Tab 3: Motor & Torque

#### Display
- [ ] Tab appears and is accessible
- [ ] Motor usage type filter populated
- [ ] Motor manufacturer filter populated
- [ ] Motor voltage filter populated
- [ ] Motor mounting type dropdown populated
- [ ] Manual override filter populated
- [ ] Friction input field works
- [ ] Motor selector dropdown populated

#### Functionality
- [ ] Usage type filter works
- [ ] Manufacturer filter works
- [ ] Voltage filter works
- [ ] Mounting type filter works
- [ ] Manual override filter works
- [ ] Filters combine correctly
- [ ] Friction % can be adjusted
- [ ] Friction auto-updates from lath data
- [ ] Motor selector shows filtered motors
- [ ] Suitable motors highlighted
- [ ] Can select specific motor

#### Results
- [ ] Max required torque displays
- [ ] Total revolutions displays
- [ ] Selected motor name displays
- [ ] Motor torque range displays
- [ ] Motor speed displays
- [ ] Driveshaft diameter displays
- [ ] Cycles per hour displays
- [ ] Opening time displays
- [ ] Power consumed displays
- [ ] Motor limit turns displays
- [ ] Limit warning appears (when exceeded)
- [ ] Motor image displays (if available)

#### Graphics
- [ ] Torque graph displays
- [ ] All height points render
- [ ] Torque values labeled
- [ ] Bars sized correctly
- [ ] Graph scales properly
- [ ] Hover effects work

---

### ✅ Tab 4: Endplate

#### Display
- [ ] Tab appears and is accessible
- [ ] Material selector (Steel/Aluminum) visible
- [ ] Endplate selector dropdown populated
- [ ] Safety brake selector populated

#### Functionality
- [ ] Can select steel material
- [ ] Can select aluminum material
- [ ] Material affects recommendations
- [ ] Endplate auto-selects based on torque
- [ ] Can manually select endplate
- [ ] Safety brake options filter correctly
- [ ] Force calculations update

#### Results
- [ ] Required torque displays
- [ ] Selected endplate name displays
- [ ] Max endplate torque displays
- [ ] Floor to axle height displays
- [ ] Box dimensions display
- [ ] Torsion spring force displays
- [ ] Counter balance force displays
- [ ] Safety brake selection displays
- [ ] Safety brake capacity displays

#### Graphics
- [ ] Endplate graphic displays
- [ ] Assembly view renders
- [ ] Endplate box renders
- [ ] Axle renders
- [ ] Mounting points show
- [ ] Dimensions labeled
- [ ] Force diagram displays
- [ ] Torsion spring force vector shows
- [ ] Counter balance force vector shows
- [ ] Forces labeled correctly
- [ ] Angles calculated correctly

---

### ✅ Tab 5: Wicket Door

#### Display
- [ ] Tab appears and is accessible
- [ ] Wicket door selector populated
- [ ] Wicket position controls visible

#### Functionality
- [ ] Can select wicket door type
- [ ] Can adjust wicket X position
- [ ] Can adjust wicket Y position
- [ ] Wicket calculations update
- [ ] Torque recalculates with wicket
- [ ] Motor recommendation updates

#### Results
- [ ] Wicket door name displays
- [ ] Wicket dimensions display
- [ ] Wicket weight displays
- [ ] Additional torque displays
- [ ] Total torque with wicket displays
- [ ] Updated motor recommendation shows

#### Graphics
- [ ] Wicket graphic displays
- [ ] Wicket door renders in position
- [ ] Shutter renders around wicket
- [ ] Position adjusts visually
- [ ] Dimensions labeled
- [ ] Wicket image displays (if available)

---

### ✅ Tab 6: Width Validation

#### Display
- [ ] Tab appears and is accessible
- [ ] Width input field works
- [ ] Check button visible

#### Functionality
- [ ] Can enter width to validate
- [ ] Check button triggers validation
- [ ] Validation runs against all lath types
- [ ] Results show pass/fail for each lath

#### Results
- [ ] All lath types listed
- [ ] Pass/fail status shows for each
- [ ] Maximum width shows for each
- [ ] Color coding works (green pass, red fail)
- [ ] Recommendations appear

#### Graphics
- [ ] Width graphic displays
- [ ] Top-down view renders
- [ ] Width dimensions labeled
- [ ] Valid/invalid areas highlighted

---

### ✅ Tab 7: Chain

#### Display
- [ ] Tab appears and is accessible
- [ ] Chain selector populated
- [ ] Sprocket teeth input works
- [ ] Additional weight input works

#### Functionality
- [ ] Can select chain type
- [ ] Can adjust sprocket teeth
- [ ] Can add additional weight
- [ ] Calculations update automatically
- [ ] Safety factor applies

#### Results
- [ ] Chain name displays
- [ ] Chain pitch displays
- [ ] Breaking load displays
- [ ] Required load displays
- [ ] Safety factor displays
- [ ] Sprocket pitch diameter displays
- [ ] Number of teeth displays
- [ ] Weight per meter displays
- [ ] Total chain length displays
- [ ] Pass/fail status shows

#### Graphics
- [ ] Chain graphic displays
- [ ] Sprockets render
- [ ] Sprocket teeth render
- [ ] Chain path renders
- [ ] Pitch circle shows
- [ ] Driveshaft renders
- [ ] Dimensions labeled
- [ ] Forces labeled

---

### ✅ Tab 8: CSV Report Generation

#### Display
- [ ] Tab appears and is accessible
- [ ] All input fields visible
- [ ] Min/max width inputs work
- [ ] Min/max height inputs work
- [ ] Interval input works
- [ ] Lath type selectors populated
- [ ] Lath limit input works
- [ ] Endlock selector populated
- [ ] Bottom lath selector populated
- [ ] Motor manufacturer checkboxes visible
- [ ] Voltage checkboxes visible
- [ ] Mounting type checkboxes visible
- [ ] Usage type checkboxes visible

#### Functionality
- [ ] Can set width range
- [ ] Can set height range
- [ ] Can set calculation interval
- [ ] Can select primary lath type
- [ ] Can select secondary lath type
- [ ] Can set lath switching limit
- [ ] Can select endlock type
- [ ] Can select bottom lath type
- [ ] Can check multiple manufacturers
- [ ] Can check multiple voltages
- [ ] Can check multiple mounting types
- [ ] Can check multiple usage types
- [ ] Generate button triggers calculation

#### Results
- [ ] Status messages appear during generation
- [ ] Progress indicators show (if implemented)
- [ ] CSV file downloads automatically
- [ ] CSV file opens in Excel/spreadsheet app
- [ ] Data tables are properly formatted
- [ ] Width headers correct
- [ ] Height headers correct
- [ ] All scenarios included
- [ ] Lath type used shows correctly
- [ ] Weight calculations correct
- [ ] Axle selections correct
- [ ] Motor recommendations correct for each scenario

---

### ✅ Additional Features

#### Print Functionality
- [ ] Print button appears
- [ ] Print button triggers print dialog
- [ ] Print preview looks correct
- [ ] All relevant info included in print
- [ ] Graphics scale properly for print
- [ ] Page breaks appropriate

#### Admin Controls (if enabled)
- [ ] Admin controls toggle works
- [ ] Field labels show/hide
- [ ] Override options available

#### General UI
- [ ] All tabs switch correctly
- [ ] No flickering or layout issues
- [ ] Smooth transitions
- [ ] Responsive to window resize
- [ ] No z-index issues (overlapping elements)
- [ ] Scrolling works correctly

---

### ✅ Cross-Browser Testing

Test in multiple browsers to ensure compatibility:

#### Chrome/Edge
- [ ] All functionality works
- [ ] Graphics render correctly
- [ ] No console errors

#### Firefox
- [ ] All functionality works
- [ ] Graphics render correctly
- [ ] No console errors

#### Safari
- [ ] All functionality works
- [ ] Graphics render correctly
- [ ] No console errors

---

### ✅ Performance Testing

- [ ] Page loads in under 2 seconds
- [ ] Calculations complete quickly (<1 second)
- [ ] Graphics render smoothly
- [ ] No memory leaks (check after extended use)
- [ ] CSV generation completes in reasonable time
- [ ] No browser freezing during calculations

---

### ✅ Error Handling

- [ ] Handles missing data gracefully
- [ ] Shows user-friendly error messages
- [ ] Doesn't crash on invalid input
- [ ] Validates before calculating
- [ ] Catches and logs JavaScript errors
- [ ] Recovers from errors without reload

---

### ✅ Regression Testing

Compare results with original file:

- [ ] Same input → same weight calculation
- [ ] Same input → same axle selection
- [ ] Same input → same motor recommendation
- [ ] Same input → same endplate selection
- [ ] Same input → same graphics output
- [ ] Same input → same CSV report data

---

### ✅ Code Quality

- [ ] No JavaScript errors in console
- [ ] No CSS warnings
- [ ] All files load successfully
- [ ] Scripts load in correct order
- [ ] No 404 errors for resources
- [ ] Code is readable and organized

---

## 🎯 Sign-Off

### Testing Completed By:
**Name:** ___________________________  
**Date:** ___________________________  
**Browser(s):** _____________________  
**Version:** ________________________

### Issues Found:
```
1. ________________________________________
2. ________________________________________
3. ________________________________________
```

### Status:
- [ ] ✅ All tests passed - ready for production
- [ ] ⚠️ Minor issues found - acceptable for use with notes
- [ ] ❌ Major issues found - requires fixes before use

### Notes:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 📞 If Issues Are Found

1. **Document the issue:**
   - What were you doing?
   - What did you expect?
   - What actually happened?
   - Error messages (if any)?

2. **Check the console:**
   - Open browser DevTools (F12)
   - Look at Console tab
   - Copy any error messages

3. **Compare with original:**
   - Open original single-file version
   - Perform same action
   - Does it work there?

4. **Check file structure:**
   - Are all files present?
   - Are they in correct folders?
   - Did any file fail to load?

5. **Review recent changes:**
   - What was the last modification?
   - Can you undo it and test again?

---

**Remember:** Thorough testing now prevents problems later. Take your time with each section!
