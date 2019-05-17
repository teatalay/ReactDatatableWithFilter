import React from "react";
import { filterByObject } from "../../utils";

const filterHOC = function(WrappedComponent) {
  return function({
    data: { dataKey, dataValue },
    filterObject,
    filterFunc,
    filterOptions,
    ...otherProps
  }) {
    let filteredData = { ...dataValue };
    if (filterObject && dataValue) {
      if (filterFunc && filterFunc instanceof Function) {
        filteredData = filterFunc(dataValue, filterObject, filterOptions);
      } else {
        filteredData = filterByObject(dataValue, filterObject, filterOptions);
      }
    }
    const props = { [dataKey]: filteredData, ...otherProps };
    return <WrappedComponent {...props} />;
  };
};

export default filterHOC;
