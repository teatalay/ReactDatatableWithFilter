import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { EditableFormRowWrapper } from "./editablecell";

import "./style.scss";

class BodyRow extends React.Component {
  dragingIndex = -1;
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
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
      checkCellValue,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: "move" };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > this.dragingIndex) {
        className += " drop-over-downward";
      }
      if (restProps.index < this.dragingIndex) {
        className += " drop-over-upward";
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr {...restProps} className={className} style={style} />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    this.dragingIndex = props.index;
    return {
      index: props.index
    };
  }
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

export const DragableBodyRow = DropTarget(
  "row",
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  })
)(
  DragSource("row", rowSource, connect => ({
    connectDragSource: connect.dragSource()
  }))(BodyRow)
);

export const EditableDragableFormRow = DropTarget(
  "row",
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  })
)(
  DragSource("row", rowSource, connect => ({
    connectDragSource: connect.dragSource()
  }))(EditableFormRowWrapper(BodyRow))
);
