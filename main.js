
//CENA
const cenaSlider = document.getElementById("cenaSlider");
const cenaSliderValue = document.getElementById("cenaSliderValue");
const cenaText = document.getElementById("cenaText");

cenaSlider.oninput = function() {
  const Value = this.value;
  cenaSliderValue.innerHTML = Value;
  if (Value < 15 || Value > 85) {
    cenaText.style.color = "red";
  } else {
    cenaText.style.color = "black";
}
}

//NABIDKA
const nabidkaSlider = document.getElementById("nabidkaSlider");
const nabidkaSliderValue = document.getElementById("nabidkaSliderValue");
const nabidkaText = document.getElementById("nabidkaText");

nabidkaSlider.oninput = function() {
  const Value = this.value;
  nabidkaSliderValue.innerHTML = Value;
  if (Value < 15 || Value > 85) {
    nabidkaText.style.color = "red";
  } else {
    nabidkaText.style.color = "black";
}
}

//POPTAVKA
const poptavkaSlider = document.getElementById("poptavkaSlider");
const poptavkaSliderValue = document.getElementById("poptavkaSliderValue");
const poptavkaText = document.getElementById("poptavkaText");

poptavkaSlider.oninput = function() {
  const Value = this.value;
  poptavkaSliderValue.innerHTML = Value;
  if (Value < 15 || Value > 85) {
    poptavkaText.style.color = "red";
  } else {
    poptavkaText.style.color = "black";
}
}