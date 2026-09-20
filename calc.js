const display = document.getElementById("display");
const preview = document.getElementById("preview");
let justCalculated = false;

const operators = ["+", "-", "×", "÷"];

function addToDisplay(val) {
  if (val === "/") val = "÷";
  if (val === "*") val = "×";

  if (justCalculated) {
    if (!operators.includes(val) && val !== "%") {
      display.value = "";
    }
    justCalculated = false;
  }

  if (display.value === "Error") {
    display.value = "";
  }

  // baad
  if (val === "%") {
    const parts = display.value.split(/([+\-×÷])/);
    const lastNum = parts[parts.length - 1];
    if (lastNum === "" || isNaN(Number(lastNum))) return;

    const operator = parts.length >= 3 ? parts[parts.length - 2] : null;
    const prevNum = parts.length >= 3 ? parts[parts.length - 3] : null;

    let percentValue;
    if (
      (operator === "+" || operator === "-") &&
      prevNum !== null &&
      !isNaN(Number(prevNum))
    ) {
      // contextual: "B%" ka matlab "prevNum ka B percent"
      percentValue = (Number(prevNum) * Number(lastNum)) / 100;
    } else {
      // plain percentage — bare number ho, ya × / ÷ ke baad ho
      percentValue = Number(lastNum) / 100;
    }

    parts[parts.length - 1] = String(percentValue);
    display.value = parts.join("");
    updatePreview();
    return;
  }

  const last = display.value.slice(-1);

  if (val === ".") {
    const parts = display.value.split(/[+\-×÷]/);
    const currentNumber = parts[parts.length - 1];
    if (currentNumber.includes(".")) {
      return;
    }
  }

  if (operators.includes(last) && operators.includes(val)) {
    display.value = display.value.slice(0, -1);
  }

  display.value += val;
  updatePreview();
}

function calculate() {
  try {
    if (display.value.trim() === "") return;
    if (!/^[0-9+\-×÷. ]+$/.test(display.value)) {
      display.value = "Error";
      updatePreview();
      setTimeout(() => {
        display.value = "";
      }, 1200);
      return;
    }

    const expression = display.value.replace(/×/g, "*").replace(/÷/g, "/");
    const result = eval(expression);

    if (!isFinite(result)) {
      display.value = "Error";
      updatePreview();
      setTimeout(() => {
        display.value = "";
      }, 1200);
      return;
    }

    display.value = Number(result.toFixed(10));
    justCalculated = true;
    updatePreview();
  } catch {
    display.value = "Error";
    updatePreview();
    setTimeout(() => {
      display.value = "";
    }, 1200);
  }
}

function clearDisplay() {
  display.value = "";
  updatePreview();
}

function Backspace() {
  display.value = display.value.slice(0, -1);
  updatePreview();
}

function updatePreview() {
  try {
    if (
      !/^[0-9+\-×÷. ]+$/.test(display.value) ||
      display.value.trim() === "" ||
      !/[0-9][+\-×÷]/.test(display.value)
    ) {
      preview.textContent = "";
      return;
    }
    const expression = display.value.replace(/×/g, "*").replace(/÷/g, "/");
    const result = eval(expression);
    const roundedResult = Number(result.toFixed(10));
    preview.textContent = isFinite(roundedResult) ? `= ${roundedResult}` : "";
  } catch {
    preview.textContent = "";
  }
}

document.addEventListener("keydown", (e) => {
  pressKey(e.key);
  if (e.key >= "0" && e.key <= "9") {
    addToDisplay(e.key);
  }

  if (["+", "-", "*", "/", "%", "."].includes(e.key)) {
    addToDisplay(e.key);
  }

  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  }

  if (e.key === "Backspace") {
    Backspace();
  }

  if (e.key === "Delete" || e.key === "Escape") {
    clearDisplay();
  }
});
document.addEventListener("keyup", (e) => {
  releaseKey(e.key);
});

function pressKey(key) {
  const selectorKey = key === "Delete" ? "Escape" : key;
  const btn = document.querySelector(`[data-key="${selectorKey}"]`);
  if (!btn) return;
  btn.classList.add("key-pressed");
  if (btn.id === "equalsBtn") btn.classList.add("key-pressed-primary");
}

function releaseKey(key) {
  const selectorKey = key === "Delete" ? "Escape" : key;
  const btn = document.querySelector(`[data-key="${selectorKey}"]`);
  if (!btn) return;
  btn.classList.remove("key-pressed", "key-pressed-primary");
}
