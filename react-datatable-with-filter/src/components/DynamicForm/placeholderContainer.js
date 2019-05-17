import React from "react";
import Span from "../Span";
import Block from "../Block";
import "./style.scss";
export default class extends React.Component {
  render() {
    const { children, placeholder } = this.props;
    return (
      <Block>
        {children}
        <Span className="field-info">{placeholder}</Span>
      </Block>
    );
  }
}
