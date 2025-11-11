// --- Step 1: Define Maximum Values and Get References ---
let maxCena = 100;      // Set your desired max value for Cost
let maxNabidka = 200;   // Set your desired max value for Supply
let maxPoptavka = 400;  // Set your desired max value for Demand

const sliders = {
    cena: {
        input: document.getElementById("cenaSlider"),
        valueDisplay: document.getElementById("cenaSliderValue"),
        textDisplay: document.getElementById("cenaText"),
        max: maxCena
    },
    nabidka: {
        input: document.getElementById("nabidkaSlider"),
        valueDisplay: document.getElementById("nabidkaSliderValue"),
        textDisplay: document.getElementById("nabidkaText"),
        max: maxNabidka
    },
    poptavka: {
        input: document.getElementById("poptavkaSlider"),
        valueDisplay: document.getElementById("poptavkaSliderValue"),
        textDisplay: document.getElementById("poptavkaText"),
        max: maxPoptavka
    }
};

// --- Step 2: Define the relationships between sliders ---
// These factors now work on a normalized scale (0-1)
const relationships = {
    cena: {
        poptavka: 1,
        nabidka: -1
    },
    nabidka: {
        cena: -1
    },
    poptavka: {
        cena: 1
    }
};

// Store the last known normalized values (0-1) before a move starts.
let initialNormalizedValues = {};

/**
 * --- Step 3: The Core Update Function (with Normalization) ---
 * @param {string} sourceSliderKey - The key of the slider being moved.
 */
function updateSliders(sourceSliderKey) {
    const sourceSlider = sliders[sourceSliderKey];
    // Convert current value to a normalized scale (0-1)
    let attemptedNormalizedValue = parseFloat(sourceSlider.input.value) / sourceSlider.max;

    // --- Constraint Calculation (on a 0-1 scale) ---
    let lowerLimitNormalized = 0;
    let upperLimitNormalized = 1;

    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;

        if (relationships[sourceSliderKey] && relationships[sourceSliderKey][targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            const initialSourceNormalized = initialNormalizedValues[sourceSliderKey];
            const initialTargetNormalized = initialNormalizedValues[targetSliderKey];

            const sourceNormAtTargetMax = initialSourceNormalized + (1 - initialTargetNormalized) / factor;
            const sourceNormAtTargetMin = initialSourceNormalized + (0 - initialTargetNormalized) / factor;

            if (factor > 0) {
                upperLimitNormalized = Math.min(upperLimitNormalized, sourceNormAtTargetMax);
                lowerLimitNormalized = Math.max(lowerLimitNormalized, sourceNormAtTargetMin);
            } else { // factor < 0
                upperLimitNormalized = Math.min(upperLimitNormalized, sourceNormAtTargetMin);
                lowerLimitNormalized = Math.max(lowerLimitNormalized, sourceNormAtTargetMax);
            }
        }
    }

    const finalSourceNormalizedValue = Math.max(lowerLimitNormalized, Math.min(upperLimitNormalized, attemptedNormalizedValue));

    // --- Update Sliders ---
    sourceSlider.input.value = finalSourceNormalizedValue * sourceSlider.max;

    const actualNormalizedChange = finalSourceNormalizedValue - initialNormalizedValues[sourceSliderKey];

    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;
        if (relationships[sourceSliderKey] && relationships[sourceSliderKey][targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            const newTargetNormalizedValue = initialNormalizedValues[targetSliderKey] + actualNormalizedChange * factor;
            sliders[targetSliderKey].input.value = newTargetNormalizedValue * sliders[targetSliderKey].max;
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
        const normalizedValue = value / slider.max;

        slider.valueDisplay.innerHTML = Math.round(value);

        if (normalizedValue < 0.15 || normalizedValue > 0.85) {
            slider.textDisplay.style.color = "red";
        } else {
            slider.textDisplay.style.color = "black";
        }
    }
}

/**
 * A function to capture the state of all sliders in a normalized format (0-1).
 */
function captureInitialValues() {
    for (const key in sliders) {
        initialNormalizedValues[key] = parseFloat(sliders[key].input.value) / sliders[key].max;
    }
}

// --- Step 4: Attach Event Listeners ---
for (const key in sliders) {
    sliders[key].input.addEventListener('mousedown', captureInitialValues);
    sliders[key].input.addEventListener('touchstart', captureInitialValues);
    sliders[key].input.addEventListener('input', () => {
        updateSliders(key);
    });
}

// --- Step 5: Initialize the display and values on page load ---
window.addEventListener('DOMContentLoaded', () => {
    for (const key in sliders) {
        sliders[key].input.max = sliders[key].max;
        sliders[key].input.value = sliders[key].max / 2; // Start in the middle
    }
    updateAllDisplays();
    captureInitialValues();

    const buttonMaslo = document.getElementById("btnMaslo");
    const buttonPivo = document.getElementById("btnPivo");
    const buttonPalivo = document.getElementById("btnPalivo");

    // --- Add Event Listener for Button 1 ---
    btnMaslo.addEventListener('click', () => {
        changeMaxValues(100, 200, 400); // Example: Low values
    });

    // --- Add Event Listener for Button 2 ---
    btnPivo.addEventListener('click', () => {
        changeMaxValues(500, 1000, 2000); // Example: Medium values
    });

    // --- Add Event Listener for Button 3 ---
    btnPalivo.addEventListener('click', () => {
        changeMaxValues(1500, 3000, 6000); // Example: High values
    });
});

/**
 * --- Step 6: Function to Update Max Values ---
 * This function updates the maximum values of the sliders and resets them.
 * @param {number} newMaxCena - The new maximum value for the cena slider.
 * @param {number} newMaxNabidka - The new maximum value for the nabidka slider.
 * @param {number} newMaxPoptavka - The new maximum value for the poptavka slider.
 */
function changeMaxValues(newMaxCena, newMaxNabidka, newMaxPoptavka) {
    // Update the max values in our main sliders object
    sliders.cena.max = newMaxCena;
    sliders.nabidka.max = newMaxNabidka;
    sliders.poptavka.max = newMaxPoptavka;

    // Update the 'max' attribute on the actual HTML elements
    sliders.cena.input.max = newMaxCena;
    sliders.nabidka.input.max = newMaxNabidka;
    sliders.poptavka.input.max = newMaxPoptavka;

    // Reset all sliders to their midpoint
    for (const key in sliders) {
        sliders[key].input.value = sliders[key].max / 2;
    }

    // Update the display to reflect the new values
    updateAllDisplays();

    // Recapture the initial normalized state for the next user interaction
    captureInitialValues();
}