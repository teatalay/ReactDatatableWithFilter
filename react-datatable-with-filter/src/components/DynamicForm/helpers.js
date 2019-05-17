import moment from "moment";
import { inputTypes } from "./constants";
import { defaultDateValueFormat, defaultDateFormat } from "../../constants";


export function getValueByInputType(e, type) {
  switch (type) {
    case inputTypes.input:
    case inputTypes.password:
    case inputTypes.radio:
    case inputTypes.textarea:
      return e.target.value;
    case inputTypes.checkbox:
      return e.target.checked;
    case inputTypes.datepicker:
      return (
        moment(e, defaultDateFormat).format(defaultDateValueFormat) +
        "T00:00:00Z"
      );
    case inputTypes.select:
      return e;
    default:
      return e;
  }
}

export function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => {
    if (typeof fieldsError[field] === "object")
      return hasErrors(fieldsError[field]);
    return fieldsError[field];
  });
}

export function getError(
  isFieldTouched,
  getFieldError,
  fieldName,
  errorOnFocus
) {
  const isFocused = isFieldTouched(fieldName);
  const error = getFieldError(fieldName) || "";
  return {
    hasError: !!(errorOnFocus ? isFocused && error : error),
    error,
    validateStatus: error ? "error" : ""
  };
}

export function getInputType(alias) {
  for (const key in inputTypes) {
    if (inputTypes.hasOwnProperty(key)) {
      const element = inputTypes[key];
      if (element.alias === alias) return element;
    }
  }
  return getDefaultInputType();
}

export function getDefaultInputType() {
  for (const key in inputTypes) {
    if (inputTypes.hasOwnProperty(key)) {
      const element = inputTypes[key];
      if (element.defaultType) return element;
    }
  }
}
