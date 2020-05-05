import Icon from "@ant-design/icons";
import {Button} from "antd";
import {t} from "onefx/lib/iso-i18n";
import React, {useState} from "react";
import Helmet from "react-helmet";
import {CommonMargin} from "../common/common-margin";
import {ContentPadding} from "../common/styles/style-padding";
import {VoteNowContainer} from "./vote-now-steps/vote-now-container";

export const VoteSampleLayout = () => {
  const [showVoteNowModal, setShowVoteNowModal] = useState(false);
  return (
    <ContentPadding>
      <Helmet title={`sample vote button`} />
      <CommonMargin />
      <Button type={"primary"}
              size={"large"}
              onClick={()=>setShowVoteNowModal(true)}>
          <span>
              <Icon type="plus" /> {t("my_stake.new_vote")}
          </span>
      </Button>
      {showVoteNowModal && (
        // @ts-ignore
        <VoteNowContainer
          registeredName={""}
          displayOthers={false}
          forceDisplayModal={showVoteNowModal}
          requestDismiss={() => setShowVoteNowModal(false)}
        />
      )}
    </ContentPadding>
  );
};
