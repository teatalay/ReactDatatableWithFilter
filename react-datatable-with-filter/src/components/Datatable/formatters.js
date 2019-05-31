import moment from "moment";

import { defaultDateFormat } from "../../constants";

export default function(formatters, cellData, rowData) {
  if (!formatters || !formatters.length) return cellData;
  for (let index = 0; index < formatters.length; index++) {
    const element = formatters[index];
    const formatter = getFormatter(element ? element.type : "");
    if (formatter) cellData = formatter(cellData, element.props);
  }
  return cellData;
}

function getFormatter(formatter) {
  switch (formatter) {
    case "date":
      return date;
    case "bool":
      return bool;
    case "lower":
      return lower;
    case "upper":
      return upper;
    case "cut":
      return cut;
    default:
      return data => data;
  }
}

function date(dateWillFormat, { format = defaultDateFormat }) {
  if (!dateWillFormat) return dateWillFormat;
  return moment(dateWillFormat).format(format);
}

function bool(text) {
  return text ? "✔" : "X";
}

function lower(text) {
  return text.toLowerCase();
}

function upper(text) {
  return text.toUpperCase();
}

function cut(text, { size = 50 }) {
  return text.substr(0, size);
}

/*
  Formatters row data da almalı.
  union ve condition eklenebilir.
*/
