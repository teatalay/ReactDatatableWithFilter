import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Modal, Collapse, Select, Button } from "antd";

import DynamicFormCreator from "../DynamicForm";
import { inputTypes } from "../DynamicForm/constants";
import FileInput from "../FileInput";
import Span from "../Span";
import Block from "../Block";
import CheckButton from "../CheckButton";

import { isDefined, getRandom } from "../../utils";
import { sendRequest } from "../../common/network";
import {
  formLayoutTypes,
  httpMethods,
  labelAligns
} from "../../constants/commonTypes";

import "./style.scss";

const DynamicForm = DynamicFormCreator("filter");

const Panel = Collapse.Panel;

class Filter extends Component {
  constructor(props) {
    super(props);
    this.onDeleteAllFilters = this.onDeleteAllFilters.bind(this);
    this.filterValues = {};
    this.state = {
      modalVisible: false,
      unmountOnClose: true,
      filterFields: [],
      filterInputs: [],
      filterButtons: [...(props.filterButtons || [])],
      selectedFilters: [],
      inputFilters: [],
      buttonFilters: [],
      formDataFilters: []
    };
  }

  componentDidMount() {
    const {
      getFiltersURL,
      staticFilters,
      preKey,
      posKey,
      urlMethod,
      filterInputs
    } = this.props;

    const statics = staticFilters
      .filter(filter => typeof filter !== "string")
      .map(filter => ({ ...filter, isStatic: true }));
    const defaults = staticFilters.filter(filter => typeof filter === "string");

    if (getFiltersURL)
      sendRequest({
        url: getFiltersURL,
        method: urlMethod,
        onSuccess: result => {
          if (result && result.results) {
            const resultList = [...statics, ...result.results];
            this.initFilterValues(resultList);
            this.setState({
              filterFields: this.buildFilterFields(resultList, defaults),
              filterInputs: this.buildFilterInputs(resultList, preKey, posKey)
            });
          }
        }
      });
    else {
      const filters = [...statics, ...filterInputs];
      this.setState({
        filterFields: this.buildFilterFields(filters, defaults),
        filterInputs: this.buildFilterInputs(filters, preKey, posKey)
      });
    }
  }

  buildFilterInputs(resultList, preKey, posKey) {
    return resultList.map(input => ({
      ...input,
      key: input.isStatic ? input.key : preKey + input.key + posKey
    }));
  }

  buildFilterFields(resultList, defaults) {
    return resultList.map(input => {
      const active =
        defaults.findIndex(filter => filter === input.key) !== -1
          ? true
          : !!input.active;
      return {
        ...input,
        inputType: inputTypes.checkbox.alias,
        key: input.key.toString(),
        active,
        noLabel: true,
        name: input.name,
        fieldProps: {
          defaultChecked: active
        }
      };
    });
  }

  initFilterValues = filters => {
    this.filterValues = {};
    for (const element of filters) {
      if (element.active) this.filterValues[element.key] = true;
    }
  };

  closeModal = () => {
    this.setState({
      modalVisible: false
    });
    this.onChangeFilters();
  };

  openModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  createFilterInputs = () => {
    const { filterFields, filterInputs } = this.state;
    const activeFilters = filterFields.filter(field => field.active);
    return filterInputs.filter(input =>
      activeFilters.find(
        field => field && input && field.key === input.key.toString()
      )
    );
  };

  onChangeFilters = () => {
    const { filterFields } = this.state;
    const { onChangeActiveFilters } = this.props;
    const values = this.filterValues;
    const newFilterFields = filterFields.map(field => {
      const active = !!(
        values[field.key] ||
        (field.fieldProps.defaultChecked && !isDefined(values[field.key]))
      );
      return {
        ...field,
        active,
        fieldProps: {
          ...field.fieldProps,
          defaultChecked: active,
          key: field.key.concat(".").concat(getRandom())
        }
      };
    });
    this.setState(
      {
        filterFields: newFilterFields
      },
      () => {
        if (onChangeActiveFilters)
          onChangeActiveFilters(
            this.state.filterFields.filter(filter => filter.active)
          );
      }
    );
  };

  onChangeFiltersInputs = (values = {}) => {
    this.filterValues = values;
  };

  onChangeFilter = () => {
    const { buttonFilters, inputFilters, formDataFilters } = this.state;
    const buttonFilterObject = {};
    for (const iterator of buttonFilters) {
      if (iterator.active)
        if (!buttonFilterObject[iterator.key])
          buttonFilterObject[iterator.key] = [iterator.value];
        else buttonFilterObject[iterator.key].push(iterator.value);
    }
    const { onChange } = this.props;
    if (onChange) {
      onChange(
        {
          ...inputFilters,
          ...buttonFilterObject
        },
        formDataFilters
      );
    }
  };

  onDeleteAllFilters() {
    Promise.all([
      this.onDeselectAllInputs(),
      this.onDeselectAllButtons(),
      this.onDeselectAllFormData(),
      this.onDeselectAllSelectedFields()
    ]).then(() => {
      this.onChangeFilter();
    });
  }

  inputFilterMapper = (values, filterInputs) => {
    return Object.keys(values)
      .map(key => {
        const item = filterInputs.find(input => input.key === key);
        if (
          !isDefined(values[key]) ||
          (values[key] instanceof Array && !values[key].length)
        )
          return null;
        return {
          name: item.name,
          value:
            values[key] && values[key].label
              ? values[key].label
              : values[key] instanceof Array
              ? this.arrayToString(values[key], "label", ", ")
              : values[key]
        };
      })
      .filter(item => isDefined(item));
  };

  arrayToString(arr, key, splitter = ",") {
    let result = "";
    if (!arr) return result;
    for (let i = 0; i < arr.length; i++) {
      result += `${arr[i][key]}${i === arr.length - 1 ? "" : splitter}`;
    }
    return result;
  }

  inputFilterValueMapper = values => {
    if (!values) return values;
    let result = {};
    Object.keys(values).forEach(key => {
      let value = null;
      if (
        !isDefined(values[key]) ||
        (Array.isArray(values[key]) && !values[key].length)
      )
        return value;
      if (Array.isArray(values[key])) value = values[key].map(item => item.key);
      else if (isDefined(values[key].key)) {
        if (typeof values[key].key === "object") {
          const keys = Object.keys(values[key].key);
          keys.forEach(subKey => {
            result = { ...result, [subKey]: values[key].key[subKey] };
          });
          return result;
        } else value = values[key].key;
      } else value = values[key];
      result = { ...result, [key]: value };
    });
    return result;
  };

  onChangeInputFilters = values => {
    const { buttonFilters, formDataFilters, filterInputs } = this.state;
    const filters = this.inputFilterMapper(values, filterInputs);
    const selectedFilters = this.getSelectedFilters(
      buttonFilters,
      filters,
      formDataFilters
    );
    const valuesMapped = this.inputFilterValueMapper(values, filterInputs);
    this.setState(
      {
        inputFilters: valuesMapped,
        selectedFilters
      },
      () => {
        this.onChangeFilter();
      }
    );
  };

  onChangeButtonFilters = (buttonObject, value) => {
    const {
      filterButtons,
      inputFilters: inputValues,
      formDataFilters,
      filterInputs
    } = this.state;
    const buttonIndex = filterButtons.findIndex(
      filter => filter.id === buttonObject.id
    );
    const button = filterButtons[buttonIndex];
    const inputFilters = this.inputFilterMapper(inputValues, filterInputs);
    button.active = value;
    const newButtonFilters = filterButtons.filter(button => button.active);
    const selectedFilters = this.getSelectedFilters(
      newButtonFilters,
      inputFilters,
      formDataFilters
    );
    this.setState(
      {
        buttonFilters: newButtonFilters,
        selectedFilters
      },
      () => {
        this.onChangeFilter();
      }
    );
  };

  onChangeFileFilter = data => {
    const { multipleFile } = this.props;
    const {
      buttonFilters,
      inputFilters: inputValues,
      formDataFilters,
      filterInputs
    } = this.state;
    const inputFilters = this.inputFilterMapper(inputValues, filterInputs);
    const newFormDataFilters =
      data && data.length
        ? multipleFile
          ? [
              ...formDataFilters,
              ...data.map(file => ({
                name: file.name,
                file: file,
                key: file.uid
              }))
            ]
          : [
              {
                name: data[0].name,
                file: data[0],
                key: data[0].uid
              }
            ]
        : formDataFilters;
    const selectedFilters = this.getSelectedFilters(
      buttonFilters,
      inputFilters,
      newFormDataFilters
    );
    this.setState(
      {
        formDataFilters: newFormDataFilters,
        selectedFilters
      },
      () => {
        this.onChangeFilter();
      }
    );
  };

  getSelectedFilters = (buttonFilters, inputFilters, formDataFilters) => {
    return [
      ...buttonFilters
        .filter(button => button.active)
        .map(button => button.name),
      ...inputFilters.map(input => `${input.name}: ${input.value}`),
      ...formDataFilters.map(formData => formData.name)
    ];
  };

  onChangeActiveFiltersByUser = values => {
    this.setState({
      selectedFilters: values
    });
  };

  onDeselect = value => {
    const { filterInputs, filterButtons, formDataFilters } = this.state;
    const inputValues = value.split(":");
    const inputValue = inputValues && inputValues.length ? inputValues[0] : {};
    let clearedInput = filterInputs.findIndex(
      input => input.name === inputValue
    );
    if (clearedInput !== -1) {
      this.onDeselectInput(inputValue);
      return;
    }
    clearedInput = filterButtons.findIndex(button => button.name === value);
    if (clearedInput !== -1) {
      this.onDeselectButton(value);
      return;
    }
    clearedInput = formDataFilters.findIndex(
      formData => formData.name === value
    );
    if (clearedInput !== -1) {
      this.onDeselectFormData(value);
      return;
    }
  };

  onDeselectInput = value => {
    const { filterInputs } = this.state;
    const clearedInputIndex = filterInputs.findIndex(
      input => input.name === value
    );
    const clearedInput = filterInputs[clearedInputIndex];
    this.setState(
      {
        filterInputs: [
          ...filterInputs.slice(0, clearedInputIndex),
          ...filterInputs.slice(clearedInputIndex + 1, filterInputs.length)
        ]
      },
      () => {
        this.setState({
          filterInputs: [
            ...filterInputs.slice(0, clearedInputIndex),
            clearedInput,
            ...filterInputs.slice(clearedInputIndex + 1, filterInputs.length)
          ]
        });
        this.onChangeFilter();
      }
    );
  };

  onDeselectAllInputs = () => {
    return new Promise(resolve => {
      const { filterInputs } = this.state;
      this.setState(
        {
          filterInputs: [],
          inputFilters: {}
        },
        () => {
          this.setState({ filterInputs }, () => {
            resolve();
          });
        }
      );
    });
  };

  onDeselectButton = value => {
    const { filterButtons } = this.state;
    const clearedButtonIndex = filterButtons.findIndex(
      input => input.name === value
    );
    filterButtons[clearedButtonIndex].active = false;
    this.setState(
      {
        filterButtons
      },
      () => {
        this.onChangeFilter();
      }
    );
  };

  onDeselectAllButtons = () => {
    const { filterButtons } = this.state;
    for (const button of filterButtons) {
      button.active = false;
    }
    return new Promise(resolve => {
      this.setState({ filterButtons, buttonFilters: [] }, () => {
        resolve();
      });
    });
  };

  onDeselectFormData = value => {
    this.setState(
      prevState => ({
        formDataFilters: [
          ...prevState.formDataFilters.filter(
            formData => formData.name !== value
          )
        ]
      }),
      () => {
        this.onChangeFilter();
      }
    );
  };

  onDeselectAllFormData = () => {
    return new Promise(resolve => {
      this.setState({ formDataFilters: [] }, () => {
        resolve();
      });
    });
  };

  onDeselectAllSelectedFields = () => {
    return new Promise(resolve => {
      this.setState({ selectedFilters: [] }, () => {
        resolve();
      });
    });
  };

  createActionButtons = () => {
    const { filterButtons = [] } = this.state;
    if (!filterButtons) return filterButtons;
    const onChange = this.onChangeButtonFilters;
    return filterButtons.map(button => {
      const onClick = () => {
        onChange(button, !button.active);
      };
      return (
        <CheckButton
          isChecked={button.active}
          onClick={onClick}
          key={button.id}
          icon={button.icon}
        >
          {button.label}
        </CheckButton>
      );
    });
  };

  createFilterForm = () => {
    const filterInputs = this.createFilterInputs();
    return (
      <Row
        gutter={{ xs: 0, sm: 16, md: 16 }}
        className={`ant-col-md-24 filter-wrapper`}
      >
        <DynamicForm
          onSubmit={this.onChangeInputFilters}
          onChange={this.onChangeInputFilters}
          inputs={filterInputs}
          labelAlign={labelAligns.left}
          hasSubmitButton={false}
          layoutType={formLayoutTypes.inline}
          getChangeWithEnterPress
          keyValueSelect
        />
      </Row>
    );
  };

  render() {
    const {
      title = "Filtreler",
      className,
      multipleFile,
      filterViaFile,
      collapsible
    } = this.props;
    const { modalVisible, filterFields, selectedFilters } = this.state;

    const buttons = this.createActionButtons();
    const filterForm = this.createFilterForm();
    return (
      <React.Fragment>
        <Row className={`ant-col-md-24 filter-wrapper filter-file`}>
          <Button
            className={`settings-button`}
            onClick={this.openModal}
            type="primary"
            icon={"setting"}
          >
            {"Filtreler"}
          </Button>
          {filterViaFile && (
            <>
              <Span>{"Dosya ile filtrele: "}</Span>
              <FileInput
                multiple={multipleFile}
                accept=".csv"
                onChange={this.onChangeFileFilter}
              >
                <Button icon={"file-text"}>{"CSV"}</Button>
              </FileInput>
              <FileInput
                multiple={multipleFile}
                accept=".xls"
                onChange={this.onChangeFileFilter}
              >
                <Button icon={"file-excel"}>{"XLS"}</Button>
              </FileInput>
            </>
          )}
        </Row>
        <Row
          gutter={{ xs: 0, sm: 16, md: 16 }}
          className={`ant-col-md-24 filter-wrapper filter-options-area`}
        >
          {buttons.length > 0 && buttons}
          <Block className="active-filters">
            <Select
              className={`ant-col-md-24 ant-col-sm-24 ant-col-xs-24`}
              open={false}
              mode="tags"
              placeholder="Active Filters"
              onChange={this.onChangeActiveFiltersByUser}
              value={selectedFilters}
              onDeselect={this.onDeselect}
            />
            <Button
              className="filter-clear-button"
              onClick={this.onDeleteAllFilters}
              icon="delete"
            />
          </Block>
        </Row>
        {collapsible ? (
          <Collapse
            className="collapse-filter"
            bordered={false}
            defaultActiveKey={["1"]}
          >
            <Panel header="Filtreler" key="1">
              {filterForm}
            </Panel>
          </Collapse>
        ) : (
          filterForm
        )}
        <Modal
          visible={modalVisible}
          onCancel={this.closeModal}
          closable
          title={title}
          className={className}
          centered
          footer={[
            <Button key="submit" type="primary" onClick={this.closeModal}>
              Uygula
            </Button>
          ]}
        >
          <DynamicForm
            onSubmit={this.closeModal}
            onChange={this.onChangeFiltersInputs}
            inputs={filterFields}
            hasSubmitButton={false}
            layoutType={formLayoutTypes.inline}
            labelAlign={labelAligns.left}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

Filter.defaultProps = {
  preKey: "",
  posKey: "",
  multipleFile: false,
  staticFilters: [],
  collapsible: true,
  urlMethod: httpMethods.GET,
  filterButtons: [],
  filterInputs: [],
  className: "filter-modal"
};

Filter.propTypes = {
  filterButtons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      icon: PropTypes.string,
      tooltip: PropTypes.string
    })
  ).isRequired,
  getFiltersURL: PropTypes.string,
  preKey: PropTypes.string,
  posKey: PropTypes.string,
  multipleFile: PropTypes.bool,
  staticFilters: PropTypes.array,
  collapsible: PropTypes.bool,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
  filterViaFile: PropTypes.bool,
  urlMethod: PropTypes.string,
  filterInputs: PropTypes.array,
  onChangeActiveFilters: PropTypes.func
};

export default Filter;
