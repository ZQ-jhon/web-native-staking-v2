import Button from "antd/lib/button";
import Input from "antd/lib/input";
import { fromString } from "iotex-antenna/lib/crypto/address";
import { MetamaskRequired } from "../common/metamask-required";

import { Alert, Form, notification } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent, useState } from "react";
import { lazyLoadTokenMigrationContract } from "../common/token-migration-contract";

function validateIoAddress(
  value: string
): { validateStatus: string; errorMsg: string | null } {
  if (
    value &&
    (String(value).length !== 41 || !String(value).startsWith("io"))
  ) {
    return {
      validateStatus: "error",
      errorMsg: t("my_stake.ioAddress.err")
    };
  }
  return {
    validateStatus: "success",
    errorMsg: null
  };
}

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 12 }
};

@MetamaskRequired
class RawFormWrapper extends PureComponent {
  render(): JSX.Element {
    return <RawForm />;
  }
}

const RawForm = () => {
  const [ioAddress, setIoAddress] = useState({
    value: "",
    errorMsg: "",
    validateStatus: ""
  });
  const [isPending, setIsPending] = useState(false);
  const [isOk, setIsOk] = useState(false);

  const tips = "mapping IoTeX address you would like to migrate to";

  // tslint:disable-next-line:no-any
  const onIoAddressChange = (event: any) => {
    if (!event || !event.target || !event.target.value) {
      return;
    }
    const value = event.target.value;
    // @ts-ignore
    setIoAddress({
      ...validateIoAddress(value),
      value
    });
  };

  // tslint:disable-next-line:no-any
  const onFinish = async (fieldsValue: Record<any, any>) => {
    if (!fieldsValue.ioAddress) {
      setIoAddress({
        value: fieldsValue.ioAddress,
        validateStatus: "error",
        errorMsg: t("my_stake.ioAddress.err")
      });
      return;
    }

    setIsPending(true);
    try {
      const ethAddress = fromString(fieldsValue.ioAddress).stringEth();
      const contract = lazyLoadTokenMigrationContract();
      await contract.register(ethAddress, {
        // @ts-ignore
        from: window.web3.eth.accounts[0]
      });
      setIsOk(true);
    } catch (e) {
      notification.error({ message: `failed to register: ${e}` });
    } finally {
      setIsPending(false);
    }
  };
  const help = ioAddress.errorMsg || tips;

  return (
    // @ts-ignore
    <Form onFinish={onFinish}>
      <Form.Item
        {...formItemLayout}
        label="IoTeX Address"
        // @ts-ignore
        validateStatus={ioAddress.validateStatus}
        help={help}
        name={"ioAddress"}
      >
        <Input
          value={ioAddress.value}
          onChange={onIoAddressChange}
          placeholder="io17rvgd2czf2x760q0ejhmvlgldlcj0x8xearedp"
        />
      </Form.Item>
      <Form.Item {...formItemLayout}>
        <Button loading={isPending} type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

      {isOk && (
        <Alert
          showIcon={true}
          type="success"
          message={t("migration.success")}
        />
      )}
    </Form>
  );
};

export class TokenMigrationPane extends PureComponent {
  render(): JSX.Element {
    return (
      <div>
        <h1>{t("migration.title")}</h1>
        {/* tslint:disable-next-line:react-no-dangerous-html */}
        <div dangerouslySetInnerHTML={{ __html: t("migration.desc") }} />
        <RawFormWrapper />
      </div>
    );
  }
}
