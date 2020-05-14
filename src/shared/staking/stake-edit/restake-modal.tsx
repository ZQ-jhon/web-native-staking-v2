// @flow
import { t } from "onefx/lib/iso-i18n";
import React, { Component } from "react";
import { connect } from "react-redux";
import { ModalWrapper } from "./modal-wrapper";

export const RestakeModal = connect()(
  class RestakeForm extends Component<{
    bucketIndex: number;
    clickable: JSX.Element;
  }> {
    render(): JSX.Element {
      const { clickable, bucketIndex } = this.props;
      return (
        // @ts-ignore
        <ModalWrapper
          clickable={clickable}
          title={t("my_stake.restake.title", {
            bucketIndex: String(bucketIndex)
          })}
        >
          <p>
            {t("my_stake.restake.title", { bucketIndex: String(bucketIndex) })}
          </p>
        </ModalWrapper>
      );
    }
  }
);
