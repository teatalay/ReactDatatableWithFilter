import React, { memo } from "react";
import PropTypes from "prop-types";

const Image = memo(({ alt, src, ...otherProps }) => {
  return <img alt={alt} src={src} {...otherProps} />;
});

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Image;
