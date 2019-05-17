import React, { memo } from "react";
import PropTypes from "prop-types";

const Block = memo(({ children, ...otherProps }) => {
  return <div {...otherProps}>{children}</div>;
});

Block.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default Block;
