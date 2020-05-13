// @flow
import {t} from "onefx/lib/iso-i18n";
import React, {Component} from "react";
import {connect} from "react-redux";
import {ModalWrapper} from "./modal-wrapper";

export const UnstakeModal = connect()(
  class UnstakeForm extends Component<{bucketIndex: number, clickable: JSX.Element}, {}> {
    render(): JSX.Element {
      const { clickable, bucketIndex } = this.props;
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={
            // @ts-ignore
            t("my_stake.unstake.title", { bucketIndex })
          }
        >
          <p>{t("my_stake.unstake.desc")}</p>
        </ModalWrapper>
      );
    }
  }
);
