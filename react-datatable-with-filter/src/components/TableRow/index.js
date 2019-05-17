import React, { memo } from "react";
import PropTypes from "prop-types";

const TableRow = memo(({ children, ...otherProps }) => {
  return <tr {...otherProps}>{children}</tr>;
});

TableRow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default TableRow;
