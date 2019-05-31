import React, { PureComponent } from "react";
import { Icon, Popconfirm, Select, Button } from "antd";
import PropTypes from "prop-types";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import update from "immutability-helper";

import Table from "./antTable.style";
import Block from "../Block";
import Span from "../Span";
import Anchor from "../Anchor";
import Box from "../Box";
import { EditableFormRow, EditableCell, EditableContext } from "./editablecell";
import { DragableBodyRow, EditableDragableFormRow } from "./draggable";
import Modal from "../Feedback/modal";

import { sendRequest } from "../../common/network";
import { httpMethods, responseTypes } from "../../constants/commonTypes";
import getRenderer from "./renderers";
import formatData from "./formatters";

import {
  getRandom,
  serializeObjectWithDot,
  shallowEqual,
  createURL,
  arrayEqual,
  getObjectFromString,
  isDefined
} from "../../utils";
import {
  defaultHorizontalScroll,
  defaultPagination,
  defaultVerticalScroll,
  defaultColumnProps,
  locale,
  draggableColumn
} from "./constants";

import "./style.scss";

const Option = Select.Option;

class Datatable extends PureComponent {
  constructor(props) {
    super(props);
    this.onDatatableAction = this.onDatatableAction.bind(this);
    const {
      pagination = {},
      rowSelection,
      horizontalScroll,
      horizontalScrollSize,
      verticalScroll,
      verticalScrollSize,
      locale: localeProps = {},
      dataSource
    } = props;
    this.state = {
      selectedRowKeys: [],
      dataSource: dataSource || [],
      pagination:
        pagination === false
          ? false
          : {
              ...defaultPagination,
              ...pagination,
              onShowSizeChange: this.onShowSizeChange,
              total: dataSource && dataSource.length
            },
      loading: false,
      editingKey: "",
      confirmVisible: false
    };
    this.locale = { ...locale, ...localeProps };
    this.rowSelection = rowSelection
      ? {
          ...rowSelection,
          onChange: this.onRowSelection
        }
      : null;
    this.scroll =
      horizontalScroll || verticalScroll
        ? {
            x: horizontalScrollSize
              ? horizontalScrollSize
              : horizontalScroll
              ? defaultHorizontalScroll
              : null,
            y: verticalScrollSize
              ? verticalScrollSize
              : verticalScroll
              ? defaultVerticalScroll
              : null
          }
        : undefined;
  }

  handleDelete = key => {
    const { rowKey, onChangeDataSource } = this.props;
    const dataSource = [...this.state.dataSource];
    this.setState(
      {
        dataSource: dataSource.filter(item => item[rowKey] !== key)
      },
      () => {
        if (onChangeDataSource) onChangeDataSource(this.state.dataSource);
      }
    );
  };

  createNewData = () => {
    const columnKeys = this.columns
      .filter(column => !column.systemProp)
      .map(column => column.dataIndex);
    let result = {};
    for (const key of columnKeys) {
      result = { ...result, [key]: "" };
    }
    result[this.props.rowKey] = getRandom();
    return serializeObjectWithDot(result);
  };

  handleSaveCell = row => {
    const { rowKey } = this.props;
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row[rowKey] === item[rowKey]);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    const { selectedRows } = this.state;
    let newRows = null;
    if (selectedRows && selectedRows.length) {
      const index = selectedRows.findIndex(
        item => item[rowKey] === row[rowKey]
      );
      newRows = [
        ...selectedRows.slice(0, index),
        row,
        ...selectedRows.slice(index + 1, selectedRows.length)
      ];
    }
    this.setState(
      prevState => ({
        dataSource: newData,
        selectedRows: newRows ? newRows : prevState.selectedRows
      }),
      () => {
        const { selectedRowKeys, selectedRows } = this.state;
        this.onRowSelection(selectedRowKeys, selectedRows);
      }
    );
  };

  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = this.createNewData();
    this.setState({
      dataSource: [...dataSource, newData]
    });
  };

  isEditing = record => record[this.props.rowKey] === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  handleSaveRow(form, key) {
    const { rowKey, onChangeDataSource } = this.props;
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => key === item[rowKey]);
      const resultAction = () => onChangeDataSource(this.state.dataSource);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        this.setState({ dataSource: newData, editingKey: "" }, resultAction);
      } else {
        newData.push(row);
        this.setState({ dataSource: newData, editingKey: "" }, resultAction);
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState(prevState => ({
      pagination:
        prevState.pagination === false
          ? false
          : { ...prevState.pagination, pageSize }
    }));
  };

  onRowSelection = (selectedRowKeys, selectedRows) => {
    const {
      rowSelection: { onRowSelection }
    } = this.props;
    this.setState(
      {
        selectedRowKeys,
        selectedRows
      },
      () => {
        if (onRowSelection) onRowSelection(selectedRowKeys, selectedRows);
      }
    );
  };

  componentWillReceiveProps(nextProps) {
    const { filter, formFilters, dataSource, remote } = this.props;
    if (
      !shallowEqual(filter, nextProps.filter) ||
      !arrayEqual(
        formFilters.map(formFilter => formFilter.key),
        nextProps.formFilters.map(formFilter => formFilter.key)
      )
    )
      this.fetchData({
        filter: nextProps.filter,
        formFilters: nextProps.formFilters
      });
    if (!remote && !shallowEqual(dataSource, nextProps.dataSource))
      this.setState(prevState => ({
        dataSource: nextProps.dataSource,
        pagination:
          prevState.pagination === false
            ? false
            : {
                ...prevState.pagination,
                total: dataSource ? dataSource.length : 0,
                current: 1
              }
      }));
  }

  componentDidMount() {
    const { filter, formFilters } = this.props;
    this.fetchData({
      filter: filter,
      formFilters: formFilters
    });
  }

  fetchData = ({
    page = 1,
    sortField,
    sortOrder,
    filter,
    formFilters
  } = {}) => {
    const {
      url,
      onChangeTotalCount,
      remote,
      sourceKey,
      onGetResponse
    } = this.props;
    const { pagination } = this.state;
    const pageSize = pagination === false ? null : pagination.pageSize,
      pageOrder = pagination === false ? null : page;
    if (!remote) return;
    this.setState({ loading: true });
    let formFile = null;
    const hasFormData = formFilters && formFilters.length > 0;
    if (hasFormData) {
      formFile = new FormData();
      formFile.append("filename", formFilters[0].file);
    }
    const queryObject = {
      ...filter,
      ...(pageSize ? { limit: pageSize } : {}),
      ...(pageOrder ? { page: pageOrder } : {})
    };
    sendRequest({
      url: hasFormData ? createURL(url, [], queryObject) : url,
      params: hasFormData ? formFile : queryObject,
      method: hasFormData ? httpMethods.POST : httpMethods.GET,
      headers: hasFormData ? { "Override-Method": "GET" } : {},
      onSuccess: result => {
        if (onChangeTotalCount) onChangeTotalCount(result.count);
        if (onGetResponse) onGetResponse(responseTypes.success, result);
        this.setState(prevState => ({
          dataSource: getObjectFromString(sourceKey, result),
          next: result.next,
          loading: false,
          pagination:
            prevState.pagination === false
              ? false
              : {
                  ...prevState.pagination,
                  total: result.count,
                  current: page
                }
        }));
      },
      onFail: error => {
        if (onGetResponse) onGetResponse(responseTypes.fail, error);
        this.setState({
          dataSource: [],
          loading: false
        });
      }
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    const { filter } = this.props;
    pager.current = pagination.current;
    this.setState(
      prevState => ({
        pagination:
          prevState.pagination === false
            ? false
            : { ...prevState.pagination, current: pagination.current }
      }),
      () => {
        this.fetchData({
          filter,
          size: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order
        });
      }
    );
  };

  onChangeActionButton = (currentAction, e) => {
    this.setState({ currentAction });
  };

  onDatatableAction = () => {
    const { currentAction: currentActionID, selectedRowKeys } = this.state;
    const { actionButtons } = this.props;
    const currentAction = actionButtons.find(
      button => button.id === currentActionID
    );
    if (
      !currentAction ||
      (currentAction.selectionRequired
        ? !selectedRowKeys || !selectedRowKeys.length
        : false)
    )
      return;
    const resultAction = currentAction.reloadData ? this.fetchData : null;

    const formatValue =
      selectedRowKeys.length > 1
        ? selectedRowKeys.join(",")
        : selectedRowKeys[0];

    if (currentAction.confirm) {
      Modal.confirm({
        title: currentAction.title,
        content: currentAction.content.replace("{0}", selectedRowKeys.length),
        okText: "Evet",
        cancelText: "Hayır",
        onOk: () => {
          doCurrentAction();
        },
        onCancel: () => {
          this.hideConfirmModal();
        }
      });
    } else {
      doCurrentAction();
    }

    function doCurrentAction() {
      if (currentAction.loop) {
        for (const iterator of selectedRowKeys) {
          if (currentAction.iteratorParam) {
            currentAction.params[currentAction.iteratorParam] = iterator;
          }
          sendRequest({
            url:
              httpMethods[currentAction.httpType] === httpMethods.GET
                ? currentAction.url.replace("{0}", iterator)
                : currentAction.url,
            method: httpMethods[currentAction.httpType],
            params: currentAction.params && currentAction.params,
            onSuccess: result => {
              if (currentAction.onSuccess) currentAction.onSuccess(result);
            },
            onFail: () => {
              if (currentAction.onFail) currentAction.onFail();
            },
            onFinally: () => {
              if (
                resultAction &&
                selectedRowKeys.indexOf(iterator) === selectedRowKeys.length - 1
              )
                resultAction();
            }
          });
        }
      } else {
        sendRequest({
          url:
            httpMethods[currentAction.httpType] === httpMethods.GET
              ? currentAction.url.replace("{0}", formatValue)
              : currentAction.url,
          method: httpMethods[currentAction.httpType],
          params:
            httpMethods[currentAction.httpType] === httpMethods.GET
              ? currentAction.params
              : {
                  ...currentAction.params,
                  [currentAction.bodyKey]: selectedRowKeys
                },
          onSuccess: result => {
            if (currentAction.onSuccess) currentAction.onSuccess(result);
            if (resultAction) resultAction();
          },
          onFail: () => {
            if (currentAction.onFail) currentAction.onFail();
          }
        });
      }
    }
  };

  actionElements = order => {
    const {
      currentAction: currentActionID,
      selectedRowKeys,
      pagination
    } = this.state;
    const { actionButtons, actionButtonText } = this.props;
    const currentAction = actionButtons.find(
      button => button.id === currentActionID
    );
    if (!actionButtons || !actionButtons.length) return null;
    const options = actionButtons.map((button, index) => (
      <Option
        key={order * actionButtons.length + index + 1}
        value={button.id}
        disabled={button.disabled}
      >
        {button.label}
      </Option>
    ));
    const actionButtonClass =
      pagination && pagination.total > pagination.pageSize
        ? "table-operations"
        : "table-operations-default";
    return (
      <Block className={actionButtonClass}>
        <Select
          className="select"
          onChange={this.onChangeActionButton}
          placeholder="Aksiyon Seçiniz"
        >
          {options}
        </Select>
        <Button
          disabled={
            !currentAction ||
            (currentAction.selectionRequired
              ? !selectedRowKeys || !selectedRowKeys.length
              : false)
          }
          onClick={this.onDatatableAction}
          className="btn btn-primary"
        >
          {actionButtonText}
        </Button>
      </Block>
    );
  };

  hideConfirmModal = () => {
    this.setState({ confirmVisible: false });
  };

  onRow = (row, index) => {
    const { onRowClick } = this.props;
    return {
      onClick: event => {
        if (onRowClick) onRowClick(row, index, event);
      },
      index,
      moveRow: this.moveRow
    };
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { dataSource } = this.state;
    const dragRow = dataSource[dragIndex];

    this.setState(
      update(this.state, {
        dataSource: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]
        }
      }),
      () => {
        const { onDrag } = this.props;
        if (onDrag)
          onDrag(
            { ...dataSource[dragIndex], index: dragIndex },
            { ...dataSource[hoverIndex], index: hoverIndex }
          );
      }
    );
  };

  getColumns = () => {
    const { draggable, columns, effaceable, saveable, rowKey } = this.props;
    this.columns = [
      ...columns.map(column => ({ ...defaultColumnProps, ...column }))
    ];
    if (draggable) this.columns.unshift(draggableColumn);
    if (effaceable)
      this.columns.push({
        title: "Delete",
        dataIndex: "effaceable",
        systemProp: true,
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record[rowKey])}
            >
              <Anchor>Delete</Anchor>
            </Popconfirm>
          ) : null
      });

    if (saveable)
      this.columns.push({
        title: "Save",
        dataIndex: "saveable",
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return (
            <Block>
              {editable ? (
                <Span>
                  <EditableContext.Consumer>
                    {form => (
                      <Anchor
                        onClick={() => this.handleSaveRow(form, record[rowKey])}
                        style={{ marginRight: 8 }}
                      >
                        Save
                      </Anchor>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Sure to cancel?"
                    onConfirm={() => this.cancel(record[rowKey])}
                  >
                    <Anchor>Cancel</Anchor>
                  </Popconfirm>
                </Span>
              ) : (
                <Anchor
                  disabled={editingKey !== ""}
                  onClick={() => this.edit(record[rowKey])}
                >
                  Edit
                </Anchor>
              )}
            </Block>
          );
        }
      });
    return this.columns.map(col => {
      const column = { ...col };
      if (!column.render && (column.formatters || column.renderer)) {
        column.renderer = column.renderer || {};
        column.formatters = column.formatters || [];
        column.render = (cellData, rowData) =>
          getRenderer(
            column.renderer.type,
            column.renderer.props,
            formatData(column.formatters, cellData, rowData),
            rowData
          );
      }
      if (!column.editable) {
        return column;
      }
      return {
        ...column,
        onCell: record => ({
          record,
          inputType: column.inputType,
          editable: column.editable,
          dataIndex: column.dataIndex,
          title: column.title,
          options: column.options,
          url: column.url,
          valueKeyName: column.valueKeyName,
          labelKeyName: column.labelKeyName,
          objectKey: column.objectKey,
          checkCellValue: column.checkCellValue,
          handleSave: this.handleSaveCell
        })
      };
    });
  };

  render() {
    const { pagination, loading, dataSource } = this.state;
    const {
      onRowClick,
      draggable,
      loading: isLoading,
      ...otherProps
    } = this.props;
    const hasData = dataSource && dataSource.length > 0;
    const columns = this.getColumns();
    const editable = this.columns.findIndex(column => column.editable) !== -1;
    const components = {
      body: {
        row:
          draggable && editable
            ? EditableDragableFormRow
            : draggable
            ? DragableBodyRow
            : EditableFormRow,
        cell: EditableCell
      }
    };
    const loadingValue = isDefined(isLoading) ? isLoading : loading;
    return (
      <Block>
        {hasData && this.actionElements(1)}
        <Table
          {...otherProps}
          rowClassName={onRowClick ? "pointer" : ""}
          components={components}
          onChange={this.handleTableChange}
          loading={loadingValue}
          dataSource={dataSource}
          rowSelection={this.rowSelection}
          scroll={this.scroll}
          pagination={pagination}
          locale={this.locale}
          columns={columns}
          onRow={this.onRow}
        />
        {hasData && this.actionElements(2)}
      </Block>
    );
  }
}

Datatable.defaultProps = {
  formFilters: [],
  sourceKey: "results",
  actionButtonText: "Uygula",
  remote: true,
  className: "isoSimpleTable",
  actionButtons: [],
  columns: []
};

Datatable.propTypes = {
  horizontalScroll: PropTypes.bool,
  horizontalScrollSize: PropTypes.number,
  verticalScroll: PropTypes.bool,
  verticalScrollSize: PropTypes.number,
  locale: PropTypes.object,
  dataSource: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.number,
      dataIndex: PropTypes.string.isRequired,
      title: PropTypes.string,
      sorter: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      fixed: PropTypes.oneOf(["left", "right"]),
      render: PropTypes.func,
      editable: PropTypes.bool,
      inputType: PropTypes.string
    })
  ).isRequired,
  effaceable: PropTypes.bool,
  saveable: PropTypes.bool,
  rowKey: PropTypes.string.isRequired,
  onChangeDataSource: PropTypes.func,
  rowSelection: PropTypes.object,
  filter: PropTypes.object,
  formFilters: PropTypes.array,
  url: PropTypes.string,
  onChangeTotalCount: PropTypes.func,
  sourceKey: PropTypes.string,
  actionButtons: PropTypes.array,
  actionButtonText: PropTypes.string,
  onRowClick: PropTypes.func,
  remote: PropTypes.bool,
  draggable: PropTypes.bool,
  onDrag: PropTypes.func,
  onGetResponse: PropTypes.func
};

export default Datatable;

export const DragableDatatable = DragDropContext(HTML5Backend)(Datatable);

export class DatatableBox extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      totalCount: props.dataSource ? props.dataSource.length : 0
    };
  }
  onChangeTotalCount = totalCount => {
    this.setState({
      totalCount
    });
  };

  render() {
    const { totalCount } = this.state;
    const { exportable, exportButtonClick, subtitle, draggable } = this.props;
    const totalCountWithIcon = totalCount ? (
      <>
        {totalCount} Sonuç bulundu
        {exportable && (
          <Icon
            onClick={exportButtonClick}
            type="download"
            className="icon-download"
          />
        )}
      </>
    ) : (
      ""
    );
    const DT = draggable ? DragableDatatable : Datatable;

    return (
      <Box title={subtitle} subtitle={totalCountWithIcon}>
        <DT {...this.props} onChangeTotalCount={this.onChangeTotalCount} />
      </Box>
    );
  }
}
