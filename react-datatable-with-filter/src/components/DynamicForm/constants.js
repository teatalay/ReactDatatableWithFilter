import React from "react";
import { Input, Checkbox, Radio, Select, DatePicker } from "antd";
import RemoteSelect from "../RemoteSelect";
import AutoComplete from "../AutoComplete";
import { isDefinedAndNotEmpty } from "../../utils";
import { defaultDateFormat } from "../../constants";

const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Option = Select.Option;

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 24 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 }
  }
};
export const formItemLayoutVertical = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 8 },
    md: { span: 7 }
  },
  wrapperCol: {
    xs: { span: 16 },
    sm: { span: 16 },
    md: { span: 10 }
  }
};
export const colVerticalType = {
  span: 24
};

export const colHorizontalType = {
  xs: { span: 24 },
  sm: { span: 12 },
  md: { span: 12 },
  lg: { span: 6 }
};

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 24,
      offset: 0
    }
  }
};

export const formLayout = {
  xs: {
    span: 24,
    offset: 0
  },
  sm: {
    span: 24,
    offset: 0
  },
  lg: {
    span: 24,
    offset: 0
  }
};

export const filterLayout = {
  xs: {
    span: 24,
    offset: 0
  },
  sm: {
    span: 24,
    offset: 0
  },
  lg: {
    span: 24,
    offset: 0
  }
};

export const inputSpace = {
  xs: 0,
  sm: 16,
  md: 16
};

export const inputTypes = {
  input: {
    creator: function(fieldProps = {}, wrapperProps) {
      return <Input {...fieldProps} type="text" {...wrapperProps} />;
    },
    alias: "text",
    defaultType: true,
    canWorkWithKeyPress: true
  },
  password: {
    creator: function(fieldProps = {}, wrapperProps) {
      return <Input {...fieldProps} {...wrapperProps} type="password" />;
    },
    alias: "password",
    canWorkWithKeyPress: true
  },
  textarea: {
    creator: function(fieldProps = {}, wrapperProps) {
      return <TextArea {...fieldProps} {...wrapperProps} />;
    },
    alias: "area",
    canWorkWithKeyPress: true
  },
  datepicker: {
    creator: function(fieldProps = {}, wrapperProps) {
      const { dateFormat = defaultDateFormat } = fieldProps;
      return (
        <DatePicker {...fieldProps} {...wrapperProps} format={dateFormat} />
      );
    },
    alias: "date"
  },
  select: {
    creator: function(
      { options = [], initialValue, ...props } = {},
      wrapperProps
    ) {
      const optionSelectors = options.map((item, index) => (
        <Option key={index} value={item.value}>
          {isDefinedAndNotEmpty(item.label) ? item.label : item.value}
        </Option>
      ));
      return (
        <Select {...props} {...wrapperProps}>
          {optionSelectors}
        </Select>
      );
    },
    alias: "dropdown",
    canMultiple: true,
    canKeyValueResult: true
  },
  remoteselect: {
    creator: function(
      {
        options = [],
        URLKey,
        valueKeyName,
        labelKeyName,
        objectKey,
        initialValue,
        url,
        ...props
      } = {},
      wrapperProps
    ) {
      return (
        <RemoteSelect
          url={url}
          valueKeyName={valueKeyName}
          labelKeyName={labelKeyName}
          objectKey={objectKey}
          {...props}
          {...wrapperProps}
        />
      );
    },
    alias: "remoteselect",
    remote: true,
    canMultiple: true,
    canKeyValueResult: true
  },
  autocomplete: {
    creator: function(
      {
        options = [],
        URLKey,
        valueKeyName,
        labelKeyName,
        objectKey,
        initialValue,
        url,
        ...props
      } = {},
      wrapperProps
    ) {
      return (
        <AutoComplete
          valueKeyName={valueKeyName}
          labelKeyName={labelKeyName}
          objectKey={objectKey}
          url={url}
          {...props}
          {...wrapperProps}
        />
      );
    },
    alias: "autocomplete",
    remote: true,
    canMultiple: true
  },
  radio: {
    creator: function(
      { options = [], initialValue, ...props } = {},
      wrapperProps
    ) {
      const optionSelectors = options.map((item, index) => (
        <Radio key={index} value={item.value}>
          {item.label}
        </Radio>
      ));
      return (
        <RadioGroup {...wrapperProps} {...props}>
          {optionSelectors}
        </RadioGroup>
      );
    },
    alias: "radio"
  },
  checkbox: {
    creator: function(fieldProps = {}, wrapperProps) {
      return <Checkbox {...fieldProps} {...wrapperProps} />;
    },
    alias: "bool"
  }
};
