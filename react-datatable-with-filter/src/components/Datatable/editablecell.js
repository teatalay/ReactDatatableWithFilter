import React from "react";
import { Input, InputNumber, Form, Select } from "antd";
import Block from "../Block";
import TableRow from "../TableRow";
import TableCell from "../TableCell";
import RemoteSelect from "../RemoteSelect";
import { getObjectFromString, mergeObjects } from "../../utils";

const Option = Select.Option;
const FormItem = Form.Item;
export const EditableContext = React.createContext();

const EditableRow = ({ form, index, moveRow, ...props }) => (
  <EditableContext.Provider value={form}>
    <TableRow {...props} />
  </EditableContext.Provider>
);

const EditableWrapper = WrappedComponent => ({ form, ...props }) => (
  <EditableContext.Provider value={form}>
    <WrappedComponent {...props} />
  </EditableContext.Provider>
);

export const EditableFormRow = Form.create()(EditableRow);
export const EditableFormRowWrapper = WrapperComponent =>
  Form.create()(EditableWrapper(WrapperComponent));

export class EditableCell extends React.Component {
  state = {
    editing: false
  };

  getInput = props => {
    const { inputType } = this.props;
    if (inputType === "number") {
      return <InputNumber {...props} />;
    } else if (inputType === "select") {
      const { valueKeyName, labelKeyName } = this.props;
      const options = this.props.options.map(item => (
        <Option
          value={getObjectFromString(valueKeyName, item)}
          key={getObjectFromString(valueKeyName, item)}
        >
          {getObjectFromString(labelKeyName, item)}
        </Option>
      ));
      return <Select {...props}>{options}</Select>;
    } else if (inputType === "remoteselect") {
      const { url, valueKeyName, labelKeyName, objectKey } = this.props;
      return (
        <RemoteSelect
          url={url}
          valueKeyName={valueKeyName}
          labelKeyName={labelKeyName}
          objectKey={objectKey}
          remote={true}
          {...props}
        />
      );
    } else return <Input {...props} />;
  };

  toggleEdit = () => {
    const { record, checkCellValue } = this.props;
    let editing;
    if (checkCellValue && checkCellValue(record)) {
      editing = false;
    } else {
      editing = !this.state.editing;
    }
    this.setState({ editing }, () => {
      if (editing && this.input && this.input.focus) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (
        error &&
        e &&
        e.currentTarget &&
        e.currentTarget.id &&
        error[e.currentTarget.id]
      ) {
        return;
      }
      this.toggleEdit();
      handleSave(mergeObjects(record, values));
    });
  };

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      inputType,
      handleSave,
      options,
      url,
      valueKeyName,
      labelKeyName,
      objectKey,
      moveRow,
      checkCellValue,
      ...restProps
    } = this.props;
    return (
      <TableCell {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {form => {
              this.form = form;
              return editing ? (
                <FormItem style={{ margin: 0 }}>
                  {form.getFieldDecorator(dataIndex, {
                    rules: [
                      {
                        required: true,
                        message: `${title} is required.`
                      }
                    ],
                    initialValue: getObjectFromString(dataIndex, record)
                  })(
                    this.getInput({
                      ref: node => {
                        this.input = node;
                      },
                      onPressEnter: this.save,
                      onBlur: this.save
                    })
                  )}
                </FormItem>
              ) : (
                <Block
                  className="editable-cell-value-wrap"
                  style={{ paddingRight: 24 }}
                  onClick={this.toggleEdit}
                >
                  {restProps.children}
                </Block>
              );
            }}
          </EditableContext.Consumer>
        ) : (
          restProps.children
        )}
      </TableCell>
    );
  }
}
