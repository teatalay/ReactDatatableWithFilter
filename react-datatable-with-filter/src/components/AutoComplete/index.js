import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { AutoComplete } from "antd";

import { sendRequest } from "../../common/network";
import { createURL, getObjectFromString } from "../../utils";

import "./style.scss";

const AutoCompleteOption = AutoComplete.Option;

class AutoCompleteContainer extends PureComponent {
  state = {
    dataSource: [],
    loading: false
  };

  handleSearch = value => {
    const { url, objectKey, related, relatedKey } = this.props;
    const relatedValue = typeof related === "object" ? related.key : related;
    sendRequest({
      params: relatedValue ? { [relatedKey]: relatedValue } : {},
      url: createURL(url, value),
      onBegin: () => this.setState({ loading: true, dataSource: [] }),
      onSuccess: result =>
        this.setState({
          dataSource: getObjectFromString(objectKey, result)
        }),
      onFinally: () => this.setState({ loading: false })
    });
  };

  createAutoCompleteOptions = () => {
    const { dataSource } = this.state;
    const { keyName, valueKeyName, labelKeyName } = this.props;
    return dataSource.map((item, index) => (
      <AutoCompleteOption
        key={(keyName ? getObjectFromString(keyName, item) : item.pk) || index}
        value={getObjectFromString(valueKeyName, item)}
      >
        {getObjectFromString(labelKeyName, item) ||
          getObjectFromString(valueKeyName, item)}
      </AutoCompleteOption>
    ));
  };

  render() {
    const {
      onChange,
      value,
      disabled,
      relatedKey,
      related,
      ...otherProps
    } = this.props;
    const disabledProp =
      disabled === true ? true : relatedKey ? !related : false;
    const options = this.createAutoCompleteOptions();
    return (
      <AutoComplete
        className="autocomplete-search"
        {...otherProps}
        onSelect={onChange}
        onSearch={this.handleSearch}
        disabled={disabledProp}
      >
        {options}
      </AutoComplete>
    );
  }
}

AutoCompleteContainer.defaultProps = {
  valueKeyName: "value",
  labelKeyName: "label",
  objectKey: "options"
};

AutoCompleteContainer.propTypes = {
  className: PropTypes.string,
  url: PropTypes.string.isRequired,
  related: PropTypes.string,
  relatedKey: PropTypes.string,
  objectKey: PropTypes.string,
  valueKeyName: PropTypes.string,
  labelKeyName: PropTypes.string,
  keyName: PropTypes.string,
  disabled: PropTypes.bool
};

export default AutoCompleteContainer;
