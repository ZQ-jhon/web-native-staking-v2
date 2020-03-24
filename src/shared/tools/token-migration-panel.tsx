import Button from "antd/lib/button";
import Input from "antd/lib/input";
import gql from "graphql-tag";
import { fromBytes, fromString } from "iotex-antenna/lib/crypto/address";
import { Query, QueryResult } from "react-apollo";
import { MetamaskRequired } from "../common/metamask-required";

import { Alert, Form, notification } from "antd";
import { t } from "onefx/lib/iso-i18n";
import React, { PureComponent, useEffect, useState } from "react";
import { Preloader } from "../common/preloader";
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

const tips = "mapping IoTeX address you would like to migrate to";

// tslint:disable-next-line:max-func-body-length
const RawForm = () => {
  const [form] = Form.useForm();
  const [ioAddress, setIoAddress] = useState({
    value: "",
    errorMsg: "",
    validateStatus: ""
  });
  const [isPending, setIsPending] = useState(false);
  const [isOk, setIsOk] = useState(false);

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
        from: window.web3.eth.accounts[0],
        gasLimit: 41000
      });
      setIsOk(true);
    } catch (e) {
      notification.error({ message: `failed to register: ${e}` });
    } finally {
      setIsPending(false);
    }
  };
  const help = ioAddress.errorMsg || tips;

  useEffect(() => {
    (async () => {
      // @ts-ignore
      const curEth = window.web3.eth.accounts[0];
      const contract = lazyLoadTokenMigrationContract();
      const ioAddrE = await contract.ioAddress(curEth, { from: curEth });
      if (
        !ioAddrE ||
        !ioAddrE[0] ||
        ioAddrE[0] === "0x0000000000000000000000000000000000000000"
      ) {
        return;
      }
      const hexStr = String(ioAddrE[0]).replace("0x", "");
      const hex = Buffer.from(hexStr, "hex");
      const ioAddress = fromBytes(hex).string();
      form.setFieldsValue({ ioAddress });
    })();
  }, []);
  return (
    // @ts-ignore
    <Form onFinish={onFinish} form={form}>
      {/*
      // @ts-ignore */}
      <Form.Item
        {...formItemLayout}
        label="IOTX-E Address"
        name={"etherAddress"}
        help={t("ETH address you will migrate off from")}
      >
        <Input
          disabled={true}
          defaultValue={
            // @ts-ignore
            window.web3.eth.accounts[0]
          }
        />
      </Form.Item>

      <Form.Item
        {...formItemLayout}
        label="Native IOTX Address"
        // @ts-ignore
        validateStatus={ioAddress.validateStatus}
        help={help}
        name={"ioAddress"}
      >
        <Input
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

const QUERY = gql`
  query {
    articles(id: "en/address-mapping") {
      title
      contentHTML
    }
  }
`;

export class TokenMigrationPane extends PureComponent {
  render(): JSX.Element {
    return (
      <div>
        <Query query={QUERY} variables={{}}>
          {({
            data,
            error,
            loading
          }: QueryResult<{
            articles: Array<{ title: string; contentHTML: string }>;
          }>) => {
            if (loading || error || !data) {
              return <Preloader />;
            }

            return (
              <>
                {/* tslint:disable-next-line:react-no-dangerous-html */}
                <h1
                  dangerouslySetInnerHTML={{ __html: data.articles[0].title }}
                />
                {/* tslint:disable-next-line:react-no-dangerous-html */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: data.articles[0].contentHTML
                  }}
                />
              </>
            );
          }}
        </Query>
        <RawFormWrapper />
      </div>
    );
  }
}
