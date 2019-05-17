import React from "react";
import { Icon } from "antd";

import Image from "../Image";
import Span from "../Span";
import Anchor from "../Anchor";

import { createURL, getObjectFromString } from "../../utils";
import classNameMapper from "../../constants/classNameMapper";
import routes from "../../constants/routes";

export default function(type, props = {}, cellData, rowData) {
  switch (type) {
    case "image":
      return image(cellData, props);
    case "clickable":
      return clickable(cellData, rowData, props);
    case "text":
    default:
      return text(cellData, props);
  }
}

function image(data, props = {}) {
  const className = getClassName(data ? "cell-image" : "cell-icon", props);
  return data ? (
    <Image className={className} src={data} {...props} />
  ) : (
    <Icon className={className} type="picture" {...props} />
  );
}

function text(data, props = {}) {
  const className = getClassName("", props);
  return (
    <Span {...props} className={className}>
      {data}
    </Span>
  );
}

function clickable(data, rowData, props = {}) {
  const className = getClassName("", props);
  if (props.route || props.query) {
    let route = routes.find(route => route.alias === props.target);
    if (!route) route = routes.find(route => route.default);
    props.href = createURL(
      route.path,
      props.route.fromObject
        ? getObjectFromString(props.route.fromObject, rowData)
        : props.route.param,
      props.query
    );
  }
  return (
    <Anchor {...props} className={className}>
      {data}
    </Anchor>
  );
}

function getClassName(className = "", props = {}) {
  let result = "";
  if (props.color) result = result.concat(`${props.color} `);
  if (props.bold) result = result.concat(`${classNameMapper("bold")} `);
  return result && className
    ? className.concat(` ${result.substr(0, result.length - 1)}`)
    : result
    ? result
    : className;
}

/*
  Props'tan alınacak değer row veya cell datasında olabilir.
  getClassName'den dönenler props'tan kaldırılmalı.
*/
