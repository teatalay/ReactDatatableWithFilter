import React, { memo } from "react";
import PropTypes from "prop-types";

const Span = memo(({ children, ...otherProps }) => {
  return <span {...otherProps}>{children}</span>;
});

Span.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default Span;
