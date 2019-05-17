import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";

class CheckButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isChecked: props.isChecked || false };
  }
  clickHandler = () => {
    this.setState(prevState => ({
      isChecked: !prevState.isChecked
    }));
    this.props.onClick();
  };
  componentWillReceiveProps(nextProps, nextContext) {
    if (this.state.isChecked !== nextProps.isChecked) {
      this.setState({ isChecked: nextProps.isChecked });
    }
  }

  render() {
    const {
      onClick,
      children,
      className,
      isChecked: checked,
      ...otherProps
    } = this.props;
    const { isChecked } = this.state;
    return (
      <Button
        className={`${className} ${isChecked ? "checked" : ""}`}
        onClick={this.clickHandler}
        {...otherProps}
      >
        {children}
      </Button>
    );
  }
}

CheckButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default CheckButton;
