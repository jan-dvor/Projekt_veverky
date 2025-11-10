// --- Step 1: Get references to all slider and text elements ---
const sliders = {
    cena: {
        input: document.getElementById("cenaSlider"),
        valueDisplay: document.getElementById("cenaSliderValue"),
        textDisplay: document.getElementById("cenaText")
    },
    nabidka: {
        input: document.getElementById("nabidkaSlider"),
        valueDisplay: document.getElementById("nabidkaSliderValue"),
        textDisplay: document.getElementById("nabidkaText")
    },
    poptavka: {
        input: document.getElementById("poptavkaSlider"),
        valueDisplay: document.getElementById("poptavkaSliderValue"),
        textDisplay: document.getElementById("poptavkaText")
    }
};

// --- Step 2: Define the relationships between sliders ---
const relationships = {
    cena: {
        poptavka: 1,
    },
    nabidka: {
        cena: -1
    },
    poptavka: {
        cena: 1
    }
};

// Store the last known values before a move starts.
let initialValues = {};

/**
 * --- Step 3: The Core Update Function (New, Robust Logic) ---
 * This function calculates movement constraints and updates all sliders.
 * @param {string} sourceSliderKey - The key of the slider being moved.
 */
function updateSliders(sourceSliderKey) {
    const sourceSlider = sliders[sourceSliderKey];
    let attemptedValue = parseFloat(sourceSlider.input.value);

    // --- Constraint Calculation ---
    // Start with the widest possible limits: the slider's own min/max.
    let lowerLimit = 0;
    let upperLimit = 100;

    // Look at every target slider to see if it imposes a stricter limit.
    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;

        if (relationships[sourceSliderKey] && relationships[sourceSliderKey][targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            const initialSourceValue = initialValues[sourceSliderKey];
            const initialTargetValue = initialValues[targetSliderKey];

            // Calculate the source values that would make the target hit 0 or 100.
            // Formula: sourceValue = initialSourceValue + (targetLimit - initialTargetValue) / factor
            const sourceValAtTargetMax = initialSourceValue + (100 - initialTargetValue) / factor;
            const sourceValAtTargetMin = initialSourceValue + (0 - initialTargetValue) / factor;

            // The factor's sign determines which value is the new upper/lower limit.
            if (factor > 0) {
                upperLimit = Math.min(upperLimit, sourceValAtTargetMax);
                lowerLimit = Math.max(lowerLimit, sourceValAtTargetMin);
            } else { // factor < 0
                upperLimit = Math.min(upperLimit, sourceValAtTargetMin);
                lowerLimit = Math.max(lowerLimit, sourceValAtTargetMax);
            }
        }
    }

    // Clamp the user's attempted value within the calculated limits.
    const finalSourceValue = Math.max(lowerLimit, Math.min(upperLimit, attemptedValue));

    // Update the source slider's position visually.
    sourceSlider.input.value = finalSourceValue;
    
    // Calculate the actual change and update all related sliders.
    const actualChange = finalSourceValue - initialValues[sourceSliderKey];

    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;
        if (relationships[sourceSliderKey] && relationships[sourceSliderKey][targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            sliders[targetSliderKey].input.value = initialValues[targetSliderKey] + actualChange * factor;
        }
    }

    updateAllDisplays();
}

/**
 * A helper function to update the text display for all sliders.
 */
function updateAllDisplays() {
    for (const key in sliders) {
        const slider = sliders[key];
        const value = parseFloat(slider.input.value);

        slider.valueDisplay.innerHTML = Math.round(value);

        if (value < 15 || value > 85) {
            slider.textDisplay.style.color = "red";
        } else {
            slider.textDisplay.style.color = "black";
        }
    }
}

/**
 * A function to capture the state of all sliders.
 */
function captureInitialValues() {
    for (const key in sliders) {
        initialValues[key] = parseFloat(sliders[key].input.value);
    }
}

// --- Step 4: Attach Event Listeners ---
for (const key in sliders) {
    // 'mousedown' and 'touchstart' capture the state right before a drag begins.
    sliders[key].input.addEventListener('mousedown', captureInitialValues);
    sliders[key].input.addEventListener('touchstart', captureInitialValues);

    // 'input' fires continuously during the drag.
    sliders[key].input.addEventListener('input', () => {
        updateSliders(key);
    });
}

// --- Step 5: Initialize the display and values on page load ---
window.addEventListener('DOMContentLoaded', () => {
    // Loop through each slider in our sliders object
    for (const key in sliders) {
        // Set its input element's value to 50
        sliders[key].input.value = 50;
    }

    // Now that the slider positions are set, update the text displays to match.
    updateAllDisplays();

    // It's also good practice to sync the initial state for the very first drag.
    captureInitialValues();
});