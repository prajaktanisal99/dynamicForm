document.addEventListener("DOMContentLoaded", () => {
  const jsonDisplay = document.getElementById("jsonDisplay");
  jsonDisplay.value = JSON.stringify(formJson, null, 2);

  const formContainer = document.getElementById("dynamicForm");
  renderForm(formJson, formContainer);

  jsonDisplay.addEventListener("input", updateFormFromJSON);

  const reloadButton = document.getElementById("reload");
  reloadButton.addEventListener("click", () => {
    jsonDisplay.value = JSON.stringify(formJson, null, 2);
    updateFormFromJSON();
  });
});

export function updateFormFromJSON() {
  const jsonDisplay = document.getElementById("jsonDisplay");
  let updatedJson;

  try {
    updatedJson = JSON.parse(jsonDisplay.value);
  } catch (error) {
    console.error("Invalid JSON:", error);
    return;
  }

  const formContainer = document.getElementById("dynamicForm");
  formContainer.innerHTML = "";
  renderForm(updatedJson, formContainer);
}

function renderForm(formJson, container) {
  const form = document.createElement("form");
  form.id = "generatedForm";

  const title = document.createElement("h2");
  title.textContent = formJson.title;
  form.appendChild(title);

  formJson.fields.forEach((field) => {
    const fieldElement = renderField(field);
    form.appendChild(fieldElement);
  });

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";
  form.appendChild(submitButton);

  container.appendChild(form);
}

function renderField(field) {
  const div = document.createElement("div");
  div.className = "form-field";
  div.id = `${field.id}_container`;

  const label = document.createElement("label");
  label.htmlFor = field.id;
  label.innerHTML = `${field.label} ${
    field.required ? "<span class='required'>*</span>" : ""
  }`;
  div.appendChild(label);

  let input;

  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "tel":
    case "date":
    case "time":
    case "number":
    case "color":
    case "url":
      input = document.createElement("input");
      input.type = field.type;
      input.id = field.id;
      input.name = field.id;
      addAttributes(input, field);
      break;

    case "textarea":
      input = document.createElement("textarea");
      input.id = field.id;
      input.name = field.id;
      addAttributes(input, field);
      break;

    case "file":
      input = document.createElement("input");
      input.type = "file";
      input.id = field.id;
      input.name = field.id;
      addAttributes(input, field);
      break;

    case "select":
      input = document.createElement("select");
      input.id = field.id;
      input.name = field.id;
      if (field.required) input.required = true;

      field.options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        input.appendChild(opt);
      });
      break;

    case "radio":
      field.options.forEach((option) => {
        const wrapper = document.createElement("div");

        input = document.createElement("input");
        input.type = "radio";
        input.id = `${field.id}_${option.value}`;
        input.name = field.id;
        input.value = option.value;

        const optLabel = document.createElement("label");
        optLabel.htmlFor = input.id;
        optLabel.textContent = option.label;

        wrapper.appendChild(input);
        wrapper.appendChild(optLabel);
        div.appendChild(wrapper);

        input.addEventListener("change", (e) => {
          handleDependentQuestions(field, e.target.value);
        });
      });
      return div;

    case "checkbox":
      if (field.options) {
        // For checkboxes with options (e.g., multiple checkboxes)
        field.options.forEach((option) => {
          const wrapper = document.createElement("div");

          input = document.createElement("input");
          input.type = "checkbox";
          input.id = `${field.id}_${option.value}`;
          input.name = field.id;
          input.value = option.value;

          const optLabel = document.createElement("label");
          optLabel.htmlFor = input.id;
          optLabel.textContent = option.label;

          wrapper.appendChild(input);
          wrapper.appendChild(optLabel);
          div.appendChild(wrapper);
        });
      } else {
        // For fields without options (e.g., a Yes/No radio switch)
        const switchDiv = document.createElement("div");
        switchDiv.className = "yes-no-switch";

        // Generate 'Yes' and 'No' radio buttons
        ["Yes", "No"].forEach((value) => {
          const wrapper = document.createElement("div");

          input = document.createElement("input");
          input.type = "radio";
          input.id = `${field.id}_${value.toLowerCase()}`;
          input.name = field.id;
          input.value = value.toLowerCase();

          const optLabel = document.createElement("label");
          optLabel.htmlFor = input.id;
          optLabel.textContent = value;

          wrapper.appendChild(input);
          wrapper.appendChild(optLabel);
          switchDiv.appendChild(wrapper);
        });

        div.appendChild(switchDiv);
      }
      return div;

    default:
      console.warn(`Unsupported field type: ${field.type}`);
      return div;
  }

  div.appendChild(input);
  return div;
}

function addAttributes(input, field) {
  if (field.required) input.required = true;
  if (field.minLength) input.minLength = field.minLength;
  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.min) input.min = field.min;
  if (field.max) input.max = field.max;
  if (field.pattern) input.pattern = field.pattern;
}

function handleDependentQuestions(field, value) {
  if (field.dependentQuestions) {
    field.dependentQuestions.forEach((dependentQuestion) => {
      const existingElement = document.getElementById(
        `${dependentQuestion.id}_container`
      );

      if (value === "yes") {
        if (!existingElement) {
          const parentContainer = document.getElementById(
            `${field.id}_container`
          );
          const dependentField = renderField(dependentQuestion);
          parentContainer.appendChild(dependentField);
        }
      } else if (existingElement) {
        existingElement.remove();
      }
    });
  }
}
