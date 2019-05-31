import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Select } from "antd";
import { sendRequest } from "../../common/network";
import { isDefinedAndNotEmpty, getObjectFromString } from "../../utils";

const SelectOption = Select.Option;
class RemoteSelect extends PureComponent {
  state = {
    options: []
  };
  componentDidMount() {
    const { url, related } = this.props;
    this.getOptions(url, related, true);
  }

  componentWillReceiveProps(nextProps) {
    if (
      (isDefinedAndNotEmpty(nextProps.url) &&
        this.props.url !== nextProps.url) ||
      this.props.related !== nextProps.related
    )
      this.getOptions(nextProps.url, nextProps.related);
  }
  getOptions = (url, related, initial) => {
    const { objectKey, relatedKey, onChange } = this.props;
    const relatedValue = isDefinedAndNotEmpty(related)
      ? typeof related === "object"
        ? related.key
        : related
      : null;
    if (relatedKey && !isDefinedAndNotEmpty(relatedValue)) {
      this.setState(
        {
          options: []
        },
        () => {
          if (!initial) onChange();
        }
      );
    } else {
      if (!initial) onChange();
      sendRequest({
        params: relatedValue ? { [relatedKey]: relatedValue } : {},
        url,
        onSuccess: result => {
          this.setState({
            options: objectKey ? getObjectFromString(objectKey, result) : result
          });
        }
      });
    }
  };

  render() {
    const {
      url,
      keyName,
      valueKeyName,
      labelKeyName,
      relatedKey,
      related,
      disabled,
      ...otherProps
    } = this.props;
    const { options } = this.state;
    const disabledProp =
      disabled === true ? true : relatedKey ? !related : false;
    const optionSelectors =
      options &&
      options.map((item, index) => (
        <SelectOption
          key={keyName ? getObjectFromString(keyName, item) : index}
          value={getObjectFromString(valueKeyName, item)}
        >
          {getObjectFromString(labelKeyName, item) ||
            getObjectFromString(valueKeyName, item)}
        </SelectOption>
      ));
    return (
      <Select {...otherProps} disabled={disabledProp}>
        {optionSelectors}
      </Select>
    );
  }
}

RemoteSelect.defaultProps = {
  valueKeyName: "value",
  labelKeyName: "label",
  objectKey: "options"
};

RemoteSelect.propTypes = {
  className: PropTypes.string,
  url: PropTypes.string.isRequired,
  related: PropTypes.any,
  relatedKey: PropTypes.string,
  objectKey: PropTypes.string,
  valueKeyName: PropTypes.string,
  labelKeyName: PropTypes.string,
  keyName: PropTypes.string,
  disabled: PropTypes.bool
  //+antd Select Props
};

export default RemoteSelect;
