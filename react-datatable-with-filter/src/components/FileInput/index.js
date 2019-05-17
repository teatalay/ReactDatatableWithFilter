import React, { Component } from "react";
import { Upload } from "antd";

class FileInput extends Component {
  onInputImported = (file, fileList) => {
    const { onChange , singleAction } = this.props;
    if (onChange)  onChange(singleAction ? fileList[fileList.length - 1 ] : fileList);
    return false;
  };

  render() {
    const {
      accept,
      disabled,
      listType,
      multiple,
      showUploadList,
      onPreview,
      onRemove,
      defaultFileList,
      children
    } = this.props;
    return (
      <Upload
        beforeUpload={this.onInputImported}
        accept={accept}
        disabled={disabled}
        listType={listType}
        defaultFileList={defaultFileList}
        multiple={multiple}
        showUploadList={showUploadList}
        onPreview={onPreview}
        onRemove={onRemove}
      >
        {children}
      </Upload>
    );
  }
}

export default FileInput;
