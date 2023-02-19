const formElement = document.querySelector(".calculator__form form");
const inputElements = formElement.querySelectorAll(".form__input");
const amountCreditInput = formElement.querySelector("#amountCredit");
const leaseTermInput = formElement.querySelector("#leaseTerm");
const initialFeeSlider = formElement.querySelector("#initFee");
const initialFeeInput = formElement.querySelector("#initialFee");
const amountDealOutput = formElement.querySelector("#sum");
const monthlyPaymentOutput = formElement.querySelector("#monthlyPayment");
const percentOutput = formElement.querySelector("#percent");
const submitButton = formElement.querySelector(".form__btn");

const formatDigit = wNumb({
  thousand: ' ',
});

const formatDigitUnit = wNumb({
	thousand: ' ',
	suffix: ' ₽',
});

const updateInitialFeeOptions = (value) => {
  const RATIO = {
    min: 0.1,
    max: 0.6
  }
  const minVal = Math.round(formatDigit.from(value) * RATIO.min);
  const maxVal = Math.round(formatDigit.from(value) * RATIO.max);
  initialFeeInput.dataset.min = minVal;
  initialFeeInput.dataset.max = maxVal;
  initialFeeSlider.noUiSlider.updateOptions({
    range: {
      min: minVal,
      max: maxVal,
    },
  });
}

const getValidValue = (value, min, max) => {
  const tempMin = Math.min(min, max);
  const tempMax = Math.max(min, max);

  const realMin = Math.ceil(tempMin);
  const realMax = Math.floor(tempMax);

  if (value < realMin) {
    value = realMin;
  }

  if (value > realMax) {
    value = realMax;
  }

  return value;
}

if (inputElements === null) {
  throw new Error('Элемент inputElements не найден');
}

inputElements.forEach(function (inputElement) {
  const sliderElement = inputElement.parentElement.querySelector(".form__slider");
  if (sliderElement === null) {
    throw new Error('sliderElement не найден');
  }
  let start = inputElement.value ? +inputElement.value : 0;
  const min = inputElement.dataset.min ? +inputElement.dataset.min : 0;
  const max = inputElement.dataset.max ? +inputElement.dataset.max : 0;

  start = getValidValue(start, min, max);

  noUiSlider.create(sliderElement, {
    start: start,
    connect: "lower",
    step: 1,
    range: {
      min: min,
      max: max,
    },
  });

  if (sliderElement.classList.contains("form__slider--amount")) {
    sliderElement.noUiSlider.on("slide", function (values, handle) {
      updateInitialFeeOptions(values[handle]);
    });
  }

  inputElement.addEventListener("change", function () {
    if (inputElement.classList.contains("form__input--init")) {
      this.value = formatDigitUnit.from(this.value);
    } else {
      this.value = formatDigit.from(this.value);
    }

    getValidValue(this.value, min, max);

    sliderElement.noUiSlider.set(this.value);
    calculateCost();

    if (inputElement.classList.contains("form__input--amount")) {
        updateInitialFeeOptions(this.value);
    }
  });

  sliderElement.noUiSlider.on("update", function (values, handle) {
    if (sliderElement.classList.contains("form__slider--init")) {
      inputElement.value = formatDigitUnit.to(+values[handle]);
    } else {
      inputElement.value = formatDigit.to(+values[handle]);
    }
    calculateCost();
  });
});

function calculateCost() {
  const amountCreditValue = formatDigit.from(amountCreditInput.value);
  const initialFeeValue = formatDigitUnit.from(initialFeeInput.value);
  const leaseTermValue = formatDigit.from(leaseTermInput.value);
  const monthlyPaymentValue = Math.round((amountCreditValue - initialFeeValue) * (0.05 * Math.pow((1 + 0.05), leaseTermValue) / (Math.pow((1 + 0.05), leaseTermValue) - 1)));
  const amountDealValue = Math.round(initialFeeValue + leaseTermValue * monthlyPaymentValue);
  percentOutput.value = Math.round((initialFeeValue * 100) / amountCreditValue);
  amountDealOutput.value = formatDigit.to(amountDealValue);
  monthlyPaymentOutput.value = formatDigit.to(monthlyPaymentValue);
}
calculateCost();
updateInitialFeeOptions(amountCreditInput.value);

formElement.addEventListener('keydown', function(evt) {
  if(evt.keyCode === 13) {
     evt.preventDefault();
     return;
  }
});

formElement.addEventListener("submit", (evt) => {
  evt.preventDefault();
  submitButton.disabled = true;
  const formData = new FormData(evt.target);
  const data = {};
  formData.forEach(function (value, key) {
    data[key] = formatDigit.from(value);
  });
  alert(JSON.stringify(data));
});
