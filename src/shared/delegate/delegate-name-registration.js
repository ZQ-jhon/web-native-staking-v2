import { Component } from "react";
import { ContentPadding } from "../common/styles/style-padding";
import { NameRegistrationContainer } from "../smart-contract/name-registration";

class DelgeateNameRegistration extends Component {
  render() {
    return (
      <ContentPadding>
        <NameRegistrationContainer />
      </ContentPadding>
    );
  }
}
export { DelgeateNameRegistration };
