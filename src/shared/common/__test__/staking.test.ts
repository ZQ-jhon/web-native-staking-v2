import test from "ava";
import { Staking } from "../staking";

test("getAllCandidates", async t => {
  const st = new Staking();
  const resp = await st.getAllCandidates(0, 100);
  t.truthy(resp.length > 0);
});
