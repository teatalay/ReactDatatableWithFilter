import React from "react";

import DatatableWithFilter from "./components/DatatableWithFilter";
import LayoutContentWrapper from "./components/Layout";

import { inputTypes } from "./components/DynamicForm/constants";

import {
  removeProductsURL,
  exportExcellURL,
  exportCSVURL,
  getProductsURL
} from "./constants/serviceUrls";

import "antd/dist/antd.css";
import "./App.css";

const columns = [
  {
    key: 1,
    dataIndex: "productimage_set[0].image",
    title: "Resim",
    renderer: { type: "image", props: {} }
  },
  {
    key: 2,
    dataIndex: "product_type.label",
    title: "Ürün Tipi"
  },
  {
    key: 3,
    dataIndex: "sku",
    sorter: true,
    title: "SKU",
    editable: true
  },
  {
    key: 4,
    dataIndex: "base_code",
    title: "Base Code",
    renderer: {
      type: "clickable",
      props: { target: "form", route: { fromObject: "base_code" } }
    }
  },
  {
    key: 5,
    dataIndex: "name",
    title: "Ürün Adı",
    renderer: { type: "text", props: { color: "red", bold: true } },
    formatters: [{ type: "lower" }, { type: "cut", props: { size: 7 } }],
    editable: true
  },
  {
    key: 6,
    dataIndex: "attribute_set.name",
    title: "Özellik Seti",
    formatters: [{ type: "lower" }, { type: "cut", props: { size: 7 } }],
    editable: true
  },
  {
    key: 7,
    dataIndex: "is_active",
    title: "Durum"
  },
  {
    key: 8,
    dataIndex: "is_active",
    title: "Durum (Servis)",
    formatters: [{ type: "bool" }]
  }
];

const filterInputs = [
  {
    id: 1,
    inputType: inputTypes.input.alias,
    key: "name",
    name: "Filter 1",
    active: true
  },
  {
    id: 2,
    inputType: inputTypes.input.alias,
    key: "key",
    name: "Filter 2",
    active: true
  },
  {
    id: 3,
    inputType: inputTypes.remoteselect.alias,
    key: "inputType",
    name: "Filter 3",
    url: "",
    valueKeyName: "value",
    labelKeyName: "label",
    objectKey: "",
    active: true
  },
  {
    id: 4,
    inputType: inputTypes.select.alias,
    key: "req",
    name: "Filter 4",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        id: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        id: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        id: 2,
        value: "2"
      }
    ]
  },
  {
    id: 5,
    inputType: inputTypes.select.alias,
    key: "codex",
    name: "Filter 5",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        id: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        id: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        id: 2,
        value: "2"
      }
    ]
  },
  {
    id: 6,
    inputType: inputTypes.select.alias,
    key: "is_searchable",
    name: "Filter 6",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        id: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        id: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        id: 2,
        value: "2"
      }
    ]
  },
  {
    id: 7,
    inputType: inputTypes.select.alias,
    key: "is_variant",
    name: "Filter 7",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        id: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        id: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        id: 2,
        value: "2"
      }
    ]
  },
  {
    id: 8,
    inputType: inputTypes.select.alias,
    key: "is_variant_listable",
    name: "Filter 8",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        id: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        id: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        id: 2,
        value: "2"
      }
    ]
  }
];

const filterButtons = [
  {
    id: 1,
    name: "Product Type: Type 1",
    key: "product_type",
    value: "0",
    icon: "tag"
  },
  {
    id: 2,
    name: "Product Type: Type 2",
    key: "product_type",
    value: "1",
    icon: "tags"
  },
  {
    id: 3,
    name: "Product Type: Type 3",
    key: "product_type",
    value: "3",
    icon: "appstore",
    tooltip: "Gruplu"
  }
];

const actionButtons = [
  {
    id: 1,
    label: "Remove Selecteds",
    url: removeProductsURL,
    httpType: "DELETE",
    reloadData: true,
    loop: true
  },
  {
    id: 2,
    label: "Download as Excel Selecteds",
    url: exportExcellURL,
    httpType: "GET"
  },
  {
    id: 3,
    label: "Download as CSV Selecteds",
    url: exportCSVURL,
    httpType: "GET"
  }
];

const rowSelection = {
  onRowSelection: (selectedRowKeys, selectedRows) => {
    console.log("selectedRowKeys, selectedRows", selectedRowKeys, selectedRows);
  }
};

function onChangeDataSource(dataSource) {
  //console.log(dataSource);
}

function onRowClick(row, index, e) {
  console.log("row clicked", row);
}

function onDrag(dragIndex, hoverIndex) {
  console.log("dragIndex", dragIndex);
  console.log("hoverIndex", hoverIndex);
}

function App() {
  return (
    <div className="App">
      <LayoutContentWrapper>
        <DatatableWithFilter
          filterProps={{
            filterButtons: filterButtons,
            filterInputs: filterInputs,
            filterViaFile: true
          }}
          datatableProps={{
            onDrag: onDrag,
            subtitle: "Sample Datatable",
            draggable: true,
            columns: columns,
            rowKey: "id",
            url: getProductsURL,
            rowSelection: rowSelection,
            onChangeDataSource: onChangeDataSource,
            actionButtons: actionButtons,
            onRowClick: onRowClick
          }}
        />
      </LayoutContentWrapper>
    </div>
  );
}

export default App;
