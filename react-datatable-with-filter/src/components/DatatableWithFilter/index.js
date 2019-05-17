import React, { Component } from "react";
import PropTypes from "prop-types";

import { DatatableBox } from "../../components/Datatable";
import Box from "../../components/Box";
import Filter from "../../components/Filter";

import { sendRequest } from "../../common/network";
import { httpMethods } from "../../constants/commonTypes";
import { getObjectFromString } from "../../utils";

class DatatableWithFilter extends Component {
  state = {};

  componentDidMount() {
    const {
      optionsURL,
      httpMethod,
      columnsObjectKey,
      filterObjectKey
    } = this.props;
    if (optionsURL)
      sendRequest({
        method: httpMethod,
        url: optionsURL,
        onSuccess: result => {
          this.setState({
            filterInputs: getObjectFromString(filterObjectKey, result),
            columns: getObjectFromString(columnsObjectKey, result)
          });
        }
      });
  }

  filterTable = (filterObject, e) => {
    this.setState({ filterObject });
  };

  onChangeFilter = (filterObject, formFilters) => {
    this.setState({ filterObject, formFilters });
  };

  render() {
    const { filterObject, formFilters, filterInputs, columns } = this.state;
    const { datatableProps = {}, filterProps } = this.props;
    const ftProps = {
      ...filterProps,
      ...(filterInputs ? { filterInputs } : {})
    };
    const dtProps = { ...datatableProps, ...(columns ? { columns } : {}) };
    return (
      <>
        <Box title="Filtreler">
          <Filter
            onSubmit={this.filterTable}
            onChange={this.onChangeFilter}
            inline
            {...ftProps}
          />
        </Box>
        <DatatableBox
          filter={filterObject}
          formFilters={formFilters}
          {...dtProps}
        />
      </>
    );
  }
}

DatatableWithFilter.defaultProps = {
  filterObjectKey: "filters",
  columnsObjectKey: "columns",
  httpMethod: httpMethods.OPTIONS
};

DatatableWithFilter.propTypes = {
  optionsURL: PropTypes.string,
  filterObjectKey: PropTypes.string,
  columnsObjectKey: PropTypes.string,
  filterProps: PropTypes.shape({
    getFiltersURL: PropTypes.string,
    filterButtons: PropTypes.array,
    staticFilters: PropTypes.array,
    className: PropTypes.string,
    preKey: PropTypes.string,
    posKey: PropTypes.string,
    collapsible: PropTypes.bool,
    filterViaFile: PropTypes.bool
  }),
  datatableProps: PropTypes.shape({
    pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    columns: PropTypes.array,
    rowKey: PropTypes.string,
    className: PropTypes.string,
    url: PropTypes.string,
    rowSelection: PropTypes.object,
    effaceable: PropTypes.bool,
    saveable: PropTypes.bool,
    size: PropTypes.string,
    expandedRowRender: PropTypes.func,
    expandRowByClick: PropTypes.bool,
    horizontalScroll: PropTypes.bool,
    verticalScroll: PropTypes.bool,
    bordered: PropTypes.bool,
    locale: PropTypes.object,
    onChangeDataSource: PropTypes.func,
    actionButtons: PropTypes.array,
    onRowClick: PropTypes.func,
    exportable: PropTypes.bool,
    subtitle: PropTypes.any,
    exportButtonClick: PropTypes.func
  })
};

export default DatatableWithFilter;
