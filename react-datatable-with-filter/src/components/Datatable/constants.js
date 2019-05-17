import React from "react";
import { Icon } from "antd";

export const defaultHorizontalScroll = 1500;
export const defaultVerticalScroll = 400;
export const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSize: 20,
  pageSizeOptions: ["5", "10", "20", "50"],
  hideOnSinglePage: true,
  position: "both"
};
export const defaultColumnProps = {
  align: "center"
};
export const locale = {
  filterConfirm: "Tamam",
  filterReset: "Temizle",
  emptyText: "Aradığınız kriterlere uygun veri bulunamadı."
};
export const draggableColumn = {
  width: "10px",
  title: "",
  render: () => <Icon type="menu" />
};
