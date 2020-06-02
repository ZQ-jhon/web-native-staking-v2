/* eslint-disable no-invalid-this */
// @flow
import { t } from "onefx/lib/iso-i18n";
import { PureComponent } from "react";
import window from "global/window";
import { Form, Input, Button, Divider, Radio, Modal, notification } from "antd";
import Antenna from "iotex-antenna";
// $FlowFixMe
import { WsSignerPlugin } from "iotex-antenna/lib/plugin/ws";
import { fromRau, toRau } from "iotex-antenna/lib/account/utils";
import { fromBytes, fromString } from "iotex-antenna/lib/crypto/address";
import { connect } from "react-redux";
import {
  validateIoAddress,
  validateAddress,
} from "../smart-contract/field-validators";
import { getAntenna } from "../common/get-antenna";
import { CommonMargin } from "../common/common-margin";
import { AmountFormInputItem, IoctlAlert } from "./claim-rewards";
import { N2E_ABI } from "../smart-contract/n2e-abi";
import { Buffer } from "buffer";
import { colors } from "../common/styles/style-color2";
import { CopyButtonClipboardComponent } from "../common/copy-button-clipboard";
import axios from "axios";
// $FlowFixMe
import platform from "platform";
import { ReportTubeIssueModal } from "../tools/report-tube-issue-modal";
import { Flex } from "../common/flex";

type Props = {
  history: any;
  eth: string;
  form: any;
  checkUserIsUS?: boolean;
};

const SWAP_TO_CURRENT = 1;
const SWAP_TO_OTHER = 2;
const GITHUB_API_URL =
  "https://api.github.com/repos/iotexproject/iotex-explorer/releases/latest";
const DEFAULT_DOWNLOAD_LINK =
  "https://github.com/iotexproject/iotex-explorer/releases";

type State = {
  ioAddress: string;
  rewardRau: string;
  ethAddress: string;
  pendingNonce: string;
  claimModalShow: boolean;
  radioValue: number;
  downloadLink: string;
  modalVisible: boolean;
};

@connect((state) => ({
  eth: state.base.eth,
}))
@Form.create({ name: "claim-rewards" })
class MoveToEthWallet extends PureComponent<Props, State> {
  state: State = {
    ioAddress: "",
    rewardRau: "",
    ethAddress: "",
    pendingNonce: "",
    claimModalShow: false,
    radioValue: SWAP_TO_CURRENT,
    downloadLink: DEFAULT_DOWNLOAD_LINK,
    modalVisible: false,
  };

  remoteAntenna: Antenna;

  async componentDidMount(): Promise<void> {
    try {
      this.remoteAntenna = new Antenna("http://api.iotex.one:80/", {
        signer: new WsSignerPlugin("wss://local.iotex.io:64102"),
      });
    } catch (e) {
      notification.error({
        message: `failed to connect to remote wallet: ${e}`,
      });
    }

    const axiosInstance = axios.create({ timeout: 5000 });
    const resp = await axiosInstance.get(GITHUB_API_URL);

    if (resp.status !== 200) {
      return;
    }
    if (!resp.data.assets || !resp.data.assets.length) {
      return;
    }

    const packages = { mac: "", linux: "", window: "" };

    resp.data.assets.forEach((item) => {
      if (/mac.zip$/.test(item.name)) {
        packages.mac = item.browser_download_url;
      }
      if (/.snap$/.test(item.name)) {
        packages.linux = item.browser_download_url;
      }
      if (/.exe$/.test(item.name)) {
        packages.window = item.browser_download_url;
      }
    });

    const osName = (platform.os && platform.os.family) || "";
    if (osName === "OS X") {
      if (packages.mac) {
        this.setState({ downloadLink: packages.mac });
      }
    } else if (
      osName === "Ubuntu" ||
      osName === "Debian" ||
      osName === "Fedora" ||
      osName === "Red Hat" ||
      osName === "SuSE"
    ) {
      if (packages.linux) {
        this.setState({ downloadLink: packages.linux });
      }
    } else if (osName.indexOf("Windows") !== -1 && osName !== "Windows Phone") {
      if (packages.window) {
        this.setState({ downloadLink: packages.window });
      }
    }
  }

  handleAddress = () => {
    this.props.form.validateFields(async (err, value) => {
      if (err) {
        return;
      }
      const { ioAddress } = value;
      const antenna = getAntenna();

      const ethAddress = fromString(ioAddress).stringEth();
      const { accountMeta } = await antenna.iotx.getAccount({
        address: ioAddress,
      });

      this.setState({
        ioAddress,
        ethAddress,
        pendingNonce: accountMeta.pendingNonce, // ? what does this field mean?
        rewardRau: accountMeta.balance,
      });
    });
  };

  handleRadioChange = (e: any) => {
    this.setState({
      radioValue: e.target.value,
    });
  };

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    const isIoAddressError = this.props.form.getFieldError("ioAddress");
    const isTouched = this.props.form.isFieldTouched("ioAddress");

    return (
      <Flex justifyContent="flex-start">
        <Form.Item
          help={t("claim-rewards.io_address.help")}
          label={t("claim-rewards.your_iotex_reward_address")}
        >
          {getFieldDecorator("ioAddress", {
            rules: [
              {
                required: true,
                message: t("claim-rewards.io_address.required"),
              },
              {
                validator: validateIoAddress,
              },
            ],
          })(
            <Input
              style={{ width: 400 }}
              placeholder={t("claim-rewards.io_address.placeholder")}
            />
          )}
        </Form.Item>
        {isTouched && !isIoAddressError && (
          <Button
            type="dashed"
            onClick={this.handleAddress}
            style={{ marginLeft: 10, marginTop: 15 }}
          >
            {t("claim-rewards.your_iotex_reward_confirm")}
          </Button>
        )}
      </Flex>
    );
  };

  renderClaimReward = () => {
    const { ioAddress, rewardRau, ethAddress } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px",
    };
    const errors = form.getFieldsError();
    const hasErrors = Object.values(errors).reduce(
      (acc, cur) => Boolean(cur),
      true
    );
    // if otherEthAddress radio selected but the otherEthAddress input is untouched,  check procedure above is missing the check for this field.
    const isOtherEthAddressChecked =
      this.state.radioValue === SWAP_TO_CURRENT ||
      errors.hasOwnProperty("otherEthAddress");
    const isInValid = hasErrors || !isOtherEthAddressChecked;

    return (
      <div>
        <Divider orientation="left">{t("claim-reward.query_result")}</Divider>
        <Form.Item label={t("claim-reward.reward_address")}>
          <div>{ioAddress}</div>
        </Form.Item>
        <Form.Item label={t("claim-reward.eth_address")}>
          <div>{ethAddress}</div>
        </Form.Item>
        <Form.Item label={t("claim-reward.available_native")}>
          <div>{fromRau(rewardRau, "IOTX")} IOTX</div>
        </Form.Item>
        <AmountFormInputItem
          form={form}
          initialValue={fromRau(rewardRau, "IOTX")}
          label={t("rewards.swap.amount")}
          help={t("rewards.swap.help")}
          min={1020}
          max={1000020}
          unit="IOTX"
        />
        <Form.Item label={t("tools.swap_eth_address")}>
          <Radio.Group
            onChange={this.handleRadioChange}
            value={this.state.radioValue}
          >
            <Radio style={radioStyle} value={1}>
              {t("tools.current_eth_addr", { ethAddress })}
            </Radio>
            <Radio style={radioStyle} value={2}>
              {t("tools.another_eth_addr")}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {this.state.radioValue === SWAP_TO_OTHER ? (
          <Form.Item>
            {getFieldDecorator("otherEthAddress", {
              rules: [
                {
                  required: true,
                  message: t("tools.eth_addr_required"),
                },
                {
                  validator: validateAddress,
                },
              ],
            })(
              <Input
                className="form-input"
                placeholder={t("tools.eth_addr_required")}
              />
            )}
          </Form.Item>
        ) : null}
        <Form.Item>
          <Button
            style={{ marginRight: "10px" }}
            type={"primary"}
            htmlType="submit"
            disabled={isInValid}
            onClick={() => this.setState({ claimModalShow: true })}
          >
            {t("tools.continue_to_swap")}
          </Button>
        </Form.Item>
        <a
          onClick={() => {
            this.setState({ modalVisible: true });
          }}
        >
          {t("tools.report_tube_problem")}
        </a>
      </div>
    );
  };

  claimModal = () => {
    const { ioAddress, downloadLink } = this.state;
    const { getFieldValue } = this.props.form;
    const str =
      this.state.radioValue === SWAP_TO_CURRENT
        ? "d0e30db0"
        : `b760faf9000000000000000000000000 ${getFieldValue(
            "otherEthAddress"
          )}`;
    const code = `ioctl action invoke io1p99pprm79rftj4r6kenfjcp8jkp6zc6mytuah5 ${this.getCreditsToSwap()} -s ${ioAddress} -l 400000 -p 1 -b ${str}`;

    return (
      <SwapCodeModal
        downloadLink={downloadLink}
        openIotexWallet={this.openIotexWallet}
        show={this.state.claimModalShow}
        code={code}
        onClose={() => this.setState({ claimModalShow: false })}
      />
    );
  };

  openIotexWallet = () => {
    const { ethAddress } = this.state;
    this.props.form.validateFields((err, value) => {
      if (err) {
        return;
      }
      let ethAddr = "";
      if (this.state.radioValue === SWAP_TO_OTHER) {
        ethAddr = value.otherEthAddress;
      } else {
        ethAddr = ethAddress;
      }
      if (!ethAddr) return;
      const amount = this.getCreditsToSwap();
      const ioAddress = fromBytes(
        Buffer.from(String(ethAddr).replace(/^0x/, ""), "hex")
      ).string();

      this.remoteAntenna.iotx
        .executeContract(
          {
            contractAddress: "io1p99pprm79rftj4r6kenfjcp8jkp6zc6mytuah5",
            amount: toRau(amount, "Iotx"),
            abi: JSON.stringify(N2E_ABI),
            method:
              this.state.radioValue === SWAP_TO_OTHER ? "depositTo" : "deposit",
            gasLimit: "300000",
            gasPrice: toRau("1", "Qev"),
            from: "",
          },
          ...(this.state.radioValue === SWAP_TO_OTHER ? [ioAddress] : [])
        )
        .then((hash) => {
          window.console.log(hash);
        })
        .catch((err) => {
          notification.error({
            message: `failed to execute contract: ${err}`,
            duration: 5,
          });
          window.console.error(`failed to exec contract: ${err}`);
        });
    });
  };

  getCreditsToSwap() {
    return (this.props.form.getFieldsValue() || {}).amount || 0;
  }

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  render() {
    const { checkUserIsUS } = this.props;
    if (checkUserIsUS) {
      return (
        <div>
          <h1>{t("profile.move_to_eth_wallet")}</h1>
          <div>{t("tools.us_warning")}</div>
        </div>
      );
    }
    const { ioAddress } = this.state;
    const updateIoctl =
      "curl https://raw.githubusercontent.com/iotexproject/iotex-core/master/install-cli.sh | sh";
    return (
      <div>
        <ReportTubeIssueModal
          closeModal={this.closeModal}
          modalVisible={this.state.modalVisible}
          initialSwapType={2}
        />
        <h1>{t("profile.move_to_eth_wallet")}</h1>
        <CommonMargin />
        <IoctlAlert message={t("rewards.tools.update")} code={updateIoctl} />
        <CommonMargin />

        {this.renderForm()}
        <Form>
          {ioAddress && this.renderClaimReward()}
          {this.claimModal()}
        </Form>
      </div>
    );
  }
}

export function SwapCodeModal({
  show,
  code,
  onClose,
  downloadLink,
  openIotexWallet,
}: {
  show: boolean;
  code?: string;
  onClose: Function;
  downloadLink: string;
  openIotexWallet: Function;
}) {
  return (
    <Modal
      style={{ top: 100 }}
      title={<b>{t("claim-reward.swap_iotx_to_iotxe")}</b>}
      visible={show}
      onCancel={() => onClose()}
      footer={null}
    >
      <div>{t("claim-reward.desktop_wallet")}</div>
      <Flex column marginTop="10px" marginLeft="20px" alignItems="initial">
        <Button type="primary" onClick={() => openIotexWallet()}>
          {t("claim-reward.open_desktop_wallet")}
        </Button>
        <Button style={{ marginTop: 10, marginBottom: 15 }}>
          <a href={downloadLink}>{t("claim-reward.download_desktop_wallet")}</a>
        </Button>
      </Flex>
      <div>{t("claim-reward.use_ioctl")}</div>
      <div
        style={{
          backgroundColor: colors.black10,
          padding: 15,
          marginLeft: 20,
          marginTop: 15,
        }}
      >
        <span>{code}</span>{" "}
        <CopyButtonClipboardComponent text={String(code)} size={"default"} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <Button size="large" type="primary" onClick={() => onClose()}>
          {t("claim-reward.ok")}
        </Button>
      </div>
    </Modal>
  );
}

export { MoveToEthWallet };
