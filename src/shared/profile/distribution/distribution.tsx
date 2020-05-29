/* eslint-disable no-invalid-this */
// @flow
import React, { Component } from "react";
import {
  Button,
  Icon,
  Layout,
  message,
  Modal,
  Popover,
  Table,
  Upload
} from "antd";
import { styled } from "onefx/lib/styletron-react";
import { t } from "onefx/lib/iso-i18n";
import Papa from "papaparse";
import window from "global/window";
import CsvDownloader from "react-csv-downloader";
import { connect } from "react-redux";
import { fromRau } from "iotex-antenna/lib/account/utils";
import EthContract from "ethjs-contract";
import { MultiSendInstructions } from "../../tools/multi-send-erc20.page";
import Eth from "../../common/ethjs-query";
import type { RewardBuckets } from "../../common/multi-send-button";
import { MultiSendButton } from "../../common/multi-send-button";
import { TOKEN_ABI } from "../../smart-contract/token-abi";
import { MetamaskRequired } from "../../smart-contract/metamask-required";
import { GreySpan } from "./distribution-styles";

function UploadWhatRewardTable({ children }: any) {
  return (
    <div>
      <p>{t("rewards.distribution.upload_info")}</p>
      <p style={{ marginBottom: 24 }}>
        {t("rewards.distribution.upload_info_2")}
      </p>
      {children}
    </div>
  );
}

type Props = {
  tokenContractAddr?: any
};

type State = {
  loadingBadges: boolean,
  uploadModalShow: boolean,
  dataList: RewardBuckets,
  showList: boolean,
  showRecord: boolean
};

// @Form.create({name: 'move-to-eth'})

@MetamaskRequired
@connect(state => ({
  tokenContractAddr: state.smartContract.tokenContractAddr
}))
class Distribution extends Component<Props, State> {
  props: Props;
  state: State;

  // axios: any;

  constructor() {
    super();
    this.state = {
      loadingBadges: false,
      uploadModalShow: false,
      dataList: [],
      showList: false,
      showRecord: false
    };
  }

  distributionRecord = () => {
    const columns = [
      {
        title: "Recipient Address",
        dataIndex: "ra",
        width: 150,
        render: text => {
          return (
            <Popover content={text}>
              {text.replace(text.substr(4, text.length - 8), "...")}
            </Popover>
          );
        }
      },
      {
        title: "Tx Hash",
        dataIndex: "hash",
        width: 150,
        render: text => {
          return (
            <Popover content={text}>
              {text.replace(text.substr(4, text.length - 8), "...")}
            </Popover>
          );
        }
      },
      {
        title: "Amount",
        dataIndex: "at",
        width: 150,
        render: text => {
          return `${text} IOTX-E`;
        }
      }
    ];

    const data1 = [];
    for (let i = 0; i < 50; i++) {
      data1.push({
        key: i,
        ra: "0xAF8c006965bEC0C4a725DC32F586BDe34e72A60c",
        hash: "0x84330CB7F2c7A88466c7dc4F558973b81B004321",
        at: 664.21
      });
    }
    return (
      <div style={{ width: "80%" }}>
        {this.renderTitle(t("profile.rewards.distribute_record"))}
        <Table
          columns={columns}
          dataSource={data1}
          size="small"
          scroll={{ y: 188 }}
          pagination={false}
        />
        <BottomBtns className="btn-group">
          <Button
            type="primary"
            onClick={() => this.setState({ showRecord: false })}
          >
            {t("my-profile.ok")}
          </Button>
          <CsvDownloader datas={data1} filename="distribution-record">
            <Button style={{ marginLeft: 10 }}>
              <Icon type="download" />
            </Button>
          </CsvDownloader>
          <p style={{ marginTop: 5 }}>
            <GreySpan>{t("profile.rewards.confirm.content")}</GreySpan>
          </p>
        </BottomBtns>
      </div>
    );
  };

  renderDistributionPlan = () => {
    return (
      <div>
        <UploadWhatRewardTable>
          <Button
            type="primary"
            onClick={() => this.setState({ uploadModalShow: true })}
          >
            {t("profile.rewards.upload")}
          </Button>
        </UploadWhatRewardTable>
      </div>
    );
  };

  renderTitle = (title: string, tip?: boolean) => {
    const { showRecord } = this.state;
    let sectionText = "";
    if (showRecord) {
      sectionText = t("profile.rewards.send", { sendAmount: "amount" });
    } else {
      sectionText = null;
    }

    return (
      <React.Fragment>
        <ContentTitle>{title}</ContentTitle>
        {sectionText && (
          <ContentSection>
            {sectionText}
            {tip && (
              <RedSpan>
                {t("profile.rewards.listtips", { tipAmount: "amount" })}
              </RedSpan>
            )}
          </ContentSection>
        )}
      </React.Fragment>
    );
  };

  beforeUpload = (file: any) => {
    const isCSV = file.type === "text/csv";
    if (!isCSV) {
      message.error("You can only upload CSV file!");
    }

    Papa.parse(file, {
      header: false,
      delimiter: ",",
      skipEmptyLines: true,
      complete: results => {
        this.setState(
          {
            dataList: this.parseDataList(results.data),
            uploadModalShow: false,
            showList: true
          },
          () => {
            window.console.log(this.state.dataList);
            window.scrollTo({ top: 0, behavior: "smooth" });
            message.success(`${file.name} upload success!`);
          }
        );
        return false;
      }
    });
    return false;
  };
  parseDataList = (data: any): RewardBuckets => {
    const ifHeader = data.length > 0 && String(data[0]).includes("voter");
    const bodyData = ifHeader ? data.slice(1) : data;
    if (bodyData.length > 0) {
      // $FlowFixMe
      return bodyData.map(arr => {
        const obj = {};
        obj.recipient = arr[0];
        obj.amount = fromRau(arr[1], "Iotx");
        return obj;
      });
    }
    return [];
  };

  uploadModal = () => {
    return (
      <Modal
        style={{ top: 100 }}
        title={<b>{t("profile.rewards.upload")}</b>}
        visible={this.state.uploadModalShow}
        onCancel={() => this.setState({ uploadModalShow: false })}
        footer={null}
      >
        <Upload.Dragger
          multiple={false}
          beforeUpload={file => this.beforeUpload(file)}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">{t("profile.rewards.upload.area")}</p>
        </Upload.Dragger>
      </Modal>
    );
  };

  confirmDistribute = () => {
    this.setState({
      showList: false,
      showRecord: true
    });
  };

  render() {
    const { showList, showRecord, dataList } = this.state;
    const { tokenContractAddr } = this.props;
    return (
      <Layout.Content style={{ padding: "0 24px", minHeight: 280 }}>
        {showList && (
          <DistributionStep
            tokenContractAddr={tokenContractAddr}
            data={dataList}
            confirmAction={this.confirmDistribute}
          />
        )}
        {showRecord && this.distributionRecord()}
        {!showRecord && !showList && this.renderDistributionPlan()}
        {this.uploadModal()}
      </Layout.Content>
    );
  }
}

type ListProps = {
  data: RewardBuckets,
  confirmAction: Function,
  tokenContractAddr?: string
};

class DistributionStep extends React.Component<
  ListProps,
  { amount: string, eth: string }
> {
  getColumns = () => {
    return [
      {
        title: t("rewards.distribution.recipient_address"),
        dataIndex: "recipient",
        width: 385
      },
      {
        title: t("rewards.distribution.amount"),
        dataIndex: "amount",
        width: 150,
        render: text => {
          return `${text} IOTX-E`;
        }
      }
    ];
  };

  state = { amount: "-", eth: "" };

  async componentDidMount(): Promise<void> {
    const { tokenContractAddr } = this.props;
    const addr = window.web3.eth.accounts[0];
    const eth = new Eth(window.web3.currentProvider);
    const tokenContract = new EthContract(eth)(TOKEN_ABI).at(tokenContractAddr);
    const balance = await tokenContract.balanceOf(addr);
    this.setState({
      amount: String(balance[0]),
      eth: addr
    });
  }

  render() {
    const { data } = this.props;
    return (
      <React.Fragment>
        <ContentTitle>{t("profile.rewards.distribute_list")}</ContentTitle>
        <ContentSection>
          <h2>{this.state.eth}</h2>
          <span>
            {t("profile.rewards.available_rewards")} :
            <GreySpan style={{ marginLeft: 20 }}>{`${fromRau(
              this.state.amount,
              "Iotx"
            )} IOTX-E`}</GreySpan>
          </span>
        </ContentSection>
        <DistributionTable
          data={data}
          columns={this.getColumns()}
          downLoadFileName={"distribution-list"}
        >
          <MultiSendInstructions />
          <MultiSendButton
            getProps={() => ({
              buckets: data,
              payload: "web-bp:reward-distribution"
            })}
          />
        </DistributionTable>
      </React.Fragment>
    );
  }
}

type tcProps = {
  data: RewardBuckets,
  columns: Array<{ title: string, dataIndex: string, width: number }>,
  children?: any,
  downLoadFileName?: string
};

class DistributionTable extends Component<tcProps> {
  render() {
    const { data, columns, children, downLoadFileName } = this.props;
    return (
      <div style={{ width: "80%" }}>
        <Table
          columns={columns}
          dataSource={data}
          size="small"
          scroll={{ y: 188 }}
          pagination={false}
        />
        <BottomBtns className="btn-group">
          {children}
          <CsvDownloader datas={data} filename={downLoadFileName}>
            <Button style={{ marginLeft: 10 }}>
              <Icon type="download" />
            </Button>
          </CsvDownloader>
          <MarginTopP>
            <GreySpan>{t("profile.rewards.confirm.content")}</GreySpan>
          </MarginTopP>
        </BottomBtns>
      </div>
    );
  }
}

const ContentTitle = styled("h2", {
  fontWeight: "bold",
  marginTop: "10px"
});

const ContentSection = styled("div", {
  padding: "30px 0",
  fontSize: "18px"
});

const BottomBtns = styled("div", {
  marginTop: "35px"
});

const RedSpan = styled("p", {
  color: "rgb(244,80,83)",
  fontSize: "12px",
  marginBottom: "10px"
});

const MarginTopP = styled("p", {
  marginTop: "10px"
});

export { Distribution };
