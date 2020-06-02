// @flow
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

type Props = {
  children: any;
  spinning: boolean;
};

export function SpinPreloader({ children, spinning }: Props) {
  return (
    <Spin spinning={spinning} indicator={antIcon}>
      {children}
    </Spin>
  );
}
