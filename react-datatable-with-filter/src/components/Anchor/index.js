import React, { memo } from "react";
import PropTypes from "prop-types";


function onNavigate(url) {
  //navigator.push(url);
}

const Anchor = memo(({ children, href, className = "", ...otherProps }) => {
  if (href)
    otherProps = {
      ...otherProps,
      onClick: () => {
        onNavigate(href);
      }
    };
  className = "pointer ".concat(className);
  return (
    <a {...otherProps} className={className}>
      {children}
    </a>
  );
});

Anchor.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default Anchor;
