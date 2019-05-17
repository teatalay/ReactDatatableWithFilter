import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Col, Row, Button, Form } from "antd";

import PlaceHolderContainer from "./placeholderContainer";

import {
  formLayoutTypes,
  httpMethods,
  labelAligns
} from "../../constants/commonTypes";
import {
  serializeObjectWithDot,
  isDefinedAndNotEmpty,
  shallowEqual,
  isDefined,
  getObjectFromString
} from "../../utils";
import { sendRequest } from "../../common/network";
import {
  colHorizontalType,
  colVerticalType,
  filterLayout,
  formItemLayout,
  formItemLayoutVertical,
  formLayout,
  inputSpace
} from "./constants";
import {
  getValueByInputType,
  getError,
  getInputType,
  hasErrors
} from "./helpers";

const FormItem = Form.Item;

class DynamicForm extends PureComponent {
  constructor(props) {
    super(props);
    this.formObject = {};
    this.state = { inputs: [] };
    this.updateFormObject(props.inputs, true);
  }

  componentDidMount() {
    const {
      hasSubmitButton,
      form: { validateFields },
      url,
      httpMethod,
      objectKey
    } = this.props;
    if (url) this.getFormFields(url, httpMethod, objectKey);
    else if (hasSubmitButton) validateFields();
  }

  componentDidUpdate(prevProps) {
    if (!shallowEqual(this.props.inputs, prevProps.inputs))
      this.clearDeletedValues();
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.inputs, nextProps.inputs))
      this.updateFormObject(nextProps.inputs);
  }

  updateFormObject = (inputs = [], fromConstructor) => {
    let value = { ...this.formObject };
    for (const element of inputs) {
      if (isDefined(element.initialValue))
        value = {
          ...value,
          [element.key]: element.initialValue
        };
    }
    this.setFormObject(value, !fromConstructor);
  };

  getFormFields = (url, httpMethod, objectKey) => {
    sendRequest({
      url,
      method: httpMethod,
      onSuccess: result => {
        this.setState({
          inputs: objectKey ? getObjectFromString(objectKey, result) : result
        });
      }
    });
  };

  clearDeletedValues = () => {
    let changed = false;
    let result = {};
    for (const key in this.formObject) {
      if (this.formObject.hasOwnProperty(key)) {
        const element = this.formObject[key];
        if (this.props.inputs.findIndex(input => input.key === key) !== -1)
          result = { ...result, [key]: element };
        else changed = true;
      }
    }
    this.setFormObject({ ...result });
    if (changed) this.onChange();
  };

  calculateFormValues = formObject => {
    let result = {};
    for (const key in formObject) {
      if (formObject.hasOwnProperty(key)) {
        const element = formObject[key];
        if (isDefinedAndNotEmpty(element))
          result = { ...result, [key]: element };
      }
    }
    return result;
  };

  setFormObject = (newValue, stateIsReady) => {
    if (!shallowEqual(this.formObject, newValue)) {
      this.formObject = newValue ? newValue : {};
      if (stateIsReady) this.forceUpdate();
    }
  };

  onChange = (input, dataField, e, type, label) => {
    const { onChange } = this.props;
    if (e) {
      const value = getValueByInputType(e, type);
      this.setFormObject({
        ...this.formObject,
        [dataField]: value
      });
    }
    if (onChange) {
      const values = this.calculateFormValues(this.formObject);
      onChange(values);
    }
  };

  onKeyPress = (input, dataField, e, type, label) => {
    if (e.key === "Enter") this.onChange(input, dataField, e, type, label);
  };

  onSubmit = e => {
    e.preventDefault();
    const { onSubmit } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err && onSubmit) {
        const value = this.calculateFormValues(values);
        onSubmit(serializeObjectWithDot(values), value);
      }
    });
  };

  onBlur(e) {
    e.preventDefault();
  }

  reset = e => {
    e.preventDefault();
    this.props.form.resetFields();
  };

  renderField = (field = {}) => {
    const {
      id,
      inputType: type,
      initialValue,
      placeholder,
      name: label,
      key: code,
      objectKey,
      options,
      fieldOptions = {},
      fieldProps,
      formItemProps = {},
      url,
      valueKeyName,
      labelKeyName,
      multiSelect,
      relatedTo,
      relatedKey
    } = field;
    const {
      form: { getFieldDecorator, getFieldError, isFieldTouched },
      errorOnFocus,
      layoutType,
      getChangeWithEnterPress,
      keyValueSelect
    } = this.props;
    const inputType = getInputType(type);
    const workWithKeyPress =
      inputType.canWorkWithKeyPress && getChangeWithEnterPress;
    const onChange = workWithKeyPress
      ? null
      : e => this.onChange(field, code, e, inputType, label);
    const onKeyPress = workWithKeyPress
      ? e => this.onKeyPress(field, code, e, inputType, label)
      : null;
    const DynamicInput = inputType.creator(
      {
        label,
        options,
        ...fieldProps,
        ...(inputType.remote
          ? {
              valueKeyName,
              labelKeyName,
              objectKey,
              relatedKey,
              url,
              URLKey: id
            }
          : {}),
        ...(inputType.canMultiple
          ? { mode: multiSelect ? "multiple" : "default" }
          : {}),
        ...(keyValueSelect && inputType.canKeyValueResult
          ? { labelInValue: true }
          : {}),
        ...(relatedTo ? { related: this.formObject[relatedTo] } : {})
      },
      {
        onChange,
        onKeyPress
      }
    );
    const DynamicInputContainer = placeholder ? (
      <PlaceHolderContainer placeholder={placeholder}>
        {DynamicInput}
      </PlaceHolderContainer>
    ) : (
      DynamicInput
    );
    const { hasError, validateStatus, error } = getError(
      isFieldTouched,
      getFieldError,
      code,
      errorOnFocus
    );
    const isInline = layoutType === formLayoutTypes.inline;
    const colLayoutFormItem = isInline
      ? formItemLayout
      : formItemLayoutVertical;
    const initValue = initialValue
      ? inputType.canMultiple
        ? initialValue instanceof Array
          ? initialValue
          : [initialValue]
        : initialValue
      : undefined;
    const child = (
      <FormItem
        className={`ant-col-md-24 ant-col-sm-24 ant-col-xs-24`}
        label={label}
        {...colLayoutFormItem}
        {...formItemProps}
        validateStatus={hasError ? validateStatus : ""}
        help={hasError ? error : ""}
      >
        {getFieldDecorator(code, {
          ...fieldOptions,
          initialValue: initValue
        })(DynamicInputContainer)}
      </FormItem>
    );
    const colLayout = isInline ? colHorizontalType : colVerticalType;
    return (
      <Col className={`filter-input`} {...colLayout} key={id}>
        {child}
      </Col>
    );
  };

  renderInputs = (inputs = [], language) => {
    return inputs.map(input => this.renderField(input));
  };

  render() {
    const {
      language,
      onCancel,
      inputs,
      hasSubmitButton,
      layoutType,
      submitting,
      form: { getFieldsError },
      labelAlign
    } = this.props;

    const formInputs = this.renderInputs(inputs, language);
    const isInline = layoutType === formLayoutTypes.inline,
      colLayout = isInline ? filterLayout : formLayout;
    if (!formInputs.length) return null;
    return (
      <Col {...colLayout}>
        <Form onSubmit={this.onSubmit} labelAlign={labelAlign}>
          {isInline ? (
            <Row gutter={{ ...inputSpace }}>{formInputs}</Row>
          ) : (
            formInputs
          )}
          {(hasSubmitButton || onCancel) && (
            <Row
              className={`ant-col-md-24 ant-col-sm-24 ant-col-xs-24 ant-col-md-offset-7`}
            >
              {hasSubmitButton && (
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={hasErrors(getFieldsError())}
                    loading={submitting}
                  >
                    Submit
                  </Button>
                </FormItem>
              )}
              {onCancel && (
                <FormItem
                  className={`ant-col-md-24 ant-col-sm-24 ant-col-xs-24`}
                >
                  <Button onClick={onCancel}>{language["Cancel"]}</Button>
                </FormItem>
              )}
            </Row>
          )}
        </Form>
      </Col>
    );
  }
}

DynamicForm.defaultProps = {
  hasSubmitButton: true,
  layoutType: formLayoutTypes.block,
  errorOnFocus: true,
  getChangeWithEnterPress: false,
  multiSelect: false,
  submitting: false,
  keyValueSelect: false,
  labelAlign: labelAligns.right,
  httpMethod: httpMethods.OPTIONS
};

DynamicForm.propTypes = {
  getChangeWithEnterPress: PropTypes.bool,
  language: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onChange: PropTypes.func,
  inputs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      inputType: PropTypes.string.isRequired,
      initialValue: PropTypes.any,
      placeholder: PropTypes.string,
      name: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      objectKey: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          label: PropTypes.string,
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
          value: PropTypes.string.isRequired
        })
      ),
      fieldOptions: PropTypes.object,
      fieldProps: PropTypes.object,
      formItemProps: PropTypes.object,
      url: PropTypes.string,
      valueKeyName: PropTypes.string,
      labelKeyName: PropTypes.string,
      multiSelect: PropTypes.bool,
      relatedTo: PropTypes.string,
      relatedKey: PropTypes.string
    })
  ).isRequired,
  hasSubmitButton: PropTypes.bool,
  keyValueSelect: PropTypes.bool,
  url: PropTypes.string,
  submitting: PropTypes.bool,
  httpMethod: PropTypes.string,
  labelAlign: PropTypes.oneOf([labelAligns.left, labelAligns.right]),
  objectKey: PropTypes.string
};

export default function(name) {
  return Form.create({ name })(DynamicForm);
}
