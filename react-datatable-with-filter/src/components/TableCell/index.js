import React, { memo } from "react";
import PropTypes from "prop-types";

const TableCell = memo(({ children, ...otherProps }) => {
  return <td {...otherProps}>{children}</td>;
});

TableCell.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default TableCell;
