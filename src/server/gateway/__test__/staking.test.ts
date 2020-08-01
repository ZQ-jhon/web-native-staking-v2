import test from "ava";
import Antenna from "iotex-antenna/lib";
import { Staking } from "../staking";

test("getAllCandidates", async t => {
  const st = new Staking({
    antenna: new Antenna("https://api.iotex.one")
  });
  const height = await st.getHeight();
  const resp = await st.getAllCandidates(0, 1000, height);
  t.truthy(resp.length > 0);
});

test("getCandidate", async t => {
  const st = new Staking({
    antenna: new Antenna("https://api.iotex.one")
  });
  const height = await st.getHeight();
  const resp = await st.getCandidate("staking4all", height);
  t.truthy(resp.name);
});
