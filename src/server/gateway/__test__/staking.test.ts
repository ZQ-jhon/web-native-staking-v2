import test from "ava";
import { Staking } from "../staking";

test("getAllCandidates", async t => {
  const st = new Staking();
  const height = await st.getHeight();
  const resp = await st.getAllCandidates(0, 1000, height);
  t.truthy(resp.length > 0);
});
