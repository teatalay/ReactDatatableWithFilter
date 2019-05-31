import { isDefined } from "../utils";

export const httpMethods = {
  GET: "GET",
  POST: "POST",
  OPTIONS: "OPTIONS",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE"
};

export const responseTypes = {
  success: "success",
  fail: "fail"
};

export const languages = {
  tr: "tr",
  en: "en"
};

export const filterTypes = {
  equals: (a, b) => a === b,
  contains: (a, b) =>
    isDefined(a) && isDefined(b)
      ? a.toString().indexOf(b.toString()) !== -1
      : false
};

export const formLayoutTypes = {
  inline: "inline",
  block: "block"
};

export const validationTypes = {
  string: {
    type: "string",
    message: `The input is not valid String!`
  },
  number: {
    type: "number",
    message: `The input is not valid Number!`
  },
  boolean: {
    type: "boolean",
    message: `The input is not valid Boolean!`
  },
  method: {
    type: "method",
    message: `The input is not valid Method!`
  },
  regexp: function(pattern, name) {
    return {
      type: "enum",
      pattern,
      message: `The input is not valid via ${pattern}`
    };
  },
  integer: {
    type: "integer",
    message: `The input is not valid Integer!`
  },
  float: {
    type: "float",
    message: `The input is not valid Float Number!`
  },
  array: {
    type: "array",
    message: `The input is not valid Array!`
  },
  object: {
    type: "object",
    message: `The input is not valid Object!`
  },
  enum: function(enums, name) {
    return {
      type: "enum",
      enum: enums,
      message: `The input is not exist in ${name}`
    };
  },
  date: {
    type: "date",
    message: `The input is not valid Date!`
  },
  url: {
    type: "url",
    message: `The input is not valid URL!`
  },
  hex: {
    type: "hex",
    message: `The input is not valid Hex!`
  },
  email: {
    type: "email",
    message: `The input is not valid E-mail!`
  },
  required: function(name) {
    return {
      required: true,
      message: `${name} is required`
    };
  },
  min: function(number) {
    return {
      min: number,
      message: `The Input should be greater than ${number}`
    };
  },
  max: function(number) {
    return {
      max: number,
      message: `The Input should be less than ${number}`
    };
  },
  size: function(min, max, size) {
    return {
      max: isDefined(max) ? max : null,
      min: isDefined(min) ? min : null,
      len: size,
      message: `The Input should between ${min || "-∞"} - ${max || "∞"}`
    };
  },
  manual: function(customValidator) {
    return {
      validator(rule, value, callback, source, options) {
        var errors = [];
        errors = customValidator(value, rule);
        callback(errors);
      }
    };
  }
};

export const tagColors = {
  magenta: "magenta",
  volcano: "volcano",
  blue: "blue",
  cyan: "cyan",
  green: "green"
};

export const labelAligns = {
  left: "left",
  right: "right"
};
