// --- Step 1: Define the Market Matrix (All 9 Scenarios) ---
const marketMatrix = {
    maslo: {
        maxValues: { cena: 167, nabidka: 1000, poptavka: 1000 },
        effects: {
            default: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.27, nabidka: 0.5, poptavka: 0.5 } },
            covid: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.16, nabidka: 0.5, poptavka: 0.65 } },
            ukrajina: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.33, nabidka: 0.3, poptavka: 0.4 } },
            socialismus: { relationships: { cena: { poptavka: -0.1, nabidka: 0.1 } }, startValuesNormalized: { cena: 1, nabidka: 0.35, poptavka: 0.55 } }
        }
    },
    pivo: {
        maxValues: { cena: 96, nabidka: 1000, poptavka: 1000 },
        effects: {
            default: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.5, nabidka: 0.5, poptavka: 0.6 } },
            covid: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.7, nabidka: 0.3, poptavka: 0.35 } },
            ukrajina: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.72, nabidka: 0.5, poptavka: 0.5 } },
            socialismus: { relationships: { cena: { poptavka: -0.1, nabidka: 0.1 } }, startValuesNormalized: { cena: 0.73, nabidka: 0.7, poptavka: 0.9 } }
        }
    },
    palivo: {
        maxValues: { cena: 50, nabidka: 1000, poptavka: 1000 },
        effects: {
            default: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.62, nabidka: 0.5, poptavka: 0.65 } },
            covid: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 0.48, nabidka: 0.5, poptavka: 0.1 } },
            ukrajina: { relationships: { cena: { poptavka: -1, nabidka: 1 } }, startValuesNormalized: { cena: 1, nabidka: 0.2, poptavka: 0.8 } },
            socialismus: { relationships: { cena: { poptavka: -0.05, nabidka: 0.05 } }, startValuesNormalized: { cena: 0.6, nabidka: 0.5, poptavka: 0.3 } }
        }
    }
};

// --- Step 2: State Management and Initial Setup ---
let activeProductKey = 'maslo'; // 'maslo', 'pivo', or 'palivo'
let activeScenarioKey = 'default'; // 'default', 'covid', 'ukrajina', 'socialismus'

const sliders = {
    cena: { input: document.getElementById("cenaSlider"), valueDisplay: document.getElementById("cenaSliderValue"), textDisplay: document.getElementById("cenaText"), max: 100 },
    nabidka: { input: document.getElementById("nabidkaSlider"), valueDisplay: document.getElementById("nabidkaSliderValue"), textDisplay: document.getElementById("nabidkaText"), max: 200 },
    poptavka: { input: document.getElementById("poptavkaSlider"), valueDisplay: document.getElementById("poptavkaSliderValue"), textDisplay: document.getElementById("poptavkaText"), max: 400 }
};

let relationships = {};
let initialNormalizedValues = {};

// --- Core Functions (These do not need to change) ---
function updateSliders(sourceSliderKey) {
    const sourceSlider = sliders[sourceSliderKey];
    let attemptedNormalizedValue = parseFloat(sourceSlider.input.value) / sourceSlider.max;
    let lowerLimitNormalized = 0, upperLimitNormalized = 1;
    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;
        if (relationships[sourceSliderKey]?.[targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            const initialSourceNormalized = initialNormalizedValues[sourceSliderKey];
            const initialTargetNormalized = initialNormalizedValues[targetSliderKey];
            const sourceNormAtTargetMax = initialSourceNormalized + (1 - initialTargetNormalized) / factor;
            const sourceNormAtTargetMin = initialSourceNormalized + (0 - initialTargetNormalized) / factor;
            if (factor > 0) {
                upperLimitNormalized = Math.min(upperLimitNormalized, sourceNormAtTargetMax);
                lowerLimitNormalized = Math.max(lowerLimitNormalized, sourceNormAtTargetMin);
            } else {
                upperLimitNormalized = Math.min(upperLimitNormalized, sourceNormAtTargetMin);
                lowerLimitNormalized = Math.max(lowerLimitNormalized, sourceNormAtTargetMax);
            }
        }
    }
    const finalSourceNormalizedValue = Math.max(lowerLimitNormalized, Math.min(upperLimitNormalized, attemptedNormalizedValue));
    sourceSlider.input.value = finalSourceNormalizedValue * sourceSlider.max;
    const actualNormalizedChange = finalSourceNormalizedValue - initialNormalizedValues[sourceSliderKey];
    for (const targetSliderKey in sliders) {
        if (sourceSliderKey === targetSliderKey) continue;
        if (relationships[sourceSliderKey]?.[targetSliderKey]) {
            const factor = relationships[sourceSliderKey][targetSliderKey];
            const newTargetNormalizedValue = initialNormalizedValues[targetSliderKey] + actualNormalizedChange * factor;
            sliders[targetSliderKey].input.value = newTargetNormalizedValue * sliders[targetSliderKey].max;
        }
    }
    updateAllDisplays();
}
function updateAllDisplays() { for (const key in sliders) { const slider = sliders[key]; const value = parseFloat(slider.input.value); const normalizedValue = value / slider.max; if (slider.valueDisplay) slider.valueDisplay.innerHTML = Math.round(value); if (normalizedValue < 0.15 || normalizedValue > 0.85) { slider.textDisplay.style.color = "red"; } else { slider.textDisplay.style.color = "black"; } } }
function captureInitialValues() { for (const key in sliders) { initialNormalizedValues[key] = parseFloat(sliders[key].input.value) / sliders[key].max; } }

// --- NEW: Unified State Update Function ---
/**
 * This is the new master function. It reads the active state and updates everything.
 */
function updateMarketState() {
    const productData = marketMatrix[activeProductKey];
    const scenarioData = productData.effects[activeScenarioKey];

    if (!productData || !scenarioData) {
        console.error("Invalid state:", activeProductKey, activeScenarioKey);
        return;
    }

    // 1. Update max values from the selected product
    for (const key in productData.maxValues) {
        sliders[key].max = productData.maxValues[key];
        sliders[key].input.max = productData.maxValues[key];
    }

    // 2. Update relationships from the selected scenario
    relationships = scenarioData.relationships;

    // 3. Set the sliders to the scenario's starting values
    for (const key in scenarioData.startValuesNormalized) {
        const normalizedValue = scenarioData.startValuesNormalized[key];
        sliders[key].input.value = normalizedValue * sliders[key].max;
    }

    // 4. Sync the display and capture the new state
    updateAllDisplays();
    captureInitialValues();

    console.log(`State Updated: Product=${activeProductKey}, Scenario=${activeScenarioKey}`);
}

// --- Event Listeners ---
window.addEventListener('DOMContentLoaded', () => {
    // Initial setup on page load
    updateMarketState();

    // Attach listeners to sliders
    for (const key in sliders) {
        sliders[key].input.addEventListener('mousedown', captureInitialValues);
        sliders[key].input.addEventListener('touchstart', captureInitialValues);
        sliders[key].input.addEventListener('input', () => updateSliders(key));
    }

    // BUTTON Event Listeners
    document.getElementById("btnMaslo").addEventListener('click', () => {
        activeProductKey = 'maslo';
        updateMarketState();
    });
    document.getElementById("btnPivo").addEventListener('click', () => {
        activeProductKey = 'pivo';
        updateMarketState();
    });
    document.getElementById("btnPalivo").addEventListener('click', () => {
        activeProductKey = 'palivo';
        updateMarketState();
    });

    // CHECKBOX Event Listeners
    const checkboxes = {
        checkCovid: 'covid',
        checkUkrajina: 'ukrajina',
        checkSocialismus: 'socialismus'
    };
    const allCheckboxes = Object.keys(checkboxes).map(id => document.getElementById(id));

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                // Set the new active scenario
                activeScenarioKey = checkboxes[event.target.id];
                // Uncheck all others
                allCheckboxes.forEach(cb => { if (cb !== event.target) cb.checked = false; });
            } else {
                // If unchecked, revert to default
                activeScenarioKey = 'default';
            }
            updateMarketState();
        });
    });
});