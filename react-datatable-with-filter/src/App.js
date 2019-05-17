import React from "react";

import DatatableWithFilter from "./components/DatatableWithFilter";
import LayoutContentWrapper from "./components/Layout";

import { inputTypes } from "./components/DynamicForm/constants";

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
    inputType: inputTypes.input.alias,
    key: "name",
    name: "Filter 1",
    pk: "s0",
    active: true
  },
  {
    inputType: inputTypes.input.alias,
    key: "key",
    name: "Filter 2",
    pk: "s1",
    active: true
  },
  {
    inputType: inputTypes.remoteselect.alias,
    key: "inputType",
    name: "Filter 3",
    pk: "s2",
    //url: "", remote url
    valueKeyName: "value",
    labelKeyName: "label",
    objectKey: "",
    active: true
  },
  {
    inputType: inputTypes.select.alias,
    key: "req",
    name: "Filter 4",
    pk: "s3",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        pk: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        pk: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        pk: 2,
        value: "2"
      }
    ]
  },
  {
    inputType: inputTypes.select.alias,
    key: "codex",
    name: "Filter 5",
    pk: "s4",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        pk: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        pk: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        pk: 2,
        value: "2"
      }
    ]
  },
  {
    inputType: inputTypes.select.alias,
    key: "is_searchable",
    name: "Filter 6",
    pk: "s5",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        pk: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        pk: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        pk: 2,
        value: "2"
      }
    ]
  },
  {
    inputType: inputTypes.select.alias,
    key: "is_variant",
    name: "Filter 7",
    pk: "s6",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        pk: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        pk: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        pk: 2,
        value: "2"
      }
    ]
  },
  {
    inputType: inputTypes.select.alias,
    key: "is_variant_listable",
    name: "Filter 8",
    pk: "s7",
    active: true,
    options: [
      {
        key: "false",
        label: "Option 1",
        pk: 0,
        value: "1"
      },
      {
        key: "false",
        label: "Option 2",
        pk: 1,
        value: "2"
      },
      {
        key: "false",
        label: "Option 3",
        pk: 2,
        value: "2"
      }
    ]
  }
];

const filterButtons = [
  {
    id: 1,
    name: "Ürün Tipi: Simple",
    key: "product_type",
    value: "0",
    icon: "tag"
  },
  {
    id: 2,
    name: "Ürün Tipi: Product Meta",
    key: "product_type",
    value: "1",
    icon: "tags"
  },
  {
    id: 3,
    name: "Ürün Tipi: Grouped",
    key: "product_type",
    value: "3",
    icon: "appstore",
    tooltip: "Gruplu"
  }
];

const actionButtons = [
  {
    id: 1,
    label: "Seçilenleri Sil",
    url: "products/{0}",
    httpType: "DELETE",
    reloadData: true,
    loop: true
  },
  {
    id: 2,
    label: "Seçilenleri Excel'e Aktar",
    url:
      "products/detailed/?_fields=product_type__label&_fields=sku&_fields=base_code&_fields=name&_fields=attribute_set__name&_fields=attributes__is_active&format=xls&pk__in={0}",
    httpType: "GET"
  },
  {
    id: 3,
    label: "Seçilenleri CSV'ye Aktar",
    url:
      "products/detailed/?_fields=product_type__label&_fields=sku&_fields=base_code&_fields=name&_fields=attribute_set__name&_fields=attributes__is_active&format=csv&pk__in={0}",
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
  navigator.push(`/products-and-categories/products/product-form/${row.id}`);
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
            filterInputs: filterInputs
          }}
          datatableProps={{
            //onDrag: this.onDrag,
            subtitle: "Sample Datatable",
            //draggable: true,
            columns: columns,
            rowKey: "id",
            //url: getProductsURL, give a source url that can be filtered by service via filter keys.
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
